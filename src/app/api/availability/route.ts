import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { roomTypes, ratePlans } from '@/db/schema';
import { isIsoDate, nightsBetween } from '@/lib/dates';
import { ROOM_TYPES } from '@/lib/rooms';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = Number(searchParams.get('adults') || 1);
    const children = Number(searchParams.get('children') || 0);

    if (!checkIn || !checkOut || !isIsoDate(checkIn) || !isIsoDate(checkOut)) {
      return NextResponse.json(
        { ok: false, error: 'Valid checkIn and checkOut dates (YYYY-MM-DD) are required.' },
        { status: 400 },
      );
    }

    const nights = nightsBetween(checkIn, checkOut);
    if (nights <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Check-out date must be after check-in date.' },
        { status: 400 },
      );
    }

    // Attempt to query live database; fallback to verified seed content if db has not been populated
    let categories: any[] = [];
    try {
      const db = await getDb();
      categories = await db.select().from(roomTypes);
    } catch (e) {
      // fallback
      categories = [];
    }

    const results = (categories.length > 0 ? categories : ROOM_TYPES).map((r: any) => {
      const nightlyRate =
        (r.fromPriceMinor ?? 180_00) >= 100_000
          ? Math.round(r.fromPriceMinor / 1000)
          : Math.round((r.fromPriceMinor ?? 180_00) / 100);
      const rackRate =
        (r.rackPriceMinor ?? 230_00) >= 100_000
          ? Math.round(r.rackPriceMinor / 1000)
          : Math.round((r.rackPriceMinor ?? 230_00) / 100);

      const subtotal = nightlyRate * nights;
      const vat = Math.round(subtotal * 0.18 * 100) / 100;
      const total = subtotal + vat;

      return {
        id: r.id || r.slug,
        slug: r.slug,
        name: r.name,
        bedrooms: r.bedrooms,
        maxAdults: r.maxAdults ?? 2,
        maxOccupancy: r.maxOccupancy ?? 2,
        nightlyRate,
        rackRate,
        nights,
        subtotal,
        vat,
        total,
        available: true,
        heroImage: r.heroImage || `/media/${r.slug}.jpg`,
        shortDescription: r.shortDescription || r.description,
      };
    });

    return NextResponse.json({
      ok: true,
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      results,
    });
  } catch (error: any) {
    console.error('Availability check failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Error calculating availability' },
      { status: 500 },
    );
  }
}
