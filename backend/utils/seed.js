const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const CATALOG = [
  { name: 'boAt Airdopes 141 Pro TWS Earbuds', brand: 'boAt', category: 'Electronics', price: 1299, mrp: 3990, img: 'p1' },
  { name: 'JBL Go 3 Wireless Bluetooth Speaker', brand: 'JBL', category: 'Electronics', price: 1999, mrp: 3290, img: 'p2' },
  { name: 'GoPro HERO11 Black Action Camera', brand: 'GoPro', category: 'Electronics', price: 45999, mrp: 52990, img: 'p3' },
  { name: 'Sony SRS-XB13 Extra Bass Speaker', brand: 'Sony', category: 'Electronics', price: 2499, mrp: 3990, img: 'p4' },
  { name: 'Mi 65W Type-C Fast Charger', brand: 'Xiaomi', category: 'Electronics', price: 899, mrp: 1499, img: 'p5' },
  { name: 'Roadster Men\'s Denim Jacket', brand: 'Roadster', category: 'Fashion', price: 1399, mrp: 2999, img: 'p6' },
  { name: 'DressBerry Floral Print Dress', brand: 'DressBerry', category: 'Fashion', price: 1599, mrp: 3499, img: 'p7' },
  { name: 'Allen Solly Cotton Polo T-Shirt', brand: 'Allen Solly', category: 'Fashion', price: 899, mrp: 1999, img: 'p8' },
  { name: 'HIGHLANDER Slim Fit Chinos', brand: 'HIGHLANDER', category: 'Fashion', price: 1099, mrp: 2499, img: 'p9' },
  { name: 'Caprese Leather Crossbody Bag', brand: 'Caprese', category: 'Fashion', price: 2199, mrp: 3999, img: 'p10' },
  { name: 'Nike Air Zoom Pegasus 40', brand: 'Nike', category: 'Shoes', price: 7995, mrp: 11995, img: 'p11' },
  { name: 'Puma Smashic V2 Sneakers', brand: 'Puma', category: 'Shoes', price: 2999, mrp: 5499, img: 'p12' },
  { name: 'Adidas Runfalcon 3.0 Shoes', brand: 'Adidas', category: 'Shoes', price: 3499, mrp: 5499, img: 'p13' },
  { name: 'Bata Men\'s Formal Leather Shoes', brand: 'Bata', category: 'Shoes', price: 1999, mrp: 3999, img: 'p14' },
  { name: 'Red Tape Slip-On Loafers', brand: 'Red Tape', category: 'Shoes', price: 1499, mrp: 2999, img: 'p15' },
  { name: 'Fossil Minimalist Analog Watch', brand: 'Fossil', category: 'Watches', price: 7995, mrp: 12995, img: 'p16' },
  { name: 'Fastrack Reflex 3.0 Analog Watch', brand: 'Fastrack', category: 'Watches', price: 1995, mrp: 3995, img: 'p17' },
  { name: 'Noise ColorFit Pro 5 Smartwatch', brand: 'Noise', category: 'Watches', price: 4499, mrp: 8999, img: 'p18' },
  { name: 'Titan Karishma Quartz Watch', brand: 'Titan', category: 'Watches', price: 5995, mrp: 9995, img: 'p19' },
  { name: 'Michael Kors Runway Watch', brand: 'Michael Kors', category: 'Watches', price: 12999, mrp: 19999, img: 'p20' },
  { name: 'Logitech G502 Hero Mouse', brand: 'Logitech', category: 'Gaming', price: 4499, mrp: 6995, img: 'p21' },
  { name: 'Razer BlackWidow V4 Keyboard', brand: 'Razer', category: 'Gaming', price: 12499, mrp: 16999, img: 'p22' },
  { name: 'HyperX Cloud II Gaming Headset', brand: 'HyperX', category: 'Gaming', price: 8499, mrp: 11999, img: 'p23' },
  { name: 'Sony DualSense Controller', brand: 'Sony', category: 'Gaming', price: 5990, mrp: 7990, img: 'p24' },
  { name: 'LG 27" 144Hz Gaming Monitor', brand: 'LG', category: 'Gaming', price: 18499, mrp: 25999, img: 'p25' },
];

