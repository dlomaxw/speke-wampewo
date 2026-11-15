/**
 * Curates the public image set from assets/source-library.
 *
 * The full 888-image library stays out of git (it is the archive). This script
 * copies the working set into public/media with descriptive, SEO-friendly
 * filenames and writes public/media/manifest.json, which the seed reads to
 * attach images and alt text to room types and galleries.
 *
 * Selection is explicit rather than automatic: a hotel website is judged on its
 * photography, and "biggest file in the folder" is not an editorial decision.
 * Every entry names the source file so the choice is auditable.
 *
 *   npm run media:build
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'assets', 'source-library');
const OUT = join(ROOT, 'public', 'media');

interface SourceRecord {
  id: number; category: string; file: string; sourceUrl: string;
  alt: string; title: string; width: number | null; height: number | null; bytes?: number;
}

interface Selection {
  /** Filename fragment to match in the library, case-insensitive. */
  match: string;
  /** Published filename, without extension. Becomes part of the URL. */
  as: string;
  /** Alt text. Written here because the source library's alt text is empty. */
  alt: string;
  group: string;
}

/**
 * Alt text is authored, never auto-generated: it describes what is in the
 * photograph for someone who cannot see it, which a filename cannot do.
 */
const SELECTIONS: Selection[] = [
  // Hero
  { group: 'hero', match: 'Slider-Banner-13-1.png', as: 'wampewo-hero-exterior', alt: 'Speke Apartments Wampewo seen from the gardens at dusk' },
  { group: 'hero', match: 'Slider-Banner-7-1.png', as: 'wampewo-hero-living', alt: 'Furnished apartment living area with balcony doors open to a city view' },
  { group: 'hero', match: 'Slider-Banner-6.png', as: 'wampewo-hero-pool', alt: 'Heated outdoor swimming pool surrounded by loungers' },
  { group: 'hero', match: 'Slider-Banner-2.png', as: 'wampewo-hero-bedroom', alt: 'Apartment bedroom with a king bed and soft evening lighting' },

  // One bedroom deluxe
  { group: 'one-bedroom-deluxe', match: 'Deluxe-One-Bedroom-Apt.jpg', as: 'one-bedroom-deluxe-apartment', alt: 'One Bedroom Deluxe Apartment bedroom with a double bed and reading lamps' },
  { group: 'one-bedroom-deluxe', match: 'Deluxe-One-bedroom-Living-area.jpg', as: 'one-bedroom-deluxe-living-area', alt: 'Living area of a One Bedroom Deluxe Apartment with sofa and dining table' },
  { group: 'one-bedroom-deluxe', match: 'One-Bed-Deluxe-Bathroom.jpg', as: 'one-bedroom-deluxe-bathroom', alt: 'Bathroom of a One Bedroom Deluxe Apartment with a walk-in shower' },
  { group: 'one-bedroom-deluxe', match: 'Deluxe-One-bedroom-1-.jpg', as: 'one-bedroom-deluxe-interior', alt: 'Interior view of a One Bedroom Deluxe Apartment' },

  // One bedroom superior
  { group: 'one-bedroom-superior', match: 'One-Bedroom-Superior-Apartment-1.jpg', as: 'one-bedroom-superior-apartment', alt: 'One Bedroom Superior Apartment with a king bed and city outlook' },
  { group: 'one-bedroom-superior', match: 'One-Bedroom-Superior-Apartment-5.jpg', as: 'one-bedroom-superior-living-area', alt: 'Living area of a One Bedroom Superior Apartment' },
  { group: 'one-bedroom-superior', match: 'One-Bedroom-Superior-Apartment-6.jpg', as: 'one-bedroom-superior-kitchen', alt: 'Fully equipped kitchen in a One Bedroom Superior Apartment' },
  { group: 'one-bedroom-superior', match: 'One-Bedroom-Superior-Apartment-7.jpg', as: 'one-bedroom-superior-bathroom', alt: 'Bathroom in a One Bedroom Superior Apartment' },

  // Two bedroom deluxe
  { group: 'two-bedroom-deluxe', match: 'Deluxe-two-bedroom.jpg', as: 'two-bedroom-deluxe-apartment', alt: 'Two Bedroom Deluxe Apartment bedroom with twin beds' },
  { group: 'two-bedroom-deluxe', match: 'Deluxe-two-bedroom-living-area.jpg', as: 'two-bedroom-deluxe-living-area', alt: 'Living and dining area of a Two Bedroom Deluxe Apartment' },
  { group: 'two-bedroom-deluxe', match: 'Deluxe-two-bedroom-Kitchen-area.jpg', as: 'two-bedroom-deluxe-kitchen', alt: 'Kitchen area of a Two Bedroom Deluxe Apartment with oven and fridge' },

  // Two bedroom superior
  { group: 'two-bedroom-superior', match: 'Two-bedroom-bedroom.jpg', as: 'two-bedroom-superior-apartment', alt: 'Two Bedroom Superior Apartment bedroom with a king bed' },
  { group: 'two-bedroom-superior', match: 'Two-bedroom-living-area-with-balcony.jpg', as: 'two-bedroom-superior-living-area', alt: 'Two Bedroom Superior Apartment living area opening onto a private balcony' },
  { group: 'two-bedroom-superior', match: 'Two-bedroom-kitchen.jpg', as: 'two-bedroom-superior-kitchen', alt: 'Full kitchen in a Two Bedroom Superior Apartment' },

  // Three bedroom apartment
  { group: 'three-bedroom-apartment', match: 'Three-Bedroom-Apartment-5.jpg', as: 'three-bedroom-apartment', alt: 'Three Bedroom Apartment living room with balcony access' },
  { group: 'three-bedroom-apartment', match: 'Three-Bedroom-Apartment-9.jpg', as: 'three-bedroom-apartment-living', alt: 'Seating area in a Three Bedroom Apartment' },
  { group: 'three-bedroom-apartment', match: 'Three-Bedroom-Apartment-20.jpg', as: 'three-bedroom-apartment-bedroom', alt: 'Bedroom in a Three Bedroom Apartment' },
  { group: 'three-bedroom-apartment', match: 'Three-Bedroom-Apartment-10.jpg', as: 'three-bedroom-apartment-kitchen', alt: 'Kitchen in a Three Bedroom Apartment' },

  // Three bedroom villa
  { group: 'three-bedroom-villa', match: 'Three-bedroom-villa_-4.jpg', as: 'three-bedroom-villa', alt: 'Three Bedroom Villa exterior with private entrance' },
  { group: 'three-bedroom-villa', match: 'Three-Bedroom-Villa-5.jpg', as: 'three-bedroom-villa-living', alt: 'Living room of a Three Bedroom Villa' },
  { group: 'three-bedroom-villa', match: 'Three-Bedroom-Villa-2.jpg', as: 'three-bedroom-villa-bedroom', alt: 'Bedroom suite in a Three Bedroom Villa with a king-size bed' },
  { group: 'three-bedroom-villa', match: 'Three-Bedroom-Villa-4.jpg', as: 'three-bedroom-villa-dining', alt: 'Dining area in a Three Bedroom Villa' },

  // Penthouse
  { group: 'penthouse', match: 'Penthouse-Apartment-19.jpg', as: 'penthouse-apartment', alt: 'Penthouse Apartment living space with panoramic views over Kampala' },
  { group: 'penthouse', match: 'Penthouse-Apartment-16.jpg', as: 'penthouse-apartment-living', alt: 'Penthouse Apartment lounge seating' },
  { group: 'penthouse', match: 'Penthouse-Apartment-15.jpg', as: 'penthouse-apartment-bedroom', alt: 'Penthouse Apartment bedroom' },
  { group: 'penthouse', match: 'Penthouse-Apartment-4.jpg', as: 'penthouse-apartment-terrace', alt: 'Penthouse Apartment terrace overlooking the city' },

  // Facilities
  { group: 'facilities', match: 'facilities_images-1.jpg', as: 'facility-gym-club', alt: 'Health club gym floor with cardio and weight equipment' },
  { group: 'facilities', match: 'facilities_images-2.jpg', as: 'facility-swimming-pool', alt: 'Heated outdoor swimming pool at Speke Apartments Wampewo' },
  { group: 'facilities', match: 'facilities_images-3.jpg', as: 'facility-spa', alt: 'Treatment room at Calabash Spa and Salon' },
  { group: 'facilities', match: 'facilities_images-4.jpg', as: 'facility-turkish-hammam', alt: 'Turkish hammam steam room' },

  // Property
  { group: 'property', match: 'Speke-Apartments-Wampewo-About-Us.png', as: 'about-speke-apartments-wampewo', alt: 'Speke Apartments Wampewo apartment building viewed from the street' },
  { group: 'property', match: 'drive-to-acacia-mall.png', as: 'location-acacia-mall', alt: 'Icon showing the short drive to Acacia Mall' },
  { group: 'property', match: 'prestigious-community.png', as: 'location-kololo-neighbourhood', alt: 'Icon representing the secure Kololo neighbourhood' },

  // Brand
  { group: 'brand', match: 'Speke-Apartments-Wampewo-Logo200x75.png', as: 'speke-apartments-wampewo-logo', alt: 'Speke Apartments Wampewo logo' },
  { group: 'brand', match: 'Spek-apartment-wampewo-logo-square.jpg', as: 'speke-apartments-wampewo-logo-square', alt: 'Speke Apartments Wampewo square logo' },
];

