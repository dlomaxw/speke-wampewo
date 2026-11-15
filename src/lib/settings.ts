import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { settings } from '@/db/schema';

import { DEFAULT_SETTINGS, type AppSettings } from './constants';

export { DEFAULT_SETTINGS };
export type { AppSettings };

const KEY = 'app';

export async function getSettings(): Promise<AppSettings> {
  try {
    const db = await getDb();
    const [row] = await db.select().from(settings).where(eq(settings.key, KEY)).limit(1);
    const stored = (row?.value ?? {}) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    // A settings read must never take the public site down.
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(patch: Partial<AppSettings>, updatedBy: string) {
  const db = await getDb();
  const current = await getSettings();
  const next = { ...current, ...patch };
  const [existing] = await db.select().from(settings).where(eq(settings.key, KEY)).limit(1);
  if (existing) {
    await db.update(settings)
      .set({ value: next as never, updatedBy, updatedAt: new Date() })
      .where(eq(settings.key, KEY));
  } else {
    await db.insert(settings).values({
      key: KEY, value: next as never, updatedBy,
      description: 'Operational switches for the Wampewo site.',
    });
  }
  return next;
}

export const isProduction = () => process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';
