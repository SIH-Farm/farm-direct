import React, { useState } from 'react';
import { products, categories, calculateSavings, formatCurrency } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import './Marketplace.css';

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="marketplace-page container">
      {/* Page Header */}
      <div className="marketplace-header text-center">
        <span className="badge badge-green">🌾 Direct Farm Produce</span>
        <h1 className="page-title">Farm-Direct Marketplace</h1>
        <p className="page-subtitle">
          Buy fresh, high-grade produce straight from verified Indian farmers & FPOs.
        </p>

        {/* Search & Filter Bar */}
        <div className="search-filter-bar flex justify-between gap-4 items-center">
          <div className="search-bar flex-1">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by crop (Tomato, Wheat, Turmeric)..."
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
      <div className="product-grid grid grid-3 gap-6">
        {filteredProducts.map(product => {
          const savings = calculateSavings(product.platformPrice, product.retailPrice);
          return (
            <div key={product.id} className="card product-card flex flex-col justify-between">
              <div>
                <div className="product-card-top flex justify-between items-start">
                  <div>
                    <span className="badge badge-green">Grade {product.grade}</span>
                    {product.organic && <span className="badge badge-amber" style={{ marginLeft: '6px' }}>Organic</span>}
                  </div>
                  <span className="savings-badge">Save {savings.percent}%</span>
                </div>

                <div className="product-title-row">
                  <h3 className="product-name">{product.cropName}</h3>
                  <span className="product-variety">{product.variety}</span>
                </div>

                <p className="product-desc">{product.description}</p>

                <div className="product-meta">
                  <div>📍 Harvest: {product.harvestDate}</div>
                  <div>👨‍🌾 Farmer ID: {product.farmerId}</div>
                  <div>⭐ Rating: {product.rating} / 5.0</div>
                </div>

                {/* Price Breakdown */}
                <div className="price-transparency-box">
                  <div className="price-row main">
                    <span>FarmDirect Price:</span>
                    <span className="price-val">₹{product.platformPrice} <small>/ {product.unit}</small></span>
                  </div>
                  <div className="price-row sub text-secondary">
                    <span>Mandi Rate: ₹{product.mandiPrice}/{product.unit}</span>
                    <span style={{ textDecoration: 'line-through' }}>Retail: ₹{product.retailPrice}/{product.unit}</span>
                  </div>
                </div>
              </div>

              <div className="product-card-actions flex justify-between items-center">
                <div>
                  <div className="text-xs text-secondary">Stock: {product.quantity} {product.unit}</div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => addToCart(product, 5)}
                  id={`add-cart-${product.id}`}
                >
                  🛒 Add to Cart (5 kg)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
