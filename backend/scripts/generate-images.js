const fs = require('fs');
const path = require('path');
const { buildProducts } = require('../utils/seed');

const ACCENTS = ['#2874f0', '#e11d48', '#0ea5e9', '#7c3aed', '#16a34a', '#f97316', '#0891b2', '#d946ef', '#ca8a04', '#334155'];

const svgFor = (idx, name, brand, variant) => {
  const accent = ACCENTS[idx % ACCENTS.length];
  const short = (brand || 'AG').slice(0, 2).toUpperCase();
  const label = variant === 0 ? `${brand}` : variant === 1 ? 'Front View' : 'Side View';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#ffffff"/>
  <rect width="800" height="800" fill="${accent}" opacity="0.16"/>
  <circle cx="400" cy="360" r="210" fill="${accent}" opacity="0.10"/>
  <circle cx="400" cy="360" r="150" fill="#ffffff" opacity="0.55"/>
  <rect x="250" y="150" width="300" height="420" rx="28" fill="${accent}"/>
  <rect x="285" y="185" width="230" height="350" rx="18" fill="#ffffff"/>
  <rect x="285" y="185" width="230" height="350" rx="18" fill="none" stroke="${accent}" stroke-width="6"/>
  <text x="400" y="360" font-family="Segoe UI, Arial, sans-serif" font-size="150" font-weight="700" fill="${accent}" text-anchor="middle">${short}</text>
  <text x="400" y="640" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="600" fill="#334155" text-anchor="middle">${label}</text>
  <text x="400" y="688" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#64748b" text-anchor="middle">Shop Nova</text>
</svg>`;
};

const outDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'products');
fs.mkdirSync(outDir, { recursive: true });

// Clean old single-image set (keep only *.svg we generate now)
fs.readdirSync(outDir).forEach((f) => {
  if (/^p\d+\.svg$/.test(f)) fs.unlinkSync(path.join(outDir, f));
});

const products = buildProducts();
products.forEach((p, i) => {
  const base = p.image.match(/p(\d+)\.svg/)[1];
  [0, 1, 2].forEach((v) => {
    const name = v === 0 ? `p${base}.svg` : `p${base}-${v === 1 ? 'a' : 'b'}.svg`;
    fs.writeFileSync(path.join(outDir, name), svgFor(i, p.name, p.brand, v), 'utf8');
  });
});

console.log(`Generated ${products.length * 3} SVG product images (white-bg, Flipkart style) -> frontend/public/images/products/`);
process.exit(0);