// Extra brands so the large catalog feels like a real marketplace
const EXTRA_BRANDS = ['Samsung', 'Apple', 'OnePlus', 'Realme', 'OPPO', 'Vivo', 'Zebronics', 'Boult', 'Mivi', 'Skybags', 'Wildcraft', 'Tommy Hilfiger', 'Levis', 'U.S. Polo Assn.', 'HRX', 'Reebok', 'Skechers', 'New Balance', 'Casio', 'Timex', 'Sonata', 'Dell', 'HP', 'Acer', 'MSI', 'Asus', 'Lenovo', 'Kingston', 'Corsair', 'Ant Esports'];

const MODEL_WORDS = {
  Electronics: ['TWS Earbuds', 'Bluetooth Speaker', 'Smart Watch', 'Fast Charger', 'Soundbar', 'Wireless Headphones', 'Power Bank', 'Smart Bulb', 'Earbuds Pro', 'Neckband', 'Tablet', 'Webcam', 'HDMI Cable', 'USB Hub', 'Router', 'Smart Band', 'Phone Stand', 'Car Charger'],
  Fashion: ['Cotton T-Shirt', 'Denim Jacket', 'Slim Fit Jeans', 'Polo T-Shirt', 'Kurta Set', 'Printed Shirt', 'Cargo Shorts', 'Hoodie', 'Joggers', 'Ethnic Saree', 'Leather Belt', 'Formal Shirt', 'Crew Neck Tee', 'Oversized Tee', 'Track Pants', 'Bomber Jacket', 'Trousers', 'Cardigan'],
  Shoes: ['Running Shoes', 'Casual Sneakers', 'Formal Shoes', 'Training Shoes', 'Slip-On Loafers', 'Canvas Shoes', 'Sports Shoes', 'Walking Shoes', 'Basketball Shoes', 'Football Studs', 'Sandals', 'Slides', 'Boots', 'Sneakers Low', 'High-Top Sneakers', 'Court Shoes', 'Hiking Shoes', 'Flip Flops'],
  Watches: ['Analog Watch', 'Chronograph Watch', 'Digital Watch', 'Smart Watch', 'Dress Watch', 'Sports Watch', 'Leather Strap Watch', 'Metal Strap Watch', 'Skeleton Watch', 'Waterproof Watch', 'Casual Watch', 'Luxury Watch', 'Fitness Band', 'Kids Watch', 'Analog Digital Watch', 'Quartz Watch', 'Automatic Watch', 'Bracelet Watch'],
  Gaming: ['Gaming Mouse', 'Mechanical Keyboard', 'Gaming Headset', 'Gaming Controller', 'RGB Mousepad', 'Gaming Monitor', 'Streaming Mic', 'Capture Card', 'Gaming Chair', 'Console Stand', 'Mouse Bungee', 'Cooling Pad', 'Gaming Speaker', 'Wireless Dongle', 'Controller Grip', 'RGB Strip', 'Gaming Desk Mat', 'VR Headset'],
};

const PRICE_RANGE = {
  Electronics: [499, 45000],
  Fashion: [299, 5999],
  Shoes: [799, 14999],
  Watches: [499, 29999],
  Gaming: [399, 49999],
};

const SELLER = 'Shop Nova Retail';
const OFFERS = [
  'Bank Offer 5% off on HDFC Bank Credit Cards, up to ₹1,500 on orders of ₹10,000 and above',
  'Bank Offer 10% off on ICICI Bank Debit Cards, up to ₹750 on first order',
  'Special Price: Get extra 15% off on select card payments (price inclusive of discount)',
  'Freebie: No cost EMI available on this product',
  'Free delivery on this order',
];

const HIGHLIGHTS = {
  Electronics: ['1 year warranty from date of purchase', 'Plug & play — no setup required', 'Sleek, compact design', 'Made with premium materials'],
  Fashion: ['100% original fabric', 'Wash-care instructions included', 'Premium quality stitching', 'Available in multiple sizes'],
  Shoes: ['Ergonomic cushioned sole', 'Breathable fabric', 'Grip-tested traction outsole', 'True-to-size fit'],
  Watches: ['Water resistant up to 3 ATM', 'Analog quartz movement', 'Premium metal/leather strap', 'Scratch-resistant glass'],
  Gaming: ['Low-latency high-performance build', 'Cross-platform compatibility', 'Durable buttons & switches', '1 year warranty'],
};

