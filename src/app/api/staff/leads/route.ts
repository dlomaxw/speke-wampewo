import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { leads, leadActivities } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { newId } from '@/lib/ids';
import { apiUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await apiUser('crm.view');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const pipeline = searchParams.get('pipeline');

    const db = await getDb();
    const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(100);

    // Compute department stats
    const stats = {
      total: allLeads.length,
      hotel: allLeads.filter(
        (l) =>
          l.departmentKey === 'reservations' ||
          l.enquiryType === 'accommodation' ||
          l.enquiryType === 'long_stay' ||
          l.enquiryType === 'corporate',
      ).length,
      restaurant: allLeads.filter(
        (l) => l.departmentKey === 'dining' || l.enquiryType === 'dining',
      ).length,
      spa: allLeads.filter(
        (l) => l.departmentKey === 'spa' || l.enquiryType === 'spa',
      ).length,
      healthClub: allLeads.filter(
        (l) =>
          l.departmentKey === 'health_club' ||
          l.enquiryType === 'pool' ||
          l.enquiryType === 'gym' ||
          l.enquiryType === 'services',
      ).length,
      activeOpen: allLeads.filter((l) => l.outcome === 'open').length,
      confirmedWon: allLeads.filter(
        (l) => l.outcome === 'won' || l.stage === 'confirmed' || l.stage === 'booked',
      ).length,
    };

    // Filter if requested
    let filtered = allLeads;
    if (department && department !== 'all') {
      if (department === 'reservations' || department === 'hotel') {
        filtered = filtered.filter(
          (l) =>
            l.departmentKey === 'reservations' ||
            l.enquiryType === 'accommodation' ||
            l.enquiryType === 'long_stay' ||
            l.enquiryType === 'corporate',
        );
      } else if (department === 'dining' || department === 'restaurant') {
        filtered = filtered.filter(
          (l) => l.departmentKey === 'dining' || l.enquiryType === 'dining',
        );
      } else if (department === 'spa') {
        filtered = filtered.filter(
          (l) => l.departmentKey === 'spa' || l.enquiryType === 'spa',
        );
      } else if (department === 'health_club') {
        filtered = filtered.filter(
          (l) =>
            l.departmentKey === 'health_club' ||
            l.enquiryType === 'pool' ||
            l.enquiryType === 'gym',
        );
      } else {
        filtered = filtered.filter((l) => l.departmentKey === department);
      }
    }

    if (pipeline && pipeline !== 'all') {
      filtered = filtered.filter((l) => l.pipelineKey === pipeline);
    }

    return NextResponse.json({ ok: true, leads: filtered, allLeads, stats });
  } catch (err: any) {
    console.error('Error in /api/staff/leads:', err);
    return NextResponse.json(
      // The driver's message names every column, so it stays in the log.
      { ok: false, error: 'Something went wrong handling this request.' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const auth = await apiUser('crm.edit');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const { id, stage, outcome, notes, assignedTo } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Lead id is required' }, { status: 400 });
    }

    const db = await getDb();
    const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);

    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }

    const updateData: Partial<typeof leads.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (stage) updateData.stage = stage;
    if (outcome) updateData.outcome = outcome;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    await db.update(leads).set(updateData).where(eq(leads.id, id));

    if (notes || stage || outcome) {
      await db.insert(leadActivities).values({
        leadId: id,
        type: 'status_change',
        body: notes
          ? `Status updated: ${stage || lead.stage} (${outcome || lead.outcome}). Note: ${notes}`
          : `Status changed to ${stage || lead.stage} (${outcome || lead.outcome})`,
        actorName: assignedTo || 'Staff Operator',
      });
    }

    return NextResponse.json({ ok: true, message: 'Lead updated successfully' });
  } catch (err: any) {
    console.error('Error updating lead:', err);
    return NextResponse.json(
      // The driver's message names every column, so it stays in the log.
      { ok: false, error: 'Something went wrong handling this request.' },
      { status: 500 },
    );
  }
}
