import 'server-only';
import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { consentRecords, leadActivities, leadTasks, leads, pipelines } from '@/db/schema';
import { dedupeHash, leadReference, newId } from './ids';
import { DEPARTMENT_FOR_ENQUIRY, PIPELINES, PIPELINE_FOR_ENQUIRY } from './constants';

export { DEPARTMENT_FOR_ENQUIRY, PIPELINES, PIPELINE_FOR_ENQUIRY };

/**
 * Lead capture and pipeline management.
 *
 * Every guest-facing form funnels through `captureLead`, so source attribution,
 * department routing, consent and duplicate detection happen in exactly one
 * place rather than being re-implemented per form.
 */

export interface CaptureLeadInput {
  enquiryType: keyof typeof DEPARTMENT_FOR_ENQUIRY | string;
  departmentKey?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  companyName?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  adults?: number;
  children?: number;
  preferredRoomTypeId?: string | null;
  message?: string;
  source?: string;
  sourceDetail?: string;
  utm?: Record<string, string>;
  consentMarketing?: boolean;
  consentWhatsapp?: boolean;
  bookingId?: string;
  ip?: string | null;
}

export async function captureLead(input: CaptureLeadInput) {
  const db = await getDb();

  const pipelineKey = PIPELINE_FOR_ENQUIRY[input.enquiryType] ?? 'accommodation';
  const departmentKey = input.departmentKey ?? DEPARTMENT_FOR_ENQUIRY[input.enquiryType] ?? 'reservations';

  const hash = dedupeHash({
    email: input.email,
    phone: input.phone,
    enquiryType: String(input.enquiryType),
    checkIn: input.checkIn,
    checkOut: input.checkOut,
  });

  // A resubmitted form within the window is recorded as activity on the
  // original lead, not as a second lead the team would chase twice.
  const [existing] = await db.select().from(leads)
    .where(and(eq(leads.dedupeHash, hash), eq(leads.outcome, 'open')))
    .orderBy(desc(leads.createdAt))
    .limit(1);

  if (existing) {
    const recent = Date.now() - new Date(existing.createdAt).getTime() < 1000 * 60 * 60 * 24 * 2;
    if (recent) {
      await db.insert(leadActivities).values({
        leadId: existing.id,
        type: 'system',
        body: 'Duplicate submission received from the website.',
        actorName: 'Website',
        metadata: { message: input.message ?? null } as never,
      });
      return { id: existing.id, reference: existing.reference, duplicate: true };
    }
  }

  const id = newId('lead');
  const reference = leadReference();

  await db.insert(leads).values({
    id,
    reference,
    pipelineKey,
    stage: 'new',
    outcome: 'open',
    enquiryType: String(input.enquiryType),
    firstName: input.firstName,
    lastName: input.lastName ?? null,
    email: input.email?.trim().toLowerCase() ?? null,
    phone: input.phone ?? null,
    country: input.country ?? null,
    companyName: input.companyName ?? null,
    checkIn: input.checkIn ?? null,
    checkOut: input.checkOut ?? null,
    adults: input.adults ?? null,
    children: input.children ?? null,
    preferredRoomTypeId: input.preferredRoomTypeId ?? null,
    message: input.message ?? null,
    source: input.source ?? 'website',
    sourceDetail: input.sourceDetail ?? null,
    departmentKey,
    utm: (input.utm ?? {}) as never,
    bookingId: input.bookingId ?? null,
    dedupeHash: hash,
    duplicateOfId: existing?.id ?? null,
    consentMarketing: Boolean(input.consentMarketing),
    consentWhatsapp: Boolean(input.consentWhatsapp),
    consentRecordedAt: new Date(),
    // Hospitality convention: first response inside a working day.
    nextActionAt: new Date(Date.now() + 1000 * 60 * 60 * 4),
    nextAction: 'First response to the enquiry',
  });

  await db.insert(leadActivities).values({
    leadId: id,
    type: 'system',
    body: `Enquiry received from the website (${input.sourceDetail ?? input.enquiryType}).`,
    actorName: 'Website',
  });

  await db.insert(leadTasks).values({
    id: newId('task'),
    leadId: id,
    title: 'Respond to new enquiry',
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 4),
    status: 'open',
    createdBy: 'system',
  });

  // Consent is recorded separately so it survives a lead being merged or deleted.
  for (const [channel, granted] of [
    ['marketing_email', Boolean(input.consentMarketing)],
    ['whatsapp', Boolean(input.consentWhatsapp)],
  ] as const) {
    if (!granted) continue;
    await db.insert(consentRecords).values({
      subjectEmail: input.email ?? null,
      subjectPhone: input.phone ?? null,
      channel,
      granted: true,
      sourcePage: input.sourceDetail ?? null,
      ip: input.ip ?? null,
    });
  }

  return { id, reference, duplicate: false };
}

