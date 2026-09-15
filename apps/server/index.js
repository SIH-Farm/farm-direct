import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory data store seeded from mock domain logic
let products = [
  {
    id: 'P001',
    farmerId: 'F001',
    farmerName: 'Rajesh Patil',
    cropName: 'Tomato',
    cropNameHi: 'टमाटर',
    category: 'vegetables',
    variety: 'Hybrid Cherry',
    quantity: 500,
    unit: 'kg',
    farmPrice: 25,
    platformPrice: 32,
    retailPrice: 60,
    mandiPrice: 28,
    grade: 'A',
    organic: false,
    harvestDate: '2026-09-10',
    location: 'Sinnar, Nashik, MH',
    available: true,
    rating: 4.7,
  },
  {
    id: 'P002',
    farmerId: 'FPO001',
    farmerName: 'Sahyadri Farmer Producer Co.',
    cropName: 'Onion',
    cropNameHi: 'प्याज',
    category: 'vegetables',
    variety: 'Nashik Red',
    quantity: 2000,
    unit: 'kg',
    farmPrice: 18,
    platformPrice: 24,
    retailPrice: 45,
    mandiPrice: 22,
    grade: 'A',
    organic: false,
    harvestDate: '2026-09-05',
    location: 'Mohadi, Nashik, MH',
    available: true,
    rating: 4.8,
  },
  {
    id: 'P003',
    farmerId: 'F002',
    farmerName: 'Gurpreet Singh',
    cropName: 'Wheat',
    cropNameHi: 'गेहूं',
    category: 'grains',
    variety: 'Sharbati (MP Origin)',
    quantity: 5000,
    unit: 'kg',
    farmPrice: 28,
    platformPrice: 35,
    retailPrice: 55,
    mandiPrice: 32,
    grade: 'A',
    organic: false,
    harvestDate: '2026-04-15',
    location: 'Ajnala, Amritsar, PB',
    available: true,
    rating: 4.9,
  },
  {
    id: 'P004',
    farmerId: 'F003',
    farmerName: 'Lakshmi Devi',
    cropName: 'Coffee',
    cropNameHi: 'कॉफी',
    category: 'spices',
    variety: 'Arabica (Coorg)',
    quantity: 200,
    unit: 'kg',
    farmPrice: 350,
    platformPrice: 450,
    retailPrice: 800,
    mandiPrice: 420,
    grade: 'A',
    organic: true,
    harvestDate: '2026-08-20',
    location: 'Coorg, KA',
    available: true,
    rating: 4.9,
  }
];

let orders = [
  {
    id: 'ORD001',
    productId: 'P001',
    buyerName: 'Priya Mehta',
    quantity: 10,
    unit: 'kg',
    totalAmount: 320,
    status: 'delivered',
    orderDate: '2026-09-10',
    deliveryAddress: 'Andheri West, Mumbai',
  },
  {
    id: 'ORD002',
    productId: 'P002',
    buyerName: 'Amit Sharma',
    quantity: 50,
    unit: 'kg',
    totalAmount: 1200,
    status: 'in_transit',
    orderDate: '2026-09-13',
    deliveryAddress: 'Koregaon Park, Pune',
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FarmDirect Backend API', time: new Date() });
});

// Products
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...products];
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      p => p.cropName.toLowerCase().includes(query) || p.farmerName.toLowerCase().includes(query)
    );
  }
  res.json({ success: true, data: filtered });
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: `P${String(products.length + 1).padStart(3, '0')}`,
    available: true,
    rating: 5.0,
    platformPrice: Math.round(Number(req.body.farmPrice) * 1.25),
    retailPrice: Math.round(Number(req.body.farmPrice) * 2.1),
    mandiPrice: Math.round(Number(req.body.farmPrice) * 1.15),
    ...req.body,
  };
  products.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

// Orders
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: orders });
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
    orderDate: new Date().toISOString().split('T')[0],
    status: 'processing',
    ...req.body,
  };
  orders.unshift(newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalFarmers: 12450,
      totalFPOs: 342,
      totalValueTransacted: '₹23.4 Cr',
      farmerEarningsIncrease: '35%',
      consumerSavings: '42%',
      wasteReduction: '28%'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌾 FarmDirect Express API server running on port ${PORT}`);
});
