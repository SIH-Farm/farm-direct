import express from 'express';
import cors from 'cors';
// Shared pricing engine — the SAME module the React client renders from, so a price
// shown on a product card, quoted in the cart and written onto an order can never drift.
import { calculatePricing, MANDI_BENCHMARKS } from '../client/src/utils/pricingEngine.js';

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
    available: true, rating: 4.7, minOrder: 5, createdAt: new Date('2026-09-10').toISOString(),
  },
  {
    id: 'P002', farmerId: 'FPO001', farmerName: 'Sahyadri FPO',
    cropName: 'Onion', cropNameHi: 'प्याज', category: 'vegetables', variety: 'Nashik Red',
    quantity: 2000, unit: 'kg', farmPrice: 18, grade: 'A', organic: false,
    harvestDate: '2026-09-05', location: 'Mohadi, Nashik, MH',
    available: true, rating: 4.8, minOrder: 10, createdAt: new Date('2026-09-05').toISOString(),
  },
  {
    id: 'P003', farmerId: 'F002', farmerName: 'Gurpreet Singh',
    cropName: 'Wheat', cropNameHi: 'गेहूं', category: 'grains', variety: 'Sharbati',
    quantity: 5000, unit: 'kg', farmPrice: 28, grade: 'A', organic: false,
    harvestDate: '2026-04-15', location: 'Ajnala, Amritsar, PB',
    available: true, rating: 4.9, minOrder: 25, createdAt: new Date('2026-04-15').toISOString(),
  },
  {
    id: 'P004', farmerId: 'F003', farmerName: 'Lakshmi Devi',
    cropName: 'Coffee', cropNameHi: 'कॉफी', category: 'spices', variety: 'Arabica (Coorg)',
    quantity: 200, unit: 'kg', farmPrice: 350, grade: 'A', organic: true,
    harvestDate: '2026-08-20', location: 'Coorg, KA',
    available: true, rating: 4.9, minOrder: 1, createdAt: new Date('2026-08-20').toISOString(),
  },
  {
    id: 'P005', farmerId: 'F004', farmerName: 'Ram Kumar Yadav',
    cropName: 'Mango', cropNameHi: 'आम', category: 'fruits', variety: 'Dasheri',
    quantity: 1000, unit: 'kg', farmPrice: 60, grade: 'A', organic: false,
    harvestDate: '2026-06-15', location: 'Malihabad, Lucknow, UP',
    available: true, rating: 4.8, minOrder: 5, createdAt: new Date('2026-06-15').toISOString(),
  },
  {
    id: 'P006', farmerId: 'FPO002', farmerName: 'Kerala Spice Growers FPO',
    cropName: 'Black Pepper', cropNameHi: 'काली मिर्च', category: 'spices', variety: 'Malabar',
    quantity: 300, unit: 'kg', farmPrice: 450, grade: 'A', organic: true,
    harvestDate: '2026-07-10', location: 'Idukki, KL',
    available: true, rating: 4.9, minOrder: 1, createdAt: new Date('2026-07-10').toISOString(),
  },
];

let orders = [
  { id: 'ORD001', productId: 'P001', buyerName: 'Priya Mehta', farmerId: 'F001', quantity: 10, totalAmount: 270, status: 'delivered', orderDate: '2026-09-10', createdAt: new Date('2026-09-10').toISOString() },
  { id: 'ORD002', productId: 'P002', buyerName: 'Amit Sharma', farmerId: 'FPO001', quantity: 50, totalAmount: 972, status: 'in_transit', orderDate: '2026-09-13', createdAt: new Date('2026-09-13').toISOString() },
];

let notifications = [];

// ============================================
// Pricing helpers (thin wrappers over the shared engine)
// ============================================

const cropKeyOf = (cropName = '') => cropName.toLowerCase().replace(/\s+/g, '');
const round2 = (n) => Math.round(n * 100) / 100;

/** Attaches the full transparent-pricing breakdown to a product. */
const priced = (product) => ({
  ...product,
  ...calculatePricing(product.farmPrice, cropKeyOf(product.cropName)),
});

// ============================================
// Order helpers
// ============================================