export async function ensurePipelines() {
  const db = await getDb();
  for (const [i, p] of Object.values(PIPELINES).entries()) {
    const [row] = await db.select().from(pipelines).where(eq(pipelines.key, p.key)).limit(1);
    if (row) continue;
    await db.insert(pipelines).values({
      id: `pipe_${p.key}`,
      key: p.key,
      name: p.name,
      stages: p.stages as never,
      sortOrder: i,
    });
  }
}

export async function moveStage(params: {
  leadId: string; stage: string; actorId: string; actorName: string;
  outcome?: 'open' | 'won' | 'lost' | 'unqualified'; lostReason?: string;
}) {
  const db = await getDb();
  const [lead] = await db.select().from(leads).where(eq(leads.id, params.leadId)).limit(1);
  if (!lead) throw new Error('Lead not found.');

  const pipeline = PIPELINES[lead.pipelineKey as keyof typeof PIPELINES] ?? PIPELINES.accommodation;
  const stage = pipeline.stages.find((s) => s.key === params.stage);

  // A won stage implies a won outcome unless the caller says otherwise. Lost
  // and unqualified are always explicit, so they never drift into won reporting.
  const outcome = params.outcome ?? (stage?.kind === 'won' ? 'won' : 'open');

  await db.update(leads).set({
    stage: params.stage,
    outcome,
    lostReason: outcome === 'lost' || outcome === 'unqualified' ? params.lostReason ?? null : null,
    updatedAt: new Date(),
  }).where(eq(leads.id, params.leadId));

  await db.insert(leadActivities).values({
    leadId: params.leadId,
    type: 'stage_change',
    body: `Moved from ${lead.stage} to ${params.stage}${outcome !== 'open' ? ` (${outcome})` : ''}.`,
    actorId: params.actorId,
    actorName: params.actorName,
  });
}

export async function assignLead(params: {
  leadId: string; assignedTo: string | null; actorId: string; actorName: string; assigneeName?: string;
}) {
  const db = await getDb();
  await db.update(leads).set({ assignedTo: params.assignedTo, updatedAt: new Date() })
    .where(eq(leads.id, params.leadId));
  await db.insert(leadActivities).values({
    leadId: params.leadId,
    type: 'system',
    body: params.assignedTo ? `Assigned to ${params.assigneeName ?? params.assignedTo}.` : 'Unassigned.',
    actorId: params.actorId,
    actorName: params.actorName,
  });
}

export async function addNote(params: {
  leadId: string; body: string; actorId: string; actorName: string; type?: string;
}) {
  const db = await getDb();
  await db.insert(leadActivities).values({
    leadId: params.leadId,
    type: params.type ?? 'note',
    body: params.body,
    actorId: params.actorId,
    actorName: params.actorName,
  });
  await db.update(leads).set({ updatedAt: new Date() }).where(eq(leads.id, params.leadId));
}

/** Counts by stage for the pipeline board, excluding closed outcomes. */
export async function pipelineSummary(pipelineKey: string) {
  const db = await getDb();
  const rows = await db.select({
    stage: leads.stage,
    outcome: leads.outcome,
    count: sql<number>`count(*)::int`,
  })
    .from(leads)
    .where(eq(leads.pipelineKey, pipelineKey))
    .groupBy(leads.stage, leads.outcome);
  return rows;
}

export async function overdueTasks(assignedTo?: string) {
  const db = await getDb();
  const where = assignedTo
    ? and(eq(leadTasks.status, 'open'), sql`${leadTasks.dueAt} < now()`, eq(leadTasks.assignedTo, assignedTo))
    : and(eq(leadTasks.status, 'open'), sql`${leadTasks.dueAt} < now()`);
  return db.select().from(leadTasks).where(where).orderBy(leadTasks.dueAt).limit(50);
}

/** Conversion reporting. Won excludes lost and unqualified by construction. */
export async function conversionReport(pipelineKey = 'accommodation') {
  const db = await getDb();
  const rows = await db.select({
    outcome: leads.outcome,
    count: sql<number>`count(*)::int`,
  })
    .from(leads)
    .where(eq(leads.pipelineKey, pipelineKey))
    .groupBy(leads.outcome);

  const map = Object.fromEntries(rows.map((r) => [r.outcome, Number(r.count)]));
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  const won = map.won ?? 0;
  return {
    total,
    won,
    lost: map.lost ?? 0,
    open: map.open ?? 0,
    unqualified: map.unqualified ?? 0,
    conversionRate: total > 0 ? Math.round((won / total) * 1000) / 10 : 0,
  };
}
