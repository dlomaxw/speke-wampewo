import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { auditLog, sessions, users } from '@/db/schema';
import { can, type Permission, type Role } from './rbac';
import { newId } from './ids';

const COOKIE = 'saw_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // a working day
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

function secret() {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 32) {
    // A weak secret makes sessions forgeable. Fail loudly in production rather
    // than silently signing with something guessable.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET must be set to at least 32 characters.');
    }
    return new TextEncoder().encode('dev-only-insecure-secret-change-me-please-32');
  }
  return new TextEncoder().encode(raw);
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
  sessionId: string;
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

async function clientMeta() {
  const h = await headers();
  return {
    ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null,
    userAgent: h.get('user-agent') || null,
  };
}

export async function signIn(email: string, password: string):
  Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const db = await getDb();
  const normalised = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, normalised)).limit(1);

  // Same message and comparable timing whether or not the account exists, so
  // the form cannot be used to enumerate staff addresses.
  const generic = 'Email or password is incorrect.';
  if (!user) {
    await bcrypt.compare(password, '$2a$12$0000000000000000000000000000000000000000000000000000');
    return { ok: false, error: generic };
  }
  if (!user.active) return { ok: false, error: 'This account has been deactivated.' };
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, error: 'Too many attempts. Try again in a few minutes.' };
  }

  const good = await verifyPassword(password, user.passwordHash);
  if (!good) {
    const failed = user.failedAttempts + 1;
    await db.update(users).set({
      failedAttempts: failed,
      lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
    }).where(eq(users.id, user.id));
    return { ok: false, error: generic };
  }

  const meta = await clientMeta();
  const sessionId = newId('sess');
  const expiresAt = new Date(Date.now() + MAX_AGE_SECONDS * 1000);

  await db.insert(sessions).values({
    id: sessionId, userId: user.id, expiresAt, ip: meta.ip, userAgent: meta.userAgent,
  });
  await db.update(users).set({
    failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date(),
  }).where(eq(users.id, user.id));

  const token = await new SignJWT({ uid: user.id, sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });

  await db.insert(auditLog).values({
    actorId: user.id, actorEmail: user.email, action: 'auth.sign_in',
    entity: 'user', entityId: user.id, ip: meta.ip,
  });

  return {
    ok: true,
    user: {
      id: user.id, email: user.email, name: user.name, role: user.role as Role,
      mustChangePassword: user.mustChangePassword, sessionId,
    },
  };
}

/** Returns null rather than throwing, so layouts decide what to do. */
export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    const uid = String(payload.uid || '');
    const sid = String(payload.sid || '');
    if (!uid || !sid) return null;

    const db = await getDb();
    // Re-read every request: a revoked session, deactivated account or role
    // change must take effect immediately, not when the token happens to expire.
    const [row] = await db.select({
      user: users, session: sessions,
    })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.id, sid), eq(sessions.userId, uid)))
      .limit(1);

    if (!row) return null;
    if (row.session.revokedAt) return null;
    if (row.session.expiresAt <= new Date()) return null;
    if (!row.user.active) return null;

    return {
      id: row.user.id,
      email: row.user.email,
      name: row.user.name,
      role: row.user.role as Role,
      mustChangePassword: row.user.mustChangePassword,
      sessionId: row.session.id,
    };
  } catch {
    return null;
  }
}

export async function signOut() {
  const session = await getSession();
  const jar = await cookies();
  if (session) {
    const db = await getDb();
    await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, session.sessionId));
    await db.insert(auditLog).values({
      actorId: session.id, actorEmail: session.email, action: 'auth.sign_out',
      entity: 'user', entityId: session.id,
    });
  }
  jar.delete(COOKIE);
}

/** Redirects to the login page when there is no valid session. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}

export class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Your role does not allow: ${permission}`);
    this.name = 'ForbiddenError';
  }
}

/**
 * Server-side authorisation. Every mutating action calls this — the UI hiding a
 * button is a convenience, this is the control.
 */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const session = await requireUser();
  if (!can(session.role, permission)) throw new ForbiddenError(permission);
  return session;
}

/** Non-redirecting variant for API routes. */
export async function apiUser(permission?: Permission):
  Promise<{ ok: true; user: SessionUser } | { ok: false; status: number; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, status: 401, error: 'Not signed in.' };
  if (permission && !can(session.role, permission)) {
    return { ok: false, status: 403, error: 'Your role does not allow this action.' };
  }
  return { ok: true, user: session };
}

export async function changePassword(userId: string, current: string, next: string):
  Promise<{ ok: true } | { ok: false; error: string }> {
  if (next.length < 12) return { ok: false, error: 'Use at least 12 characters.' };
  if (!/[a-z]/.test(next) || !/[A-Z]/.test(next) || !/[0-9]/.test(next)) {
    return { ok: false, error: 'Include upper case, lower case and a number.' };
  }
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return { ok: false, error: 'Account not found.' };
  if (!(await verifyPassword(current, user.passwordHash))) {
    return { ok: false, error: 'Current password is incorrect.' };
  }
  await db.update(users).set({
    passwordHash: await hashPassword(next),
    mustChangePassword: false,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));

  await db.insert(auditLog).values({
    actorId: userId, actorEmail: user.email, action: 'auth.password_change',
    entity: 'user', entityId: userId,
  });
  return { ok: true };
}

/** Records a sensitive change. Called by every admin mutation. */
export async function audit(entry: {
  actor?: SessionUser | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
}) {
  const db = await getDb();
  const meta = await clientMeta().catch(() => ({ ip: null }));
  await db.insert(auditLog).values({
    actorId: entry.actor?.id ?? null,
    actorEmail: entry.actor?.email ?? 'system',
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    before: (entry.before ?? null) as never,
    after: (entry.after ?? null) as never,
    reason: entry.reason ?? null,
    ip: meta.ip,
  });
}
