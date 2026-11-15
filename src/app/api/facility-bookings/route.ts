import { NextResponse } from 'next/server';
import { z } from 'zod';
import { captureLead } from '@/lib/crm';
import { facilityReference } from '@/lib/facilities';

const FacilityBookingSchema = z.object({
  facilityType: z.enum(['pool', 'spa', 'gym', 'dining']),
  guestName: z.string().min(1, 'Guest name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  date: z.string().min(1, 'Booking date is required'),
  timeSlot: z.string().optional(),
  partySize: z.number().int().min(1).default(1),
  serviceId: z.string().optional(),
  serviceName: z.string().optional(),
  totalPrice: z.number().nonnegative().default(0),
  seatingArea: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = FacilityBookingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: parsed.error.format() },
        { status: 400 },
      );
    }

    const {
      facilityType,
      guestName,
      phone,
      email,
      date,
      timeSlot,
      partySize,
      serviceName,
      totalPrice,
      seatingArea,
      notes,
    } = parsed.data;

    const reference = facilityReference(facilityType);

    // Department routing & phone contact
    let departmentKey = 'front_office';
    let deskPhone = '+256752711704';
    let title = 'Facility Pass';

    if (facilityType === 'dining') {
      departmentKey = 'dining';
      deskPhone = '+256702711009';
      title = 'La Cabana Table Reservation';
    } else if (facilityType === 'spa') {
      departmentKey = 'spa';
      deskPhone = '+256702711056';
      title = 'Calabash Spa & Hammam Appointment';
    } else if (facilityType === 'pool') {
      departmentKey = 'front_office';
      deskPhone = '+256200555000';
      title = 'Heated Swimming Pool Day Pass';
    } else if (facilityType === 'gym') {
      departmentKey = 'front_office';
      deskPhone = '+256752711704';
      title = 'Health Club & Gym Pass';
    }

    const leadSummary = [
      `[${title}]`,
      `Service: ${serviceName || 'General Access'}`,
      `Date: ${date}`,
      timeSlot ? `Time Slot: ${timeSlot}` : null,
      partySize > 1 ? `Guests / Party: ${partySize}` : null,
      seatingArea ? `Area: ${seatingArea}` : null,
      totalPrice > 0 ? `Total: $${totalPrice} USD` : 'Complimentary / Table Booking',
      notes ? `Notes: ${notes}` : null,
      `Voucher Ref: ${reference}`,
    ]
      .filter(Boolean)
      .join(' | ');

    // Ingest into CRM
    await captureLead({
      enquiryType: facilityType,
      departmentKey,
      firstName: guestName,
      email: email || undefined,
      phone,
      checkIn: date,
      checkOut: date,
      adults: partySize,
      message: leadSummary,
      source: `website_facility_${facilityType}`,
    });

    // Format pre-filled WhatsApp message for guest
    const whatsappMsg = `Hello Speke Apartments Wampewo, I have booked a ${title} (Ref: ${reference}) for ${date}${timeSlot ? ' at ' + timeSlot : ''}. Guest: ${guestName}. ${totalPrice > 0 ? 'Estimated Amount: $' + totalPrice + ' USD.' : ''}`;
    const cleanDeskPhone = deskPhone.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${cleanDeskPhone}?text=${encodeURIComponent(whatsappMsg)}`;

    return NextResponse.json({
      ok: true,
      reference,
      facilityType,
      title,
      totalPrice,
      whatsappUrl,
      deskPhone,
      message: `Your ${title} booking has been received! Reference: ${reference}.`,
    });
  } catch (error: any) {
    console.error('Facility booking error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error processing facility booking' },
      { status: 500 },
    );
  }
}
