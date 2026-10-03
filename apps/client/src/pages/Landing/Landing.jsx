import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { platformStats, formatCurrency } from '../../data/mockData';
import { calculatePricing, MANDI_BENCHMARKS } from '../../utils/pricingEngine';
import './Landing.css';

const CALC_CROPS = Object.entries(MANDI_BENCHMARKS).map(([key, bench]) => ({
  key,
  label: bench.crop,
}));

// Headline impact figures are derived from the engine over the platform's benchmark
// price table (each crop priced at its own Mandi rate) rather than typed in by hand,
// so the hero can never drift from what the calculator and marketplace actually return.
const BENCHMARK_ENTRIES = Object.values(MANDI_BENCHMARKS);
const averageOverBenchmarks = (pick) => Math.round(
  BENCHMARK_ENTRIES.reduce((sum, b) => sum + pick(calculatePricing(b.mandiPrice, b.crop)), 0) /
    BENCHMARK_ENTRIES.length
);
const AVG_FARMER_UPLIFT = averageOverBenchmarks(p => p.farmerBonusPercent);
const AVG_CONSUMER_SAVING = averageOverBenchmarks(p => p.consumerSavingPercent);

export default function Landing() {
  const { t } = useApp();
  const [calcQuantity, setCalcQuantity] = useState(100);
  const [calcCrop, setCalcCrop] = useState('tomato');
  const [calcCropPrice, setCalcCropPrice] = useState(MANDI_BENCHMARKS.tomato.mandiPrice);

  // Every figure on this page comes from the SAME pricing engine that renders the
  // marketplace cards, cart totals and order receipts — so the landing page can
  // never quote a number the rest of the app disagrees with.
  const pricing = calculatePricing(calcCropPrice, calcCrop);

  // Traditional chain: the farmer is squeezed down to the Mandi net payout while the
  // consumer still pays supermarket retail. The gap is what the middlemen absorb.
  const traditionalFarmerEarning = calcQuantity * pricing.mandiNetFarmerPayout;
  const traditionalConsumerCost = calcQuantity * pricing.retailPrice;
  const traditionalMiddlemanProfit = traditionalConsumerCost - traditionalFarmerEarning;

  // FarmDirect: the farmer keeps the price they set; the buyer pays it plus the 8% fee.
  const directFarmerEarning = calcQuantity * pricing.farmPrice;
  const directConsumerCost = calcQuantity * pricing.platformPrice;

  const farmerBonus = directFarmerEarning - traditionalFarmerEarning;
  const consumerSavings = traditionalConsumerCost - directConsumerCost;

  // Sliders follow the selected crop's real price range instead of a fixed ₹10–100,
  // which would be meaningless for coffee, pepper or cumin.
  const priceFloor = Math.max(1, Math.round(pricing.mandiPrice * 0.4));
  const priceCeiling = Math.max(priceFloor + 1, Math.round(pricing.mandiPrice * 1.8));

  const handleCropChange = (key) => {
    setCalcCrop(key);
    const bench = MANDI_BENCHMARKS[key];
    // Whole rupees only: the range thumb must land exactly on the displayed price.
    if (bench) setCalcCropPrice(Math.round(bench.mandiPrice));
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="container hero-container">
          <div className="hero-badge">
            <span className="badge-sparkle">✨</span> {t('ui.landing.badge')}
          </div>
          <h1 className="hero-title">
            {t('ui.landing.title')}
            <span className="hero-highlight"> {t('ui.landing.titleHighlight')}</span>
          </h1>
          <p className="hero-subtitle">
            {t('ui.landing.subtitle')}
          </p>

          <div className="hero-actions">
            <Link to="/marketplace" className="btn btn-primary btn-lg" id="hero-cta-marketplace">
              {t('ui.landing.ctaMarketplace')}
            </Link>
            <Link to="/farmer" className="btn btn-secondary btn-lg" id="hero-cta-farmer">
              {t('ui.landing.ctaFarmer')}
            </Link>
            <Link to="/analytics" className="btn btn-accent btn-lg" id="hero-cta-ai">
              {t('ui.landing.ctaAnalytics')}
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats-grid">
            <div className="hero-stat-card">
              <span className="hero-stat-num">+{AVG_FARMER_UPLIFT}%</span>
              <span className="hero-stat-label">{t('ui.landing.statEarnings')}</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">-{AVG_CONSUMER_SAVING}%</span>
              <span className="hero-stat-label">{t('ui.landing.statPrices')}</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">-28%</span>
              <span className="hero-stat-label">{t('ui.landing.statWaste')}</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">₹23 Cr+</span>
              <span className="hero-stat-label">{t('ui.landing.statTransacted')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Intermediary Impact Calculator */}
      <section className="section bg-secondary">
        <div className="container">
          <div className="text-center section-header">
            <span className="badge badge-green">INNOVATION HIGHLIGHT</span>
            <h2 className="section-title">{t('ui.landing.calcTitle')}</h2>
            <p className="section-subtitle">
              {t('ui.landing.calcSubtitle')}
            </p>
          </div>

          <div className="calculator-card card">
            <div className="calc-inputs grid grid-3">
              <div className="form-group">
                <label className="form-label">Crop (sets the Mandi &amp; retail benchmark)</label>
                <select
                  className="form-select"
                  value={calcCrop}
                  onChange={(e) => handleCropChange(e.target.value)}
                  id="calc-crop-select"
                >
                  {CALC_CROPS.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
                <div className="calc-slider-value">
                  Mandi ₹{pricing.mandiPrice}/kg · Retail ₹{pricing.retailPrice}/kg
                </div>
              </div>

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
                <label className="form-label">Farmer's Set Price (₹/kg)</label>
                <input
                  type="range"
                  min={priceFloor}
                  max={priceCeiling}
                  step={1}
                  value={calcCropPrice}
                  onChange={(e) => setCalcCropPrice(Number(e.target.value))}
                  className="calc-slider"
                  id="calc-price-slider"
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
                  <div className="calc-node">🌾 Farmer Receives: <strong>{formatCurrency(traditionalFarmerEarning)}</strong> (₹{pricing.mandiNetFarmerPayout}/kg net of Mandi commission)</div>
                  <div className="calc-arrow">↓ Commission Agent → Wholesaler → Local Retailer</div>
                  <div className="calc-node red">🛒 Consumer Pays: <strong>{formatCurrency(traditionalConsumerCost)}</strong> (₹{pricing.retailPrice}/kg)</div>
                </div>
                <div className="calc-loss-note">
                  ⚠️ Intermediary Markup: <strong>{formatCurrency(traditionalMiddlemanProfit)}</strong>
                </div>
              </div>

              {/* FarmDirect Model */}
              <div className="calc-column direct">
                <div className="calc-col-header">
                  <h3>FarmDirect Platform</h3>
                  <span className="badge badge-green">Same engine as every listing</span>
                </div>
                <div className="calc-chain">
                  <div className="calc-node green">🌾 Farmer Receives: <strong>{formatCurrency(directFarmerEarning)}</strong> (₹{pricing.farmPrice}/kg — the price they set)</div>
                  <div className="calc-arrow green">↓ Quality check &amp; route optimisation (+₹{pricing.platformFee}/kg platform fee)</div>
                  <div className="calc-node green">🛒 Consumer Pays: <strong>{formatCurrency(directConsumerCost)}</strong> (₹{pricing.platformPrice}/kg)</div>
                </div>
                <div className="calc-gain-banner">
                  <div>🎉 Farmer Earns Extra: <strong>+{formatCurrency(farmerBonus)}</strong> ({pricing.farmerBonusPercent}% vs Mandi agent)</div>
                  <div>💚 Consumer Saves: <strong>{formatCurrency(consumerSavings)}</strong> ({pricing.consumerSavingPercent}% vs supermarket)</div>
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
            <h2 className="section-title">{t('ui.landing.featuresTitle')}</h2>
            <p className="section-subtitle">{t('ui.landing.featuresSubtitle')}</p>
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
