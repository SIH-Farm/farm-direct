import React, { useState, useEffect } from 'react';
import { categories, products as initialMockProducts } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { calculatePricing } from '../../utils/pricingEngine';
import PriceBreakdown from '../../components/PriceBreakdown/PriceBreakdown';
import LiveTicker from '../../components/LiveTicker/LiveTicker';
import { useToast } from '../../components/UI/Toast';
import './Marketplace.css';

export default function Marketplace() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPricingId, setExpandedPricingId] = useState(null);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  // Fetch live products from backend API with auto-polling
  const fetchProducts = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await fetch('http://localhost:3001/api/products');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setProductList(json.data);
      }
    } catch (err) {
      if (isInitial) setProductList(initialMockProducts);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(true);
    const interval = setInterval(() => {
      fetchProducts(false);
    }, 6000); // Polling every 6s for live hackathon demo feel
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = productList.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.cropName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.variety?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.farmerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product, qty = 10) => {
    if (product.quantity <= 0) {
      addToast('Sorry, this produce item is currently out of stock!', 'warning');
      return;
    }
    const pricing = calculatePricing(product.farmPrice, product.cropName);
    addToCart({ ...product, price: pricing.platformPrice }, qty);
    addToast(`🛒 Added ${qty}${product.unit} ${product.cropName} to Cart! Saved ${pricing.consumerSavingPercent}% vs retail.`, 'success');
  };

  const isJustListed = (product) => {
    if (!product.createdAt) return false;
    const diffMins = (new Date() - new Date(product.createdAt)) / (1000 * 60);
    return diffMins < 30; // Listed in last 30 minutes
  };

  return (
    <div className="marketplace-page">
      {/* Live Market Activity Ticker */}
      <LiveTicker />

      <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
        {/* Page Header */}
        <div className="marketplace-header text-center">
          {/* <span className="badge badge-green">🌾 Direct Farm Produce • Zero Middlemen</span> */}
          <h1 className="page-title">Farm-Direct Marketplace</h1>
          <p className="page-subtitle">
            Buy fresh, high-grade produce straight from verified Indian farmers & FPOs with transparent pricing.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="search-filter-bar flex justify-between gap-4 items-center">
            <div className="search-bar flex-1">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by item or farmer name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="marketplace-search-input"
              />
            </div>

            <div className="category-pills flex gap-2">
              <button
                className={`pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Produce
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center p-5 card">⏳ Fetching live farmer listings...</div>
        ) : (
          <div className="product-grid grid grid-3 gap-6">
            {filteredProducts.map(product => {
              const pricing = calculatePricing(product.farmPrice, product.cropName);
              const newlyListed = isJustListed(product);
              const isExpanded = expandedPricingId === product.id;

              return (
                <div key={product.id} className="card product-card flex flex-col justify-between" id={`product-${product.id}`}>
                  <div>
                    <div className="product-card-top flex justify-between items-start">
                      <div>
                        {newlyListed && <span className="badge badge-green pulse-glow" style={{ marginRight: '6px' }}>🆕 JUST LISTED</span>}
                        <span className="badge badge-amber">Grade {product.grade || '(Not mentioned by Farmer)'}</span>
                        {product.organic && <span className="badge badge-green" style={{ marginLeft: '6px' }}>Organic</span>}
                      </div>
                      <span className="saving-badge">Save {pricing.consumerSavingPercent}%</span>
                    </div>

                    <div className="product-title-row mt-2">
                      <h3 className="product-name">{product.cropName}</h3>
                      <span className="product-variety text-xs text-secondary">{product.variety || 'Standard'}</span>
                    </div>

                    <p className="product-desc text-sm">{product.description || `Fresh ${product.cropName} directly listed by farmer.`}</p>

                    <div className="product-meta text-xs text-secondary my-2">
                      <div>📍 Location: {product.location || 'Nashik, MH'}</div>
                      <div>Listed by: <strong>{product.farmerName || 'Rajesh Patil'}</strong></div>
                      <div>⭐ Rating: {product.rating || '4.8'} / 5.0</div>
                    </div>

                    {/* Compact Transparent Pricing Display */}
                    <div className="price-transparency-box p-3 my-2" style={{ background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-xs text-secondary">FarmDirect Price:</span>
                          <div className="text-xl font-bold text-primary">₹{pricing.platformPrice} <small className="text-xs text-secondary">/ {product.unit || 'kg'}</small></div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs strike text-secondary">Supermarket: ₹{pricing.retailPrice}</span>
                          <div className="text-xs text-success font-bold">Save ₹{pricing.consumerSaving}/{product.unit || 'kg'}</div>
                        </div>
                      </div>

                      <button
                        className="btn-link text-xs mt-2"
                        style={{ color: '#0284c7', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setExpandedPricingId(isExpanded ? null : product.id)}
                      >
                        {isExpanded ? 'Hide Pricing Formula ▲' : '💡 See Full Price Breakdown ▼'}
                      </button>

                      {isExpanded && (
                        <div className="mt-3">
                          <PriceBreakdown farmPrice={product.farmPrice} cropName={product.cropName} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="product-card-actions flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div>
                      <div className="text-xs font-semibold text-secondary">Stock: {product.quantity} {product.unit || 'kg'}</div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(product, 10)}
                      id={`add-cart-${product.id}`}
                    >
                      🛒 Add 10{product.unit || 'kg'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