const STATUS_STEP = {
  cancelled: 0,
  processing: 1,
  confirmed: 2,
  in_transit: 3,
  delivered: 4,
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

/**
 * Builds a fully-priced order from raw line items.
 * Every line is validated BEFORE any stock is touched, and the farmer payout is
 * derived from each product's own farm price — never from the cart total — so the
 * receipt always matches the business model (consumer pays farmPrice + 8%).
 */
function buildOrder({ id, buyerName, buyerLocation, items, status, orderDate, createdAt }) {
  let totalAmount = 0;
  let farmerPayout = 0;
  const lines = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) throw httpError(404, `Product ${item.productId} not found`);

    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw httpError(400, `Quantity for ${product.cropName} must be a positive number`);
    }
    if (quantity > product.quantity) {
      throw httpError(409, `Only ${product.quantity}${product.unit} of ${product.cropName} left in stock`);
    }

    const pricing = calculatePricing(product.farmPrice, cropKeyOf(product.cropName));
    totalAmount = round2(totalAmount + pricing.platformPrice * quantity);
    farmerPayout = round2(farmerPayout + pricing.farmPrice * quantity);

    lines.push({
      productId: product.id,
      cropName: product.cropName,
      unit: product.unit,
      quantity,
      pricePerUnit: pricing.platformPrice,
      farmPrice: pricing.farmPrice,
      lineTotal: round2(pricing.platformPrice * quantity),
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      farmerLocation: product.location,
    });
  }

  const resolvedStatus = status || 'processing';

  return {
    id,
    buyerName: buyerName || 'FarmDirect Buyer',
    buyerLocation: buyerLocation || 'India',
    items: lines,
    farmerId: lines[0]?.farmerId,
    farmerName: lines[0]?.farmerName,
    totalAmount,
    farmerPayout,
    platformFee: round2(totalAmount - farmerPayout),
    status: resolvedStatus,
    statusStep: STATUS_STEP[resolvedStatus] ?? 1,
    orderDate: orderDate || new Date().toISOString().split('T')[0],
    createdAt: createdAt || new Date().toISOString(),
  };
}

/** Seeded orders only carry a productId; hydrate them through the same builder. */
function hydrateOrder(order) {
  if (Array.isArray(order.items)) return order;
  if (order.productId) {
    try {
      return buildOrder({
        id: order.id,
        buyerName: order.buyerName,
        items: [{ productId: order.productId, quantity: order.quantity }],
        status: order.status,
        orderDate: order.orderDate,
        createdAt: order.createdAt,
      });
    } catch {
      // Product was removed — fall through to a safe shape.
    }
  }
  return { ...order, items: [], statusStep: STATUS_STEP[order.status] ?? 1 };
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
  res.json({ success: true, data: filtered.map(priced) });
});

app.post('/api/products', (req, res) => {
  const body = req.body || {};
  const quantity = Number(body.quantity);
  const farmPrice = Number(body.farmPrice);

  const errors = [];
  if (!body.cropName || typeof body.cropName !== 'string' || !body.cropName.trim()) {
    errors.push('cropName is required');
  }
  if (!Number.isFinite(farmPrice) || farmPrice <= 0) {
    errors.push('farmPrice must be a positive number');
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.push('quantity must be a positive number');
  }
  if (errors.length) {
    return res.status(400).json({ success: false, error: errors.join(', ') });
  }

  const newProduct = {
    id: `P${Date.now()}`,
    farmerId: body.farmerId || 'F001',
    farmerName: body.farmerName || 'Unknown Farmer',
    cropName: body.cropName.trim(),
    cropNameHi: body.cropNameHi || body.cropName.trim(),
    category: body.category || 'vegetables',
    variety: body.variety || 'Standard',
    quantity,
    unit: body.unit || 'kg',
    farmPrice,
    grade: body.grade || 'A',
    organic: body.organic === true,
    harvestDate: body.harvestDate || new Date().toISOString().split('T')[0],
    location: body.location || 'India',
    description: body.description || `Fresh ${body.cropName.trim()} directly listed by the farmer.`,
    minOrder: Number.isFinite(Number(body.minOrder)) && Number(body.minOrder) > 0 ? Number(body.minOrder) : 1,
    available: true,
    rating: 5.0,
    createdAt: new Date().toISOString(),
  };
  products.unshift(newProduct);

  notifications.unshift({
    id: `N${Date.now()}`,
    type: 'new_listing',
    message: `${newProduct.farmerName} listed ${newProduct.quantity}${newProduct.unit} ${newProduct.cropName}`,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, data: priced(newProduct) });
});

