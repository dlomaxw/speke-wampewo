import { NextResponse } from 'next/server';
import { z } from 'zod';
import { captureLead } from '@/lib/crm';

const EnquirySchema = z.object({
  enquiryType: z.string().default('accommodation'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().min(6, 'Valid phone number is required'),
  country: z.string().optional(),
  companyName: z.string().optional(),
  checkIn: z.string().optional().nullable(),
  checkOut: z.string().optional().nullable(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  preferredRoomTypeId: z.string().optional().nullable(),
  message: z.string().optional(),
  source: z.string().default('website'),
  consentWhatsapp: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = EnquirySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          errors: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const lead = await captureLead(parsed.data);

    return NextResponse.json({
      ok: true,
      reference: lead.reference,
      leadId: lead.id,
      duplicate: lead.duplicate ?? false,
      message: lead.duplicate
        ? 'Your inquiry has been updated with our reservations team.'
        : 'Thank you! Your inquiry has been received. Our team will contact you shortly.',
    });
  } catch (error: any) {
    console.error('Error capturing lead:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to process inquiry',
      },
      { status: 500 },
    );
  }
}
