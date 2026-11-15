const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const PAGES = [
  'https://www.spekeapartments.com/wampewo/',
  'https://www.spekeapartments.com/wampewo/dining/',
  'https://www.spekeapartments.com/wampewo/gym-club/',
  'https://www.spekeapartments.com/wampewo/our-apartments/',
  'https://www.spekeapartments.com/wampewo/contact-and-location/',
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(fetchHtml(res.headers.location));
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout fetching ' + url));
    });
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(downloadFile(res.headers.location, dest));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(dest));
        });
      }
    );
    req.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
    req.setTimeout(25000, () => {
      req.destroy();
      fs.unlink(dest, () => {});
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function main() {
  console.log('Retrieving pages and discovering media & offer flyers...');
  const allMediaUrls = new Set();

  for (const pageUrl of PAGES) {
    try {
      console.log(`Fetching ${pageUrl}...`);
      const html = await fetchHtml(pageUrl);
      const imgRegex =
        /https?:\/\/[^\s"'<>]+\/wp-content\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif|pdf)/gi;
      let m;
      while ((m = imgRegex.exec(html)) !== null) {
        // Normalize out WP dimension suffixes like -300x300, -768x768
        const clean = m[0].replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/, '$1');
        allMediaUrls.add(clean);
      }
    } catch (e) {
      console.warn(`Could not fetch ${pageUrl}:`, e.message);
    }
  }

  console.log(`\nDiscovered ${allMediaUrls.size} unique media assets across site.`);

  const offersDir = path.join(__dirname, '../public/media/offers');
  if (!fs.existsSync(offersDir)) {
    fs.mkdirSync(offersDir, { recursive: true });
  }

  const mediaDir = path.join(__dirname, '../public/media');

  const flyers = [];
  const downloads = [];

  for (const url of allMediaUrls) {
    const lower = url.toLowerCase();
    const isOffer =
      lower.includes('warmth') ||
      lower.includes('retreat') ||
      lower.includes('kids') ||
      lower.includes('fitness') ||
      lower.includes('offer') ||
      lower.includes('flyer') ||
      lower.includes('promo') ||
      lower.includes('classes') ||
      lower.includes('special') ||
      lower.includes('package');

    const fileName = path.basename(new URL(url).pathname);
    const targetPath = isOffer
      ? path.join(offersDir, fileName)
      : path.join(mediaDir, fileName);

    downloads.push({ url, targetPath, fileName, isOffer });
    if (isOffer) {
      flyers.push({ url, fileName, localPath: `/media/offers/${fileName}` });
    }
  }

  console.log(`Identified ${flyers.length} Offer & Promotion Flyers:`);
  flyers.forEach((f, idx) => console.log(`${idx + 1}. [FLYER] ${f.fileName} => ${f.url}`));

  console.log(`\nStarting downloads of Offer Flyers and key assets...`);
  let successCount = 0;
  let failCount = 0;

  for (const item of downloads) {
    try {
      if (!fs.existsSync(item.targetPath)) {
        process.stdout.write(`Downloading ${item.fileName}... `);
        await downloadFile(item.url, item.targetPath);
        console.log('✓');
      } else {
        console.log(`Existing: ${item.fileName}`);
      }
      successCount++;
    } catch (err) {
      console.log(`✗ (${err.message})`);
      failCount++;
    }
  }

  // Save flyer manifest
  const manifestPath = path.join(mediaDir, 'offers_manifest.json');
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        retrievedAt: new Date().toISOString(),
        source: 'https://www.spekeapartments.com/wampewo/',
        flyers,
      },
      null,
      2
    )
  );
  console.log(`\nSaved offers manifest to ${manifestPath}`);
  console.log(`Finished: ${successCount} assets processed, ${failCount} errors.`);
}

main().catch(console.error);