/** Extra images pulled in bulk for the gallery, by category and count. */
const GALLERY: Array<{ category: string; match: RegExp; take: number; prefix: string; alt: string }> = [
  { category: 'dining', match: /cabana|restaurant|dining|food/i, take: 12, prefix: 'dining', alt: 'La Cabana restaurant at Speke Apartments Wampewo' },
  { category: 'spa', match: /spa|calabash|massage|hammam/i, take: 10, prefix: 'spa', alt: 'Calabash Spa and Salon at Speke Apartments Wampewo' },
  { category: 'gym', match: /gym|fitness|health/i, take: 8, prefix: 'gym', alt: 'Health club at Speke Apartments Wampewo' },
  { category: 'pool', match: /pool|swim/i, take: 6, prefix: 'pool', alt: 'Swimming pool at Speke Apartments Wampewo' },
  { category: 'apartments', match: /apartment/i, take: 14, prefix: 'apartment', alt: 'Apartment interior at Speke Apartments Wampewo' },
];

function loadLibrary(): SourceRecord[] {
  const manifestPath = join(SRC, 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error(`No source library at ${SRC}. Run the image download first (see docs/handover.md).`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(manifestPath, 'utf8'));
}

function findFile(lib: SourceRecord[], fragment: string): SourceRecord | null {
  const needle = fragment.toLowerCase();
  const hits = lib.filter((r) => r.file.toLowerCase().includes(needle));
  if (hits.length === 0) return null;
  // Prefer the largest, which is the original rather than a WordPress thumbnail.
  return hits.sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0))[0];
}

