/**
 * Seed script — run with: npm run seed
 * Creates the default admin, brands, categories + sub-categories,
 * sample products, starter bundles, and sample orders (varied statuses).
 * Safe to re-run: it upserts by slug / email / orderNumber and won't duplicate.
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─────────────────────────────── BRANDS ───────────────────────────────
const brands = [
  { name: 'Anker', country: 'United States', featured: true, description: 'Trusted charging & power accessories.' },
  { name: 'Baseus', country: 'China', featured: true, description: 'Smart lifestyle gadgets & accessories.' },
  { name: 'UGREEN', country: 'China', featured: true, description: 'Connectivity, hubs & cables.' },
  { name: 'JBL', country: 'United States', featured: true, description: 'Legendary audio gear.' },
  { name: 'Xiaomi', country: 'China', featured: true, description: 'Smart devices for everyone.' },
  { name: 'Logitech', country: 'Switzerland', featured: false, description: 'Keyboards, mice & peripherals.' },
  { name: 'Samsung', country: 'South Korea', featured: false, description: 'Consumer electronics.' },
  { name: 'Hoco', country: 'China', featured: false, description: 'Affordable mobile accessories.' },
  { name: 'Joyroom', country: 'China', featured: false, description: 'Cables, cases & chargers.' },
  { name: 'Remax', country: 'China', featured: false, description: 'Everyday mobile essentials.' },
];

// ────────────────────────── CATEGORIES (parents) ──────────────────────────
const parentCategories = [
  { name: 'Mobile Accessories', slug: 'mobile-accessories', description: 'Cases, chargers, cables & more', image: IMG('photo-1511707171634-5f897ff02aa9') },
  { name: 'Laptop Accessories', slug: 'laptop-accessories', description: 'Hubs, stands, sleeves & cooling', image: IMG('photo-1517336714731-489689fd1ca8') },
  { name: 'Audio', slug: 'audio', description: 'Earbuds, headphones & speakers', image: IMG('photo-1505740420928-5e560c06d30e') },
  { name: 'Power & Charging', slug: 'power-charging', description: 'Power banks, adapters & GaN chargers', image: IMG('photo-1609091839311-d5365f9ff1c5') },
  { name: 'Smart Gadgets', slug: 'smart-gadgets', description: 'Smartwatches, trackers & wearables', image: IMG('photo-1523275335684-37898b6baf30') },
];

// ───────────────────────── SUB-CATEGORIES (children) ─────────────────────────
const subCategories = [
  // Mobile
  { name: 'Phone Cases', parent: 'mobile-accessories' },
  { name: 'Screen Protectors', parent: 'mobile-accessories' },
  { name: 'Charging Cables', parent: 'mobile-accessories' },
  { name: 'Car Mounts', parent: 'mobile-accessories' },
  { name: 'Holders & Stands', parent: 'mobile-accessories' },
  // Laptop
  { name: 'USB Hubs & Docks', parent: 'laptop-accessories' },
  { name: 'Laptop Stands', parent: 'laptop-accessories' },
  { name: 'Keyboards & Mice', parent: 'laptop-accessories' },
  { name: 'Cooling Pads', parent: 'laptop-accessories' },
  { name: 'Laptop Sleeves', parent: 'laptop-accessories' },
  // Audio
  { name: 'Earbuds', parent: 'audio' },
  { name: 'Headphones', parent: 'audio' },
  { name: 'Bluetooth Speakers', parent: 'audio' },
  { name: 'Soundbars', parent: 'audio' },
  // Power
  { name: 'Power Banks', parent: 'power-charging' },
  { name: 'Wall Chargers', parent: 'power-charging' },
  { name: 'Wireless Chargers', parent: 'power-charging' },
  // Smart
  { name: 'Smartwatches', parent: 'smart-gadgets' },
  { name: 'Item Trackers', parent: 'smart-gadgets' },
  { name: 'Smart Home', parent: 'smart-gadgets' },
];

// ─────────────────────────────── PRODUCTS ───────────────────────────────
// category = parent slug, subcategory = child slug, brand = brand name
const products = [
  // Power & charging
  { name: 'GaN 65W USB-C Fast Charger', category: 'power-charging', subcategory: 'wall-chargers', brand: 'Anker', price: 2390, compareAtPrice: 2990, cost: 1100, stock: 120, sku: 'PWR-GAN65', featured: true, img: 'photo-1583394838336-acd977736f90', description: 'Compact 65W GaN charger with dual USB-C and one USB-A port. Charges laptops, tablets and phones at full speed. Foldable pins for travel.', specs: [['Output', '65W max'], ['Ports', '2× USB-C, 1× USB-A'], ['Tech', 'GaN II']], tags: ['charger', 'usb-c', 'gan'] },
  { name: '20000mAh 22.5W Power Bank', category: 'power-charging', subcategory: 'power-banks', brand: 'Anker', price: 1890, compareAtPrice: 2400, cost: 850, stock: 90, sku: 'PWR-PB20K', featured: true, img: 'photo-1609592424823-69f0c3f0a1f9', description: 'High-capacity 20000mAh power bank with 22.5W fast output, USB-C PD and dual USB-A. Charge your phone 4+ times.', specs: [['Capacity', '20000mAh'], ['Output', '22.5W PD'], ['Display', 'Digital %']], tags: ['powerbank', 'portable'] },
  { name: '10000mAh Magnetic Wireless Power Bank', category: 'power-charging', subcategory: 'power-banks', brand: 'Baseus', price: 2290, compareAtPrice: 2900, cost: 1050, stock: 65, sku: 'PWR-MAGPB', featured: false, img: 'photo-1609592424823-69f0c3f0a1f9', description: 'MagSafe-compatible 10000mAh power bank that snaps to your phone for cable-free 15W wireless charging.', specs: [['Capacity', '10000mAh'], ['Wireless', '15W MagSafe'], ['Wired', '20W USB-C']], tags: ['powerbank', 'magsafe', 'wireless'] },
  { name: '15W Wireless Charging Pad', category: 'power-charging', subcategory: 'wireless-chargers', brand: 'UGREEN', price: 990, compareAtPrice: 1400, cost: 380, stock: 110, sku: 'PWR-WLPAD', featured: false, img: 'photo-1583394838336-acd977736f90', description: 'Slim Qi wireless charging pad with 15W fast charging and over-temperature protection.', specs: [['Output', '15W'], ['Standard', 'Qi'], ['Safety', 'OTP / FOD']], tags: ['wireless', 'charger'] },
  { name: '3-in-1 Foldable Wireless Charger', category: 'power-charging', subcategory: 'wireless-chargers', brand: 'Baseus', price: 2790, compareAtPrice: 3600, cost: 1300, stock: 45, sku: 'PWR-3IN1', featured: true, img: 'photo-1583394838336-acd977736f90', description: 'Charge your phone, earbuds and smartwatch at once on this foldable travel-ready wireless stand.', specs: [['Devices', 'Phone + Watch + Buds'], ['Output', '15W'], ['Design', 'Foldable']], tags: ['wireless', 'charger', '3-in-1'] },
  { name: '33W Dual-Port Wall Charger', category: 'power-charging', subcategory: 'wall-chargers', brand: 'Xiaomi', price: 1190, compareAtPrice: 1500, cost: 480, stock: 130, sku: 'PWR-33W', featured: false, img: 'photo-1583394838336-acd977736f90', description: 'Pocket-size 33W charger with USB-C PD and USB-A QC for fast top-ups on the go.', specs: [['Output', '33W'], ['Ports', 'USB-C + USB-A']], tags: ['charger', 'fast'] },

  // Audio
  { name: 'TWS Pro ANC Earbuds', category: 'audio', subcategory: 'earbuds', brand: 'JBL', price: 2790, compareAtPrice: 3500, cost: 1200, stock: 75, sku: 'AUD-TWSPRO', featured: true, img: 'photo-1590658268037-6bf12165a8df', description: 'True wireless earbuds with active noise cancellation, 30-hour total battery, low-latency game mode and IPX5.', specs: [['ANC', 'Hybrid'], ['Battery', '30h total'], ['Bluetooth', '5.3']], tags: ['earbuds', 'tws', 'anc'] },
  { name: 'Budget TWS Earbuds', category: 'audio', subcategory: 'earbuds', brand: 'Xiaomi', price: 1190, compareAtPrice: 1600, cost: 520, stock: 140, sku: 'AUD-TWSBUD', featured: false, img: 'photo-1590658268037-6bf12165a8df', description: 'Affordable true-wireless earbuds with punchy bass, touch controls and 24-hour battery with the case.', specs: [['Battery', '24h total'], ['Bluetooth', '5.3'], ['Water', 'IPX4']], tags: ['earbuds', 'tws', 'budget'] },
  { name: 'Over-Ear Wireless Headphones', category: 'audio', subcategory: 'headphones', brand: 'JBL', price: 3490, compareAtPrice: 4200, cost: 1600, stock: 40, sku: 'AUD-OEWL', featured: false, img: 'photo-1505740420928-5e560c06d30e', description: 'Plush over-ear headphones with 40mm drivers, deep bass and 40-hour playback. Foldable with carry pouch.', specs: [['Drivers', '40mm'], ['Battery', '40h'], ['Connectivity', 'BT 5.2 + AUX']], tags: ['headphones', 'wireless'] },
  { name: 'Portable Bluetooth Speaker 20W', category: 'audio', subcategory: 'bluetooth-speakers', brand: 'JBL', price: 2990, compareAtPrice: 3700, cost: 1400, stock: 60, sku: 'AUD-SPK20', featured: true, img: 'photo-1505740420928-5e560c06d30e', description: '20W portable speaker with rich bass, IPX7 waterproofing and 16-hour playtime. Pair two for stereo.', specs: [['Power', '20W'], ['Battery', '16h'], ['Water', 'IPX7']], tags: ['speaker', 'bluetooth', 'waterproof'] },
  { name: '2.1 Soundbar with Subwoofer', category: 'audio', subcategory: 'soundbars', brand: 'Samsung', price: 6490, compareAtPrice: 7900, cost: 3200, stock: 22, sku: 'AUD-SBAR21', featured: false, img: 'photo-1505740420928-5e560c06d30e', description: '2.1-channel soundbar with wireless subwoofer for cinematic sound. HDMI ARC, optical and Bluetooth.', specs: [['Channels', '2.1'], ['Sub', 'Wireless'], ['Inputs', 'HDMI ARC / Optical / BT']], tags: ['soundbar', 'home-theatre'] },

  // Laptop accessories
  { name: '7-in-1 USB-C Hub', category: 'laptop-accessories', subcategory: 'usb-hubs-docks', brand: 'UGREEN', price: 2190, compareAtPrice: 2800, cost: 950, stock: 60, sku: 'LAP-HUB7', featured: true, img: 'photo-1625842268584-8f3296236761', description: 'Expand your laptop with HDMI 4K, 3× USB 3.0, SD/microSD reader and 100W PD pass-through — in one aluminium hub.', specs: [['HDMI', '4K@30Hz'], ['USB', '3× USB 3.0'], ['PD', '100W pass-through']], tags: ['hub', 'usb-c', 'dock'] },
  { name: 'USB-C to Dual HDMI Adapter', category: 'laptop-accessories', subcategory: 'usb-hubs-docks', brand: 'Baseus', price: 2490, compareAtPrice: 3100, cost: 1150, stock: 38, sku: 'LAP-2HDMI', featured: false, img: 'photo-1625842268584-8f3296236761', description: 'Drive two external 4K monitors from a single USB-C port. Plug-and-play for Windows.', specs: [['Outputs', '2× HDMI 4K'], ['Connection', 'USB-C']], tags: ['adapter', 'hdmi', 'multi-monitor'] },
  { name: 'Aluminium Laptop Stand', category: 'laptop-accessories', subcategory: 'laptop-stands', brand: 'UGREEN', price: 1490, compareAtPrice: 1900, cost: 600, stock: 80, sku: 'LAP-STAND', featured: false, img: 'photo-1527443224154-c4a3942d3acf', description: 'Ergonomic adjustable aluminium stand that raises your laptop to eye level and improves airflow. Folds flat.', specs: [['Material', 'Aluminium alloy'], ['Fits', '11"–17"'], ['Foldable', 'Yes']], tags: ['stand', 'ergonomic'] },
  { name: 'RGB Mechanical Keyboard (TKL)', category: 'laptop-accessories', subcategory: 'keyboards-mice', brand: 'Logitech', price: 2990, compareAtPrice: 3800, cost: 1300, stock: 35, sku: 'LAP-KBTKL', featured: false, img: 'photo-1587829741301-dc798b83add3', description: 'Tenkeyless hot-swappable mechanical keyboard with red switches, per-key RGB and USB-C detachable cable.', specs: [['Layout', 'TKL 87-key'], ['Switches', 'Hot-swap red'], ['Lighting', 'Per-key RGB']], tags: ['keyboard', 'mechanical', 'rgb'] },
  { name: 'Silent Wireless Mouse', category: 'laptop-accessories', subcategory: 'keyboards-mice', brand: 'Logitech', price: 990, compareAtPrice: 1300, cost: 360, stock: 120, sku: 'LAP-MOUSE', featured: false, img: 'photo-1587829741301-dc798b83add3', description: 'Ergonomic silent-click wireless mouse with 2.4GHz + Bluetooth, 4000 DPI and 18-month battery life.', specs: [['DPI', '4000 adjustable'], ['Connection', '2.4G + BT'], ['Clicks', 'Silent']], tags: ['mouse', 'wireless', 'silent'] },
  { name: 'Laptop Cooling Pad (5-Fan)', category: 'laptop-accessories', subcategory: 'cooling-pads', brand: 'Hoco', price: 1690, compareAtPrice: 2200, cost: 720, stock: 50, sku: 'LAP-COOL5', featured: false, img: 'photo-1527443224154-c4a3942d3acf', description: 'Five-fan cooling pad with adjustable height, RGB lighting and dual USB pass-through. Fits up to 17".', specs: [['Fans', '5'], ['Fits', 'up to 17"'], ['Lighting', 'RGB']], tags: ['cooling', 'gaming'] },
  { name: '14" Water-Resistant Laptop Sleeve', category: 'laptop-accessories', subcategory: 'laptop-sleeves', brand: 'UGREEN', price: 890, compareAtPrice: 1200, cost: 320, stock: 95, sku: 'LAP-SLV14', featured: false, img: 'photo-1517336714731-489689fd1ca8', description: 'Padded water-resistant sleeve with a front accessory pocket. Protects laptops up to 14".', specs: [['Fits', 'up to 14"'], ['Material', 'Water-resistant'], ['Pocket', 'Front zip']], tags: ['sleeve', 'protection'] },

  // Mobile accessories
  { name: 'Magnetic Wireless Car Mount', category: 'mobile-accessories', subcategory: 'car-mounts', brand: 'Baseus', price: 990, compareAtPrice: 1300, cost: 380, stock: 150, sku: 'MOB-CARMNT', featured: false, img: 'photo-1556656793-08538906a9f8', description: 'MagSafe-compatible 15W wireless charging car mount with strong magnets and one-hand mounting.', specs: [['Charging', '15W wireless'], ['Mount', 'Vent + dash']], tags: ['car', 'magsafe', 'wireless'] },
  { name: 'Braided USB-C to USB-C Cable (2m)', category: 'mobile-accessories', subcategory: 'charging-cables', brand: 'UGREEN', price: 590, compareAtPrice: 800, cost: 180, stock: 300, sku: 'MOB-CABLE2M', featured: false, img: 'photo-1606229365485-93a3b8ee0385', description: '100W 2-metre nylon-braided USB-C cable rated for 10,000+ bends. Fast charging and data transfer.', specs: [['Length', '2m'], ['Power', '100W / 5A'], ['Build', 'Nylon braided']], tags: ['cable', 'usb-c'] },
  { name: 'Lightning to USB-C Cable (1m)', category: 'mobile-accessories', subcategory: 'charging-cables', brand: 'Joyroom', price: 490, compareAtPrice: 700, cost: 160, stock: 220, sku: 'MOB-LTC1M', featured: false, img: 'photo-1606229365485-93a3b8ee0385', description: 'MFi-grade Lightning to USB-C cable supporting fast charge for iPhone. 1-metre braided.', specs: [['Length', '1m'], ['Fast charge', 'PD']], tags: ['cable', 'lightning', 'iphone'] },
  { name: 'Tempered Glass Screen Protector (3-pack)', category: 'mobile-accessories', subcategory: 'screen-protectors', brand: 'Remax', price: 450, compareAtPrice: 700, cost: 120, stock: 400, sku: 'MOB-GLASS3', featured: false, img: 'photo-1592890288564-76628a30a657', description: '9H tempered glass with oleophobic coating and bubble-free installation. Pack of 3 with frame.', specs: [['Hardness', '9H'], ['Pack', '3 pieces']], tags: ['screen-protector', 'glass'] },
  { name: 'Privacy Tempered Glass', category: 'mobile-accessories', subcategory: 'screen-protectors', brand: 'Remax', price: 350, compareAtPrice: 550, cost: 110, stock: 180, sku: 'MOB-PRIVG', featured: false, img: 'photo-1592890288564-76628a30a657', description: 'Anti-spy privacy tempered glass that keeps your screen hidden from side angles. 9H, case-friendly.', specs: [['Type', 'Privacy / anti-spy'], ['Hardness', '9H']], tags: ['screen-protector', 'privacy'] },
  { name: 'Clear Shockproof Phone Case', category: 'mobile-accessories', subcategory: 'phone-cases', brand: 'Hoco', price: 390, compareAtPrice: 600, cost: 130, stock: 260, sku: 'MOB-CASECLR', featured: false, img: 'photo-1556656793-08538906a9f8', description: 'Crystal-clear TPU case with reinforced corners and raised lips to protect the camera and screen.', specs: [['Material', 'TPU'], ['Protection', 'Military-grade corners']], tags: ['case', 'clear', 'shockproof'] },
  { name: 'Adjustable Phone Holder Stand', category: 'mobile-accessories', subcategory: 'holders-stands', brand: 'Hoco', price: 540, compareAtPrice: 800, cost: 190, stock: 140, sku: 'MOB-HOLDER', featured: false, img: 'photo-1527443224154-c4a3942d3acf', description: 'Foldable aluminium desk stand with adjustable angle. Great for video calls and watching content.', specs: [['Material', 'Aluminium'], ['Angle', 'Adjustable'], ['Foldable', 'Yes']], tags: ['stand', 'desk'] },

  // Smart gadgets
  { name: 'Smartwatch Fit 2 (AMOLED)', category: 'smart-gadgets', subcategory: 'smartwatches', brand: 'Xiaomi', price: 3290, compareAtPrice: 4500, cost: 1500, stock: 55, sku: 'SMT-FIT2', featured: true, img: 'photo-1523275335684-37898b6baf30', description: '1.43" AMOLED smartwatch with Bluetooth calling, SpO2, heart-rate, 100+ sport modes and 7-day battery.', specs: [['Display', '1.43" AMOLED'], ['Battery', '7 days'], ['Calls', 'Bluetooth']], tags: ['smartwatch', 'wearable'] },
  { name: 'Calling Smartwatch Ultra', category: 'smart-gadgets', subcategory: 'smartwatches', brand: 'Hoco', price: 2490, compareAtPrice: 3400, cost: 1100, stock: 48, sku: 'SMT-ULTRA', featured: false, img: 'photo-1523275335684-37898b6baf30', description: 'Rugged 49mm smartwatch with Bluetooth calling, always-on display and dual-strap design.', specs: [['Display', '2.0" HD'], ['Calls', 'Bluetooth'], ['Battery', '5 days']], tags: ['smartwatch', 'calling'] },
  { name: 'Smart Item Tracker (2-pack)', category: 'smart-gadgets', subcategory: 'item-trackers', brand: 'Baseus', price: 1290, compareAtPrice: 1700, cost: 500, stock: 70, sku: 'SMT-TRACK2', featured: false, img: 'photo-1558002038-1055907df827', description: 'Bluetooth key/wallet trackers with app finding, replaceable battery and loud ring. Pack of 2.', specs: [['Range', '~60m'], ['Battery', 'CR2032 replaceable']], tags: ['tracker', 'bluetooth'] },
  { name: 'Smart RGB Wi-Fi LED Bulb', category: 'smart-gadgets', subcategory: 'smart-home', brand: 'Xiaomi', price: 690, compareAtPrice: 950, cost: 250, stock: 160, sku: 'SMT-BULB', featured: false, img: 'photo-1558002038-1055907df827', description: '16-million-colour smart bulb with app and voice control (Alexa/Google). Schedules and scenes supported.', specs: [['Colours', '16M RGB'], ['Control', 'App + Voice'], ['Fit', 'E27']], tags: ['smart-home', 'lighting'] },
];

// ─────────────────────────────── BUNDLES ───────────────────────────────
const bundleDefs = [
  { name: 'Ultimate Charging Kit', bundlePrice: 4490, featured: true, img: 'photo-1583394838336-acd977736f90', description: 'Everything to keep all your devices powered — a 65W GaN charger, a 20000mAh power bank and a 100W braided cable.', items: [['PWR-GAN65', 1], ['PWR-PB20K', 1], ['MOB-CABLE2M', 1]] },
  { name: 'Work From Home Combo', bundlePrice: 4290, featured: true, img: 'photo-1625842268584-8f3296236761', description: 'Turn any laptop into a productivity station: a 7-in-1 USB-C hub, an aluminium stand and a silent wireless mouse.', items: [['LAP-HUB7', 1], ['LAP-STAND', 1], ['LAP-MOUSE', 1]] },
  { name: "Audio Lover's Pack", bundlePrice: 5190, featured: false, img: 'photo-1505740420928-5e560c06d30e', description: 'ANC earbuds for the commute and a 20W waterproof speaker for the weekend — bundled and discounted.', items: [['AUD-TWSPRO', 1], ['AUD-SPK20', 1]] },
  { name: 'Mobile Protection Bundle', bundlePrice: 1190, featured: false, img: 'photo-1556656793-08538906a9f8', description: 'Keep your new phone pristine: a clear shockproof case, a 3-pack of tempered glass and a 2m fast cable.', items: [['MOB-CASECLR', 1], ['MOB-GLASS3', 1], ['MOB-CABLE2M', 1]] },
  { name: 'Smart Life Starter', bundlePrice: 4790, featured: true, img: 'photo-1523275335684-37898b6baf30', description: 'Step into the smart life: an AMOLED smartwatch, a 2-pack of item trackers and an RGB smart bulb.', items: [['SMT-FIT2', 1], ['SMT-TRACK2', 1], ['SMT-BULB', 1]] },
];

// ─────────────────────────────── ORDERS ───────────────────────────────
const ORDER_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const orderDefs = [
  { num: 'GG-SEED01', name: 'Tanvir Ahmed', email: 'tanvir@example.com', phone: '01711111111', city: 'Dhaka', area: 'Banani', payment: 'cod', paid: false, status: 'pending', daysAgo: 0, items: [['AUD-TWSPRO', 1], ['MOB-GLASS3', 1]] },
  { num: 'GG-SEED02', name: 'Nusrat Jahan', email: 'nusrat@example.com', phone: '01722222222', city: 'Dhaka', area: 'Dhanmondi', payment: 'bkash', paid: true, status: 'confirmed', daysAgo: 1, items: [['PWR-GAN65', 1]] },
  { num: 'GG-SEED03', name: 'Rakib Hasan', email: 'rakib@example.com', phone: '01733333333', city: 'Chattogram', area: 'Agrabad', payment: 'cod', paid: false, status: 'processing', daysAgo: 2, items: [['LAP-HUB7', 1], ['LAP-MOUSE', 1]] },
  { num: 'GG-SEED04', name: 'Sadia Islam', email: 'sadia@example.com', phone: '01744444444', city: 'Dhaka', area: 'Uttara', payment: 'nagad', paid: true, status: 'shipped', daysAgo: 3, carrier: 'Pathao', code: 'PTH-884213', items: [['SMT-FIT2', 1]] },
  { num: 'GG-SEED05', name: 'Imran Khan', email: 'imran@example.com', phone: '01755555555', city: 'Sylhet', area: 'Zindabazar', payment: 'cod', paid: false, status: 'out_for_delivery', daysAgo: 4, carrier: 'Sundarban', code: 'SUN-552190', items: [['AUD-SPK20', 1], ['MOB-CABLE2M', 2]] },
  { num: 'GG-SEED06', name: 'Farhana Akter', email: 'farhana@example.com', phone: '01766666666', city: 'Dhaka', area: 'Mirpur', payment: 'bkash', paid: true, status: 'delivered', daysAgo: 8, carrier: 'RedX', code: 'RDX-110045', items: [['PWR-PB20K', 1], ['PWR-MAGPB', 1]] },
  { num: 'GG-SEED07', name: 'Mahmudul Hasan', email: 'mahmud@example.com', phone: '01777777777', city: 'Khulna', area: 'Sonadanga', payment: 'card', paid: true, status: 'delivered', daysAgo: 12, carrier: 'Pathao', code: 'PTH-771902', items: [['AUD-OEWL', 1]] },
  { num: 'GG-SEED08', name: 'Sumaiya Rahman', email: 'sumaiya@example.com', phone: '01788888888', city: 'Dhaka', area: 'Gulshan', payment: 'cod', paid: false, status: 'cancelled', daysAgo: 6, items: [['LAP-KBTKL', 1]] },
  { num: 'GG-SEED09', name: 'Arif Mahmud', email: 'arif@example.com', phone: '01799999999', city: 'Rajshahi', area: 'Shaheb Bazar', payment: 'bkash', paid: true, status: 'returned', daysAgo: 15, carrier: 'RedX', code: 'RDX-330871', items: [['SMT-ULTRA', 1]] },
  { num: 'GG-SEED10', name: 'Jannatul Ferdous', email: 'jannat@example.com', phone: '01700001111', city: 'Dhaka', area: 'Bashundhara', payment: 'nagad', paid: true, status: 'delivered', daysAgo: 20, carrier: 'Pathao', code: 'PTH-220114', items: [['MOB-CASECLR', 1], ['MOB-PRIVG', 1], ['MOB-HOLDER', 1]] },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;
  const now = Date.now();

  // ── Admins ──
  const admins = [
    {
      name: process.env.ADMIN_NAME || 'GadgetGhor Admin',
      email: (process.env.ADMIN_EMAIL || 'admin@gadgetghor.com').toLowerCase(),
      username: 'admin',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    },
    {
      name: 'Rahat',
      email: 'rahatcse5bu@gadgetghor.com',
      username: 'rahatcse5bu',
      password: '1234567890',
    },
  ];
  for (const a of admins) {
    const hashed = await bcrypt.hash(a.password, 10);
    await db.collection('users').updateOne(
      { email: a.email },
      {
        $set: { name: a.name, username: a.username, role: 'admin', password: hashed, updatedAt: new Date() },
        $setOnInsert: { email: a.email, createdAt: new Date() },
      },
      { upsert: true },
    );
    console.log(`Admin ready: ${a.username} (or ${a.email}) / ${a.password}`);
  }

  // ── Brands ──
  for (const b of brands) {
    const slug = slugify(b.name);
    await db.collection('brands').updateOne(
      { slug },
      { $set: { ...b, slug, logo: '', updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }
  console.log(`Brands seeded: ${brands.length}`);

  // ── Categories (parents then children) ──
  for (const c of parentCategories) {
    await db.collection('categories').updateOne(
      { slug: c.slug },
      { $set: { ...c, parent: null, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }
  let subCount = 0;
  for (const s of subCategories) {
    const slug = slugify(s.name);
    const parentImg = parentCategories.find((p) => p.slug === s.parent)?.image || '';
    await db.collection('categories').updateOne(
      { slug },
      {
        $set: { name: s.name, slug, parent: s.parent, description: `${s.name} for your devices`, image: parentImg, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    subCount++;
  }
  console.log(`Categories seeded: ${parentCategories.length} parents + ${subCount} sub-categories`);

  // ── Products ──
  const productBySku: Record<string, any> = {};
  for (const p of products) {
    const slug = slugify(p.name);
    const doc = {
      name: p.name, slug, description: p.description, brand: p.brand,
      category: p.category, subcategory: p.subcategory,
      price: p.price, compareAtPrice: p.compareAtPrice, cost: p.cost,
      stock: p.stock, sku: p.sku, featured: p.featured,
      images: [IMG(p.img)],
      specs: p.specs.map(([key, value]) => ({ key, value })),
      tags: p.tags, isActive: true, rating: 4.6,
      numReviews: ((p.sku.length * 7) % 80) + 12,
    };
    await db.collection('products').updateOne(
      { slug },
      { $set: { ...doc, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
    productBySku[p.sku] = await db.collection('products').findOne({ slug });
  }
  console.log(`Products seeded: ${products.length}`);

  // ── Bundles ──
  for (const b of bundleDefs) {
    const slug = slugify(b.name);
    const items = b.items
      .map(([sku, qty]) => {
        const prod = productBySku[sku as string];
        return prod ? { product: prod._id, quantity: qty as number } : null;
      })
      .filter(Boolean);
    await db.collection('bundles').updateOne(
      { slug },
      {
        $set: { name: b.name, slug, description: b.description, images: [IMG(b.img)], items, bundlePrice: b.bundlePrice, isActive: true, featured: b.featured, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }
  console.log(`Bundles seeded: ${bundleDefs.length}`);

  // ── Orders ──
  let orderCount = 0;
  for (const o of orderDefs) {
    const items = o.items.map(([sku, qty]) => {
      const p = productBySku[sku as string];
      return {
        kind: 'product', refId: p._id, name: p.name, slug: p.slug,
        image: p.images?.[0] || '', price: p.price, quantity: qty as number,
      };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const shippingFee = subtotal >= 5000 ? 0 : /dhaka/i.test(o.city) ? 60 : 120;
    const total = subtotal + shippingFee;
    const createdAt = new Date(now - o.daysAgo * 86400000);

    // build a sensible status history up to the final status
    const history: any[] = [];
    if (o.status === 'cancelled') {
      history.push({ status: 'pending', note: 'Order placed', at: createdAt });
      history.push({ status: 'cancelled', note: 'Cancelled by customer', at: new Date(createdAt.getTime() + 6 * 3600000) });
    } else if (o.status === 'returned') {
      ORDER_FLOW.forEach((s, i) => history.push({ status: s, note: i === 0 ? 'Order placed' : '', at: new Date(createdAt.getTime() + i * 18 * 3600000) }));
      history.push({ status: 'returned', note: 'Returned within 7-day policy', at: new Date(createdAt.getTime() + 7 * 86400000) });
    } else {
      const idx = ORDER_FLOW.indexOf(o.status);
      for (let i = 0; i <= idx; i++) {
        history.push({ status: ORDER_FLOW[i], note: i === 0 ? 'Order placed' : '', at: new Date(createdAt.getTime() + i * 18 * 3600000) });
      }
    }

    await db.collection('orders').updateOne(
      { orderNumber: o.num },
      {
        $set: {
          orderNumber: o.num, user: null,
          customer: { name: o.name, email: o.email, phone: o.phone },
          shippingAddress: { address: `${(orderCount + 1) * 12} Main Road`, area: o.area, city: o.city, postcode: '1200' },
          items, subtotal, shippingFee, total,
          paymentMethod: o.payment, paymentStatus: o.paid ? 'paid' : 'unpaid',
          status: o.status,
          trackingCarrier: (o as any).carrier || '', trackingCode: (o as any).code || '',
          statusHistory: history, customerNote: '',
          updatedAt: new Date(), createdAt,
        },
      },
      { upsert: true },
    );
    orderCount++;
  }
  console.log(`Orders seeded: ${orderCount}`);

  await mongoose.disconnect();
  console.log('✅ Seed complete.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