const SPECS_MAP = {
  Electronics: [
    { label: 'Model Name', value: 'Nova Pro Series' },
    { label: 'Color', value: 'Midnight Black' },
    { label: 'Connectivity', value: 'Bluetooth 5.3' },
    { label: 'Battery', value: 'Up to 20 hrs playback' },
    { label: 'Warranty', value: '1 Year Warranty' },
  ],
  Fashion: [
    { label: 'Fabric', value: 'Cotton Blend' },
    { label: 'Fit', value: 'Regular Fit' },
    { label: 'Style', value: 'Casual' },
    { label: 'Sleeve', value: 'Full Sleeve' },
    { label: 'Care', value: 'Machine Wash' },
  ],
  Shoes: [
    { label: 'Upper Material', value: 'Breathable Mesh' },
    { label: 'Sole Material', value: 'Rubber' },
    { label: 'Closure', value: 'Lace-Up' },
    { label: 'Occasion', value: 'Sports & Casual' },
    { label: 'Warranty', value: '30 Days Replacement' },
  ],
  Watches: [
    { label: 'Movement', value: 'Quartz' },
    { label: 'Dial Size', value: '42 mm' },
    { label: 'Case Material', value: 'Stainless Steel' },
    { label: 'Water Resistance', value: '3 ATM' },
    { label: 'Warranty', value: '1 Year Manufacturer' },
  ],
  Gaming: [
    { label: 'Connectivity', value: 'Wireless / Wired' },
    { label: 'Compatibility', value: 'PC, PS5, Xbox' },
    { label: 'Weight', value: 'Lightweight Build' },
    { label: 'RGB', value: 'Customisable Lighting' },
    { label: 'Warranty', value: '1 Year Warranty' },
  ],
};

const descFor = (p) =>
  `Buy ${p.name} online at the best price in India. Shop from the huge collection of ${p.brand} ${p.category.toLowerCase()} at Shop Nova. Genuine products, 30-day replacement guarantee, fast delivery across India and easy returns.`;

const buildProducts = () =>
  CATALOG.map((p) => ({
    name: p.name,
    brand: p.brand,
    price: p.price,
    mrp: p.mrp,
    description: descFor(p),
    category: p.category,
    stock: p.img === 'p3' ? 0 : ((parseInt(p.img.slice(1), 10) * 3) % 28),
    image: `/images/products/${p.img}.svg`,
    gallery: [`/images/products/${p.img}.svg`, `/images/products/${p.img}-a.svg`, `/images/products/${p.img}-b.svg`],
    rating: Math.round((3.6 + ((parseInt(p.img.slice(1), 10) * 13) % 14) / 10) * 10) / 10,
    numReviews: 8 + ((parseInt(p.img.slice(1), 10) * 7) % 240),
    highlights: HIGHLIGHTS[p.category],
    specs: SPECS_MAP[p.category],
    seller: SELLER,
    offers: OFFERS,
    reviews: [],
  }));

// Deterministic pseudo-random (no Math.random => stable catalog across reseeds)
const rand = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const buildBulkProducts = (count) => {
  const allBrands = [...new Set([...CATALOG.map((c) => c.brand), ...EXTRA_BRANDS])];
  const products = [];
  const baseImgs = CATALOG.map((c) => c.img); // p1..p25, reused across the catalog
  let idx = 0;
  let seedCounter = 1;

  // cycle brands/categories/models until we reach `count` unique products
  while (idx < count) {
    const brand = allBrands[idx % allBrands.length];
    const r = rand(seedCounter * 7919 + idx * 104729);
    seedCounter++;
    for (let c = 0; c < CATALOG.length && idx < count; c++) {
      const cat = CATALOG[c].category;
      const words = MODEL_WORDS[cat];
      const [lo, hi] = PRICE_RANGE[cat];
      for (let m = 0; m < words.length && idx < count; m++) {
        const word = words[m];
        const variants = 3 + Math.floor(r() * 2);
        for (let v = 0; v < variants && idx < count; v++) {
          const price = Math.round((lo + r() * (hi - lo)) / 5) * 5;
          const mrp = Math.round((price * (1.25 + r() * 0.55)) / 5) * 5;
          const num = 100 + idx;
          const img = baseImgs[idx % baseImgs.length];
          const stock = r() < 0.06 ? 0 : 1 + Math.floor(r() * 40);
          products.push({
            name: `${brand} ${word} ${num}`,
            brand,
            price,
            mrp,
            description: descFor({ name: `${brand} ${word} ${num}`, brand, category: cat }),
            category: cat,
            stock,
            image: `/images/products/${img}.svg`,
            gallery: [`/images/products/${img}.svg`, `/images/products/${img}-a.svg`, `/images/products/${img}-b.svg`],
            rating: Math.round((3.5 + r() * 1.4) * 10) / 10,
            numReviews: Math.floor(r() * 400),
            highlights: HIGHLIGHTS[cat],
            specs: SPECS_MAP[cat],
            seller: SELLER,
            offers: OFFERS,
            reviews: [],
          });
          idx++;
        }
      }
    }
  }
  return products;
};