function main() {
  const lib = loadLibrary();
  mkdirSync(OUT, { recursive: true });

  const manifest: Array<{
    url: string; filename: string; alt: string; group: string;
    width: number | null; height: number | null; bytes: number; sourceUrl: string;
  }> = [];
  const missing: string[] = [];
  const used = new Set<string>();

  const publish = (rec: SourceRecord, as: string, alt: string, group: string) => {
    const ext = rec.file.slice(rec.file.lastIndexOf('.')).toLowerCase();
    const filename = `${as}${ext}`;
    if (used.has(filename)) return;
    const from = join(SRC, rec.category, rec.file);
    if (!existsSync(from)) { missing.push(rec.file); return; }
    copyFileSync(from, join(OUT, filename));
    used.add(filename);
    manifest.push({
      url: `/media/${filename}`,
      filename,
      alt,
      group,
      width: rec.width,
      height: rec.height,
      bytes: statSync(join(OUT, filename)).size,
      sourceUrl: rec.sourceUrl,
    });
  };

  for (const sel of SELECTIONS) {
    const rec = findFile(lib, sel.match);
    if (!rec) { missing.push(sel.match); continue; }
    publish(rec, sel.as, sel.alt, sel.group);
  }

  for (const g of GALLERY) {
    const candidates = lib
      .filter((r) => g.match.test(r.file) && (r.bytes ?? 0) > 60_000 && (r.width ?? 0) >= 700)
      .sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0));

    const seen = new Set<string>();
    let n = 0;
    for (const rec of candidates) {
      if (n >= g.take) break;
      // WordPress uploads the same photo at several sizes; skip near-duplicates.
      const stem = rec.file.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '').toLowerCase();
      if (seen.has(stem)) continue;
      seen.add(stem);
      n += 1;
      publish(rec, `${g.prefix}-${String(n).padStart(2, '0')}`, `${g.alt} (${n})`, `gallery-${g.category}`);
    }
  }

  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const totalMb = manifest.reduce((a, b) => a + b.bytes, 0) / 1048576;
  console.log(`Published ${manifest.length} images to public/media (${totalMb.toFixed(1)} MB).`);
  const byGroup = manifest.reduce<Record<string, number>>((acc, m) => {
    acc[m.group] = (acc[m.group] ?? 0) + 1; return acc;
  }, {});
  for (const [g, c] of Object.entries(byGroup).sort()) console.log(`  ${String(c).padStart(3)}  ${g}`);
  if (missing.length) {
    console.warn(`\nNot found in the library (${missing.length}):`);
    for (const m of missing.slice(0, 20)) console.warn(`  - ${m}`);
  }
}

main();