// Only these fields may ever be modified through the API.
const PATCHABLE_PRODUCT_FIELDS = [
  'cropName', 'cropNameHi', 'category', 'variety', 'quantity', 'unit', 'farmPrice',
  'grade', 'organic', 'harvestDate', 'location', 'description', 'available', 'minOrder',
];

app.patch('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const body = req.body || {};
  const updates = {};
  for (const field of PATCHABLE_PRODUCT_FIELDS) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: `Provide at least one updatable field: ${PATCHABLE_PRODUCT_FIELDS.join(', ')}`,
    });
  }

  if (updates.quantity !== undefined) {
    updates.quantity = Number(updates.quantity);
    if (!Number.isFinite(updates.quantity) || updates.quantity < 0) {
      return res.status(400).json({ success: false, error: 'quantity must be zero or more' });
    }
  }
  if (updates.farmPrice !== undefined) {
    updates.farmPrice = Number(updates.farmPrice);
    if (!Number.isFinite(updates.farmPrice) || updates.farmPrice <= 0) {
      return res.status(400).json({ success: false, error: 'farmPrice must be a positive number' });
    }
  }

  Object.assign(product, updates);
  res.json({ success: true, data: priced(product) });
});

app.delete('/api/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });
  products.splice(idx, 1);
  res.json({ success: true });
});

// --- Orders ---
app.get('/api/orders', (req, res) => {
  const { farmerId, buyerName } = req.query;
  let filtered = [...orders];
  if (farmerId) filtered = filtered.filter(o => o.farmerId === farmerId);
  if (buyerName) filtered = filtered.filter(o => o.buyerName === buyerName);
  res.json({ success: true, data: filtered.map(hydrateOrder) });
});

/**
 * Creates an order and reserves stock.
 * Accepts either the legacy single-line shape `{ productId, quantity }`
 * or a full cart `{ buyerName, items: [{ productId, quantity }] }`.
 */
app.post('/api/orders', (req, res) => {
  const body = req.body || {};
  const rawItems = Array.isArray(body.items)
    ? body.items
    : (body.productId ? [{ productId: body.productId, quantity: body.quantity }] : []);

  if (rawItems.length === 0) {
    return res.status(400).json({ success: false, error: 'An order needs at least one item' });
  }

  let order;
  try {
    // buildOrder validates every line (existence, quantity, stock) before we mutate anything.
    order = buildOrder({
      id: `ORD${Date.now()}`,
      buyerName: body.buyerName,
      buyerLocation: body.buyerLocation,
      items: rawItems,
      status: 'processing',
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message });
  }

  // Stock is only decremented once the whole order has been validated.
  for (const line of order.items) {
    const product = products.find(p => p.id === line.productId);
    if (product) product.quantity = Math.max(0, product.quantity - line.quantity);
  }

  orders.unshift(order);

  notifications.unshift({
    id: `N${Date.now()}`,
    type: 'new_order',
    message: `${order.buyerName} ordered ${order.items.map(i => `${i.quantity}${i.unit} ${i.cropName}`).join(', ')}`,
    createdAt: order.createdAt,
  });

  res.status(201).json({ success: true, data: hydrateOrder(order) });
});

// --- Mandi Prices ---
app.get('/api/mandi-prices', (req, res) => {
  res.json({ success: true, data: MANDI_BENCHMARKS });
});

app.get('/api/mandi-prices/:crop', (req, res) => {
  const data = MANDI_BENCHMARKS[cropKeyOf(req.params.crop)];
  if (!data) {
    return res.json({
      success: true,
      data: { crop: req.params.crop, mandiPrice: 0, avgRetail: 0, note: 'No benchmark available' },
    });
  }
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

// --- Fallbacks ---
app.use((req, res) => {
  res.status(404).json({ success: false, error: `No route for ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity
app.use((err, req, res, next) => {
  console.error('[FarmDirect API]', err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🌾 FarmDirect API running → http://localhost:${PORT}`);
});
