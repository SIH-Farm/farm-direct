import React, { useState, useEffect } from 'react';
import { categories, products as initialMockProducts } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { calculatePricing } from '../../utils/pricingEngine';
import { apiGet } from '../../utils/api';
import PriceBreakdown from '../../components/PriceBreakdown/PriceBreakdown';
import LiveTicker from '../../components/LiveTicker/LiveTicker';
import { useToast } from '../../components/UI/Toast';
import './Marketplace.css';

/** The smallest sensible order: the farmer's minimum, never more than current stock. */
function defaultOrderQuantity(product) {
  const minOrder = Number(product.minOrder) > 0 ? Number(product.minOrder) : 1;
  const stock = Number(product.quantity) || 0;
  return stock > 0 ? Math.min(minOrder, stock) : minOrder;
}

export default function Marketplace() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPricingId, setExpandedPricingId] = useState(null);
  const { addToCart } = useCart();
  const { t, language } = useApp();
  const { addToast } = useToast();

  // Fetch live products from backend API with auto-polling
  const fetchProducts = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await apiGet('/products');
      if (Array.isArray(data) && data.length > 0) setProductList(data);
    } catch {
      // Server offline — fall back to bundled demo data so the demo never dies.
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

  const handleAddToCart = (product, quantity) => {
    const stock = Number(product.quantity) || 0;
    if (stock <= 0) {
      addToast(`Sorry, ${product.cropName} is currently out of stock!`, 'warning');
      return;
    }
    const qty = quantity || defaultOrderQuantity(product);
    const pricing = calculatePricing(product.farmPrice, product.cropName);
    addToCart({ ...product, price: pricing.platformPrice }, qty);
    addToast(` Added ${qty}${product.unit || 'kg'} ${product.cropName} — you save ${pricing.consumerSavingPercent}% vs retail`, 'success');
  };

  const isJustListed = (product) => {
    if (!product.createdAt) return false;
    const diffMins = (new Date() - new Date(product.createdAt)) / (1000 * 60);
    return diffMins < 30; // Listed in last 30 minutes
  };

  return (
    <div className="marketplace-page">
      {/* Live Market Activity Ticker */}
      {/* <LiveTicker /> */}

      <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
        {/* Page Header */}
        <div className="marketplace-header text-center">
          <span className="badge badge-green">🌾 {t('ui.marketplace.badge')}</span>
          <h1 className="page-title">{t('ui.marketplace.title')}</h1>
          <p className="page-subtitle">
            {t('ui.marketplace.subtitle')}
          </p>

          {/* Search & Category Filter Bar */}
          <div className="search-filter-bar flex justify-between gap-4 items-center">
            <div className="search-bar flex-1">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={t('ui.marketplace.searchPlaceholder')}
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
                {t('ui.marketplace.allCategories')}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon} {language === 'hi' ? cat.nameHi : cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center p-5 card">⏳ {t('ui.marketplace.listing')}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-5 card">
            <div style={{ fontSize: '2.5rem' }}>🧺</div>
            <h3 style={{ marginTop: '8px' }}>{t('ui.marketplace.emptyTitle')}</h3>
            <p className="text-secondary text-sm" style={{ marginTop: '4px' }}>
              {t('ui.marketplace.emptyBody')}
            </p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '12px' }}
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              {t('ui.marketplace.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="product-grid grid grid-3 gap-6">
            {filteredProducts.map(product => {
              const pricing = calculatePricing(product.farmPrice, product.cropName);
              const newlyListed = isJustListed(product);
              const isExpanded = expandedPricingId === product.id;
              const orderQty = defaultOrderQuantity(product);
              const outOfStock = !(Number(product.quantity) > 0);

              return (
                <div key={product.id} className="card product-card flex flex-col justify-between" id={`product-${product.id}`}>
                  <div>
                    <div className="product-card-top flex justify-between items-start">
                      <div>
                        {newlyListed && <span className="badge badge-green pulse-glow" style={{ marginRight: '6px' }}>🆕 JUST LISTED</span>}
                        <span className="badge badge-amber">Grade {product.grade || '(Not mentioned by Farmer)'}</span>
                        {product.organic && <span className="badge badge-green" style={{ marginLeft: '6px' }}>Organic</span>}
                      </div>
                      <span className="saving-badge">{t('ui.marketplace.save')} {pricing.consumerSavingPercent}%</span>
                    </div>

                    <div className="product-title-row mt-2">
                      <h3 className="product-name">{product.cropName}</h3>
                      <span className="product-variety text-xs text-secondary">{product.variety || 'Standard'}</span>
                    </div>

                    <p className="product-desc text-sm">{product.description || `Fresh ${product.cropName} directly listed by farmer.`}</p>

                    <div className="product-meta text-xs text-secondary my-2">
                      <div>📍 {t('ui.marketplace.location')}: {product.location || 'Nashik, MH'}</div>
                      <div>🧑‍🌾 {t('ui.marketplace.listedBy')}: <strong>{product.farmerName || 'Rajesh Patil'}</strong></div>
                      <div>⭐ Rating: {product.rating || '4.8'} / 5.0</div>
                    </div>

                    {/* Compact Transparent Pricing Display */}
                    <div className="price-transparency-box p-3 my-2" style={{ background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-xs text-secondary">{t('ui.marketplace.farmPrice')}:</span>
                          <div className="text-xl font-bold text-primary">₹{pricing.platformPrice} <small className="text-xs text-secondary">/ {product.unit || 'kg'}</small></div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs strike text-secondary">{t('ui.marketplace.supermarket')}: ₹{pricing.retailPrice}</span>
                          <div className="text-xs text-success font-bold">{t('ui.marketplace.save')} ₹{pricing.consumerSaving}/{product.unit || 'kg'}</div>
                        </div>
                      </div>

                      <button
                        className="btn-link text-xs mt-2"
                        style={{ color: '#0284c7', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setExpandedPricingId(isExpanded ? null : product.id)}
                      >
                        {isExpanded ? t('ui.marketplace.hideBreakdown') : t('ui.marketplace.seeBreakdown')}
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
                      <div className="text-xs font-semibold text-secondary">{t('ui.marketplace.stock')}: {product.quantity} {product.unit || 'kg'}</div>
                      {outOfStock && <div className="text-xs font-bold" style={{ color: '#dc2626' }}>{t('ui.marketplace.outOfStock')}</div>}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(product, orderQty)}
                      id={`add-cart-${product.id}`}
                    >
                      🛒 {t('common.addToCart')} {orderQty}{product.unit || 'kg'}
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
