const fs = require('fs');

const content = fs.readFileSync('C:/Users/RAZER/.gemini/antigravity-ide/brain/0d89fca0-f2c7-46cb-ab35-28242023e2ce/.system_generated/steps/491/content.md', 'utf8');

// Match any wp-content/uploads images or pdfs or flyer links
const imgRegex = /https?:\/\/[^\s"'<>]+\/wp-content\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif|pdf)/gi;
const matches = content.match(imgRegex) || [];

// Filter out thumbnails and keep full size
const fullRes = new Set();
matches.forEach(url => {
  // strip WordPress dimension suffixes like -300x300.jpg, -768x768.jpg, -150x150.jpg
  const clean = url.replace(/-\d+x\d+(\.[a-zA-Z0-9]+)$/, '$1');
  fullRes.add(clean);
});

console.log('Unique full-resolution images/media:', fullRes.size);
Array.from(fullRes).forEach((u, i) => {
  console.log(`${i + 1}. ${u}`);
});

// Also search for any links containing "offer", "special", "flyer", "promo"
const linkRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
let m;
const links = new Set();
while ((m = linkRegex.exec(content)) !== null) {
  const url = m[1];
  if (url.includes('wampewo')) {
    links.add(url);
  }
}
console.log('\nInternal links found on page:', links.size);
Array.from(links).forEach(l => {
  console.log('LINK:', l);
});