const seed = async () => {
  await Product.deleteMany({});
  await User.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});

  const admin = await User.create({
    name: 'Shop Nova Admin',
    email: 'admin@shopnova.com',
    phone: '9999999999',
    password: 'Admin@123',
    role: 'admin',
  });

  const demoUser = await User.create({
    name: 'Ravi Kumar',
    email: 'ravi@mail.com',
    phone: '9876543210',
    password: 'Ravi@1234',
    role: 'user',
  });

  const products = await Product.insertMany(buildProducts());

  // Large catalog — configurable via PRODUCT_COUNT (default 100k)
  const bulkCount = Math.max(0, parseInt(process.env.PRODUCT_COUNT, 10) || 100000);
  const bulkProducts = buildBulkProducts(bulkCount);
  const BATCH = 5000;
  for (let i = 0; i < bulkProducts.length; i += BATCH) {
    await Product.insertMany(bulkProducts.slice(i, i + BATCH), { ordered: false });
  }

  // Seed a realistic spread of reviews so the detail page ratings UI looks full and stays consistent
  const REVIEW_BANK = [
    { title: 'Excellent product!', comment: 'Exactly as described. Delivery was fast and packaging was great.' },
    { title: 'Great value for money', comment: 'Quality is nice for the price. Would definitely recommend.' },
    { title: 'Worth every rupee', comment: 'Build quality is solid and it performs as advertised.' },
    { title: 'Good but could be better', comment: 'Works fine. Minor cosmetic issues but acceptable at this price.' },
    { title: 'Satisfied with purchase', comment: 'Met my expectations. Fast shipping and genuine product.' },
    { title: 'Love it!', comment: 'Looks even better in person. Very happy with this buy.' },
    { title: 'Average experience', comment: 'Decent product but I expected slightly better finishing.' },
    { title: 'Highly recommended', comment: 'Great features for the price point. Would buy again.' },
    { title: 'Value for money', comment: 'Good performance overall. Customer support was helpful too.' },
    { title: 'Nice quality', comment: 'Feels premium and well made. Happy customer here.' },
  ];
  const names = ['Ravi Kumar', 'Amit Sharma', 'Priya Singh', 'Vikram Rao', 'Sneha Gupta', 'Arjun Nair', 'Divya Menon', 'Rahul Verma'];
  const buildSampleReviews = (seed) => {
    const count = 5 + ((seed * 7) % 12); // 5..16 reviews
    const reviews = [];
    for (let i = 0; i < count; i++) {
      const base = REVIEW_BANK[i % REVIEW_BANK.length];
      const drift = (seed * 3 + i) % 5;
      const rating = Math.max(1, Math.min(5, Math.round(4.2 + drift)));
      reviews.push({
        user: demoUser._id,
        name: names[i % names.length],
        rating,
        title: base.title,
        comment: base.comment,
        createdAt: new Date(Date.now() - ((i + 1) * 86400000 * (seed % 9 + 1))),
      });
    }
    return reviews;
  };
  for (const p of products) {
    const seedN = parseInt(p.image.match(/p(\d+)/)?.[1] || '1', 10);
    p.reviews = buildSampleReviews(seedN);
    p.numReviews = p.reviews.length;
    p.rating = Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10;
    await p.save();
  }

  console.log('Seeded database:');
  console.log(`  - ${products.length + bulkProducts.length} products (${products.length} featured + ${bulkProducts.length} catalog)`);
  console.log('  - admin@shopnova.com / Admin@123  (admin)');
  console.log('  - ravi@mail.com / Ravi@1234    (user)');
};

module.exports = { seed, buildProducts };

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const connectDB = require('../config/db');
  (async () => {
    await connectDB();
    await seed();
  })().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}