import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ============================================
// In-Memory Data Store (seeded with demo data)
// ============================================

let products = [
  {
    id: 'P001', farmerId: 'F001', farmerName: 'Rajesh Patil',
    cropName: 'Tomato', cropNameHi: 'टमाटर', category: 'vegetables', variety: 'Hybrid Cherry',
    quantity: 500, unit: 'kg', farmPrice: 25, grade: 'A', organic: false,
    harvestDate: '2026-09-10', location: 'Sinnar, Nashik, MH',
    available: true, rating: 4.7, createdAt: new Date('2026-09-10').toISOString(),
  },
  {
    id: 'P002', farmerId: 'FPO001', farmerName: 'Sahyadri FPO',
    cropName: 'Onion', cropNameHi: 'प्याज', category: 'vegetables', variety: 'Nashik Red',
    quantity: 2000, unit: 'kg', farmPrice: 18, grade: 'A', organic: false,
    harvestDate: '2026-09-05', location: 'Mohadi, Nashik, MH',
    available: true, rating: 4.8, createdAt: new Date('2026-09-05').toISOString(),
  },
  {
    id: 'P003', farmerId: 'F002', farmerName: 'Gurpreet Singh',
    cropName: 'Wheat', cropNameHi: 'गेहूं', category: 'grains', variety: 'Sharbati',
    quantity: 5000, unit: 'kg', farmPrice: 28, grade: 'A', organic: false,
    harvestDate: '2026-04-15', location: 'Ajnala, Amritsar, PB',
    available: true, rating: 4.9, createdAt: new Date('2026-04-15').toISOString(),
  },
  {
    id: 'P004', farmerId: 'F003', farmerName: 'Lakshmi Devi',
    cropName: 'Coffee', cropNameHi: 'कॉफी', category: 'spices', variety: 'Arabica (Coorg)',
    quantity: 200, unit: 'kg', farmPrice: 350, grade: 'A', organic: true,
    harvestDate: '2026-08-20', location: 'Coorg, KA',
    available: true, rating: 4.9, createdAt: new Date('2026-08-20').toISOString(),
  },
  {
    id: 'P005', farmerId: 'F004', farmerName: 'Ram Kumar Yadav',
    cropName: 'Mango', cropNameHi: 'आम', category: 'fruits', variety: 'Dasheri',
    quantity: 1000, unit: 'kg', farmPrice: 60, grade: 'A', organic: false,
    harvestDate: '2026-06-15', location: 'Malihabad, Lucknow, UP',
    available: true, rating: 4.8, createdAt: new Date('2026-06-15').toISOString(),
  },
  {
    id: 'P006', farmerId: 'FPO002', farmerName: 'Kerala Spice Growers FPO',
    cropName: 'Black Pepper', cropNameHi: 'काली मिर्च', category: 'spices', variety: 'Malabar',
    quantity: 300, unit: 'kg', farmPrice: 450, grade: 'A', organic: true,
    harvestDate: '2026-07-10', location: 'Idukki, KL',
    available: true, rating: 4.9, createdAt: new Date('2026-07-10').toISOString(),
  },
];

let orders = [
  { id: 'ORD001', productId: 'P001', buyerName: 'Priya Mehta', farmerId: 'F001', quantity: 10, totalAmount: 270, status: 'delivered', orderDate: '2026-09-10', createdAt: new Date('2026-09-10').toISOString() },
  { id: 'ORD002', productId: 'P002', buyerName: 'Amit Sharma', farmerId: 'FPO001', quantity: 50, totalAmount: 972, status: 'in_transit', orderDate: '2026-09-13', createdAt: new Date('2026-09-13').toISOString() },
];

let notifications = [];

// Mandi benchmark prices (₹/kg) — simulated realistic data
const mandiPrices = {
  tomato: { crop: 'Tomato', mandiPrice: 28, avgRetail: 58 },
  onion: { crop: 'Onion', mandiPrice: 22, avgRetail: 45 },
  wheat: { crop: 'Wheat', mandiPrice: 32, avgRetail: 55 },
  rice: { crop: 'Rice', mandiPrice: 38, avgRetail: 65 },
  coffee: { crop: 'Coffee', mandiPrice: 420, avgRetail: 800 },
  mango: { crop: 'Mango', mandiPrice: 75, avgRetail: 150 },
  banana: { crop: 'Banana', mandiPrice: 22, avgRetail: 50 },
  potato: { crop: 'Potato', mandiPrice: 18, avgRetail: 35 },
  chilli: { crop: 'Green Chilli', mandiPrice: 40, avgRetail: 80 },
  pepper: { crop: 'Black Pepper', mandiPrice: 520, avgRetail: 950 },
  turmeric: { crop: 'Turmeric', mandiPrice: 140, avgRetail: 280 },
  cumin: { crop: 'Cumin Seeds', mandiPrice: 320, avgRetail: 600 },
  pomegranate: { crop: 'Pomegranate', mandiPrice: 95, avgRetail: 180 },
  grapes: { crop: 'Grapes', mandiPrice: 55, avgRetail: 120 },
  sugarcane: { crop: 'Sugarcane', mandiPrice: 3.5, avgRetail: 8 },
};

