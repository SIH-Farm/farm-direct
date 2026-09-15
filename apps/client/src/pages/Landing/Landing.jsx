import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { platformStats, formatCurrency } from '../../data/mockData';
import './Landing.css';

export default function Landing() {
  const { t, language } = useApp();
  const [calcQuantity, setCalcQuantity] = useState(100);
  const [calcCropPrice, setCalcCropPrice] = useState(25); // ₹25/kg farmer cost

  // Intermediary math
  const traditionalFarmerEarning = calcQuantity * calcCropPrice;
  const traditionalConsumerCost = calcQuantity * (calcCropPrice * 2.4); // 140% markup through 4 middlemen
  const traditionalMiddlemanProfit = traditionalConsumerCost - traditionalFarmerEarning;

  // FarmDirect math
  const directFarmerEarning = calcQuantity * (calcCropPrice * 1.35); // +35% earnings
  const directConsumerCost = calcQuantity * (calcCropPrice * 1.35 * 1.25); // direct platform price

  const farmerBonus = directFarmerEarning - traditionalFarmerEarning;
  const consumerSavings = traditionalConsumerCost - directConsumerCost;

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="container hero-container">
          <div className="hero-badge">
            <span className="badge-sparkle">✨</span> Direct Farm-to-Fork Ecosystem
          </div>
          <h1 className="hero-title">
            {language === 'hi' ? 'खेत से आपकी थाली तक,' : 'Direct from Farmers to Consumers,'}
            <span className="hero-highlight"> {language === 'hi' ? 'बिना बिचौलिए' : 'Cutting Out Middlemen'}</span>
          </h1>
          <p className="hero-subtitle">
            Eliminating supply chain inefficiencies with AI-driven demand forecasting, real-time Mandi price transparency, and route optimization. Better earnings for farmers, lower prices for buyers.
          </p>

          <div className="hero-actions">
            <Link to="/marketplace" className="btn btn-primary btn-lg" id="hero-cta-marketplace">
              🛒 Explore Marketplace
            </Link>
            <Link to="/farmer" className="btn btn-secondary btn-lg" id="hero-cta-farmer">
              🧑‍🌾 Farmer / FPO Login
            </Link>
            <Link to="/analytics" className="btn btn-accent btn-lg" id="hero-cta-ai">
              📊 AI Analytics & Routes
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats-grid">
            <div className="hero-stat-card">
              <span className="hero-stat-num">+35%</span>
              <span className="hero-stat-label">Higher Farmer Earnings</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">-42%</span>
              <span className="hero-stat-label">Lower Consumer Prices</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">-28%</span>
              <span className="hero-stat-label">Post-Harvest Waste Cut</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">₹23 Cr+</span>
              <span className="hero-stat-label">Transacted Directly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Intermediary Impact Calculator */}
      <section className="section bg-secondary">
        <div className="container">
          <div className="text-center section-header">
            <span className="badge badge-green">INNOVATION HIGHLIGHT</span>
            <h2 className="section-title">The Price Disparity Engine</h2>
            <p className="section-subtitle">
              See how traditional commission agents (arhatiyas) inflate prices vs. FarmDirect's transparent pricing
            </p>
          </div>

          <div className="calculator-card card">
            <div className="calc-inputs grid grid-2">
              <div className="form-group">
                <label className="form-label">Harvest Produce Quantity (kg)</label>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                  className="calc-slider"
                />
                <div className="calc-slider-value">{calcQuantity} kg</div>
              </div>

              <div className="form-group">
                <label className="form-label">Base Harvest Cost per kg (₹)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={calcCropPrice}
                  onChange={(e) => setCalcCropPrice(Number(e.target.value))}
                  className="calc-slider"
                />
                <div className="calc-slider-value">₹{calcCropPrice}/kg</div>
              </div>
            </div>

            <div className="calc-comparison grid grid-2 gap-6">
              {/* Traditional Model */}
              <div className="calc-column traditional">
                <div className="calc-col-header">
                  <h3>Traditional Supply Chain</h3>
                  <span className="badge badge-red">4 Intermediaries</span>
                </div>
                <div className="calc-chain">
                  <div className="calc-node">🌾 Farmer Receives: <strong>{formatCurrency(traditionalFarmerEarning)}</strong> (₹{calcCropPrice}/kg)</div>
                  <div className="calc-arrow">↓ Commission Agent (+20%)</div>
                  <div className="calc-arrow">↓ Wholesaler (+40%)</div>
                  <div className="calc-arrow">↓ Local Retailer (+80%)</div>
                  <div className="calc-node red">🛒 Consumer Pays: <strong>{formatCurrency(traditionalConsumerCost)}</strong> (₹{(traditionalConsumerCost/calcQuantity).toFixed(1)}/kg)</div>
                </div>
                <div className="calc-loss-note">
                  ⚠️ Intermediary Markup: <strong>{formatCurrency(traditionalMiddlemanProfit)}</strong>
                </div>
              </div>

              {/* FarmDirect Model */}
              <div className="calc-column direct">
                <div className="calc-col-header">
                  <h3>FarmDirect Platform</h3>
                  <span className="badge badge-green">Direct AI Match</span>
                </div>
                <div className="calc-chain">
                  <div className="calc-node green">🌾 Farmer Receives: <strong>{formatCurrency(directFarmerEarning)}</strong> (₹{(directFarmerEarning/calcQuantity).toFixed(1)}/kg)</div>
                  <div className="calc-arrow green">↓ Direct Quality & Logistics Route Optimization</div>
                  <div className="calc-node green">🛒 Consumer Pays: <strong>{formatCurrency(directConsumerCost)}</strong> (₹{(directConsumerCost/calcQuantity).toFixed(1)}/kg)</div>
                </div>
                <div className="calc-gain-banner">
                  <div>🎉 Farmer Earns Extra: <strong>+{formatCurrency(farmerBonus)}</strong></div>
                  <div>💚 Consumer Saves: <strong>{formatCurrency(consumerSavings)}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="section">
        <div className="container">
          <div className="text-center section-header">
            <h2 className="section-title">Comprehensive Platform Features</h2>
            <p className="section-subtitle">Everything needed to run a realistic direct agricultural supply chain</p>
          </div>

          <div className="grid grid-3 gap-6">
            <div className="card feature-card">
              <div className="feature-icon">🧑‍🌾</div>
              <h3>Farmer & FPO Portal</h3>
              <p>Module 1 requirement fulfilled: Easily post produce with crop type, quantity, expected price, harvest date, location, and quality grade. Monitor Mandi comparisons.</p>
              <Link to="/farmer" className="btn btn-secondary btn-sm">Access Portal →</Link>
            </div>

            <div className="card feature-card">
              <div className="feature-icon">🛒</div>
              <h3>Consumer & Bulk Marketplace</h3>
              <p>Browse fresh farm-to-table produce directly from verified farmers across 12 Indian states. Price transparency badges show exact savings vs. local retail markets.</p>
              <Link to="/marketplace" className="btn btn-secondary btn-sm">Shop Fresh →</Link>
            </div>

            <div className="card feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Demand & Route Optimization</h3>
              <p>Predict crop demand curves 6 months in advance. Utilize interactive Leaflet map routing for cold-chain vehicles to minimize transit time and crop spoilage.</p>
              <Link to="/analytics" className="btn btn-secondary btn-sm">View Insights →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