// Pricing engine (shared logic — same formula as client-side pricingEngine.js)
function calculatePricing(farmPrice, cropKey) {
  const mandi = mandiPrices[cropKey] || { mandiPrice: farmPrice * 1.1, avgRetail: farmPrice * 2.2 };
  const PLATFORM_FEE_PERCENT = 0.08;
  const platformFee = Math.round(farmPrice * PLATFORM_FEE_PERCENT);
  const platformPrice = farmPrice + platformFee;
  const retailPrice = mandi.avgRetail;
  const consumerSaving = Math.max(0, retailPrice - platformPrice);
  const consumerSavingPercent = retailPrice > 0 ? Math.round((consumerSaving / retailPrice) * 100) : 0;
  const farmerBonusVsMandi = Math.max(0, farmPrice - Math.round(mandi.mandiPrice * 0.6));
  return { farmPrice, platformFee, platformPrice, mandiPrice: mandi.mandiPrice, retailPrice, consumerSaving, consumerSavingPercent, farmerBonusVsMandi };
}

// ============================================
// API Routes
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FarmDirect API', uptime: process.uptime() });
});

// --- Products ---
app.get('/api/products', (req, res) => {
  const { category, search, farmerId } = req.query;
  let filtered = [...products];
  if (farmerId) filtered = filtered.filter(p => p.farmerId === farmerId);
  if (category && category !== 'all') filtered = filtered.filter(p => p.category === category);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.cropName.toLowerCase().includes(q) || p.farmerName.toLowerCase().includes(q));
  }
  // Attach computed pricing to each product
  const withPricing = filtered.map(p => {
    const cropKey = p.cropName.toLowerCase().replace(/\s+/g, '');
    const pricing = calculatePricing(p.farmPrice, cropKey);
    return { ...p, ...pricing };
  });
  res.json({ success: true, data: withPricing });
});

app.post('/api/products', (req, res) => {
  const body = req.body;
  if (!body.cropName || !body.farmPrice || !body.quantity) {
    return res.status(400).json({ success: false, error: 'cropName, farmPrice, and quantity are required' });
  }
  const newProduct = {
    id: `P${Date.now()}`,
    farmerId: body.farmerId || 'F001',
    farmerName: body.farmerName || 'Unknown Farmer',
    cropName: body.cropName,
    cropNameHi: body.cropNameHi || body.cropName,
    category: body.category || 'vegetables',
    variety: body.variety || 'Standard',
    quantity: Number(body.quantity),
    unit: body.unit || 'kg',
    farmPrice: Number(body.farmPrice),
    grade: body.grade || 'A',
    organic: body.organic || false,
    harvestDate: body.harvestDate || new Date().toISOString().split('T')[0],
    location: body.location || 'India',
    available: true,
    rating: 5.0,
    createdAt: new Date().toISOString(),
  };
  products.unshift(newProduct);

  // Push notification
  notifications.unshift({
    id: `N${Date.now()}`,
    type: 'new_listing',
    message: `${newProduct.farmerName} listed ${newProduct.quantity}${newProduct.unit} ${newProduct.cropName}`,
    createdAt: new Date().toISOString(),
  });

  const cropKey = newProduct.cropName.toLowerCase().replace(/\s+/g, '');
  const pricing = calculatePricing(newProduct.farmPrice, cropKey);
  res.status(201).json({ success: true, data: { ...newProduct, ...pricing } });
});

app.patch('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  Object.assign(product, req.body);
  res.json({ success: true, data: product });
});

app.delete('/api/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });
  products.splice(idx, 1);
  res.json({ success: true });
});

// --- Orders ---
app.get('/api/orders', (req, res) => {
  const { farmerId } = req.query;
  let filtered = [...orders];
  if (farmerId) filtered = filtered.filter(o => o.farmerId === farmerId);
  res.json({ success: true, data: filtered });
});

app.post('/api/orders', (req, res) => {
  const body = req.body;
  const newOrder = {
    id: `ORD${Date.now()}`,
    ...body,
    status: 'processing',
    orderDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);

  // Reduce stock
  const product = products.find(p => p.id === body.productId);
  if (product && body.quantity) {
    product.quantity = Math.max(0, product.quantity - Number(body.quantity));
  }

  res.status(201).json({ success: true, data: newOrder });
});

// --- Mandi Prices ---
app.get('/api/mandi-prices', (req, res) => {
  res.json({ success: true, data: mandiPrices });
});

app.get('/api/mandi-prices/:crop', (req, res) => {
  const key = req.params.crop.toLowerCase().replace(/\s+/g, '');
  const data = mandiPrices[key];
  if (!data) return res.json({ success: true, data: { crop: req.params.crop, mandiPrice: 0, avgRetail: 0, note: 'No benchmark available' } });
  res.json({ success: true, data });
});

// --- Notifications ---
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: notifications.slice(0, 20) });
});

// --- Stats ---
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalFarmers: new Set(products.map(p => p.farmerId)).size,
      platformFeePercent: '8%',
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌾 FarmDirect API running → http://localhost:${PORT}`);
});
