import React, { useState } from 'react';
import { farmers, states } from '../../data/mockData';
import { calculatePricing, MANDI_BENCHMARKS } from '../../utils/pricingEngine';
import { useToast } from '../../components/UI/Toast';
import './BulkBuyer.css';

const FPOS = farmers.filter(f => f.type === 'fpo');

const sum = (values) => values.reduce((total, v) => total + (v || 0), 0);
const formatINR = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;
const formatCount = (value) => Math.round(value).toLocaleString('en-IN');

const STATE_NAME = Object.fromEntries(states.map(s => [s.id, s.name]));
const stateName = (code) => STATE_NAME[code] || code;

// Crop codes are short slugs; fall back to a tidied label for crops that sit outside
// the benchmark table (cardamom, ginger, maize…).
const cropLabel = (key) =>
  MANDI_BENCHMARKS[key]?.crop || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

// Derived once at module scope so the summary can never disagree with the cards below.
const TOTAL_MEMBERS = sum(FPOS.map(f => f.memberCount));
const REGIONS = [...new Set(FPOS.map(f => f.state))];
const AVG_RATING = FPOS.length
  ? (sum(FPOS.map(f => f.rating)) / FPOS.length).toFixed(1)
  : '—';

const CROP_OPTIONS = Object.entries(MANDI_BENCHMARKS).map(([key, bench]) => ({
  key,
  label: bench.crop,
  mandiPrice: bench.mandiPrice,
}));

const QUALITY_GRADES = [
  'Grade A export standard (NABL accredited)',
  'Organic certified (APEDA / India Organic)',
  'Standard processing grade',
];

/** Default the delivery window three months out, so the form is submittable on load. */
function defaultDeliveryMonth() {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function BulkBuyer() {
  const { addToast } = useToast();

  const [cropKey, setCropKey] = useState('wheat');
  const [tons, setTons] = useState(50);
  const [offerPrice, setOfferPrice] = useState(MANDI_BENCHMARKS.wheat.mandiPrice);
  const [grade, setGrade] = useState(QUALITY_GRADES[0]);
  const [deliveryMonth, setDeliveryMonth] = useState(defaultDeliveryMonth);
  const [submitted, setSubmitted] = useState(false);

  // The SAME engine that prices marketplace listings, so a bulk contract can never
  // quote a different farm price or fee than the produce it is sourced from.
  const pricing = calculatePricing(offerPrice, cropKey);

  const quantityKg = Math.max(0, Number(tons) || 0) * 1000;
  const contractValue = pricing.platformPrice * quantityKg;
  const farmerPayout = pricing.farmPrice * quantityKg;
  const platformFee = pricing.platformFee * quantityKg;
  const retailEquivalent = pricing.retailPrice * quantityKg;
  const bulkSaving = Math.max(0, retailEquivalent - contractValue);
  const bulkSavingPercent = retailEquivalent > 0
    ? Math.round((bulkSaving / retailEquivalent) * 100)
    : 0;

  const handleCropChange = (key) => {
    setCropKey(key);
    const bench = MANDI_BENCHMARKS[key];
    if (bench) setOfferPrice(bench.mandiPrice);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    addToast(
      `📨 RFQ broadcast to all ${FPOS.length} FPO collectives — ${formatCount(tons)}t ${cropLabel(cropKey)}`,
      'success',
      4000
    );
  };

  return (
    <div className="bulk-buyer-page container">
      <header className="bulk-header">
        <span className="badge badge-amber">🏭 Bulk buyer &amp; processor hub</span>
        <h1 className="page-title">FPO Direct Procurement</h1>
        <p className="page-subtitle">
          Source at farm-gate prices from verified FPO collectives — no commission agents, no
          wholesale layer. Build a contract and see the full value split before you send it.
        </p>
      </header>

      {/* ---------- Procurement at a glance ---------- */}
      <section className="bulk-section">
        <div className="grid grid-4 gap-4">
          <div className="card card-body bulk-stat">
            <span className="bulk-stat-label">FPO collectives</span>
            <div className="stat-value">{FPOS.length}</div>
            <span className="bulk-stat-unit">Verified producer companies on the platform</span>
          </div>

          <div className="card card-body bulk-stat">
            <span className="bulk-stat-label">Farmer members reachable</span>
            <div className="stat-value">{formatCount(TOTAL_MEMBERS)}</div>
            <span className="bulk-stat-unit">Aggregated across all collectives</span>
          </div>

          <div className="card card-body bulk-stat">
            <span className="bulk-stat-label">Regions covered</span>
            <div className="stat-value">{REGIONS.length}</div>
            <span className="bulk-stat-unit">{REGIONS.map(stateName).join(' · ')}</span>
          </div>

          <div className="card card-body bulk-stat">
            <span className="bulk-stat-label">Average FPO rating</span>
            <div className="stat-value" style={{ color: '#16a34a' }}>⭐ {AVG_RATING}</div>
            <span className="bulk-stat-unit">Weighted across fulfilled orders</span>
          </div>
        </div>
      </section>

      <div className="grid grid-2 gap-6 bulk-layout">
        {/* ---------- FPO collectives ---------- */}
        <section className="bulk-section">
          <div className="bulk-section-head">
            <h2 className="bulk-section-title">Registered FPO collectives</h2>
            <p className="bulk-section-sub">
              Each collective aggregates member harvests, so a single contract can be filled from
              hundreds of farms at consistent grading.
            </p>
          </div>

          <div className="fpo-list">
            {FPOS.map(fpo => (
              <article className="fpo-card" key={fpo.id}>
                <div className="fpo-card-head">
                  <div>
                    <h3 className="fpo-name">{fpo.name}</h3>
                    <p className="fpo-location">
                      📍 {fpo.village}, {fpo.district} · {stateName(fpo.state)}
                    </p>
                  </div>
                  <span className="badge badge-green">✓ Verified</span>
                </div>

                <dl className="fpo-metrics">
                  <div className="fpo-metric">
                    <dt>Members</dt>
                    <dd>{formatCount(fpo.memberCount)}</dd>
                  </div>
                  <div className="fpo-metric">
                    <dt>Rating</dt>
                    <dd>⭐ {fpo.rating}</dd>
                  </div>
                  <div className="fpo-metric">
                    <dt>Orders filled</dt>
                    <dd>{formatCount(fpo.totalOrders)}</dd>
                  </div>
                </dl>

                <div className="fpo-crops">
                  {fpo.crops.map(crop => (
                    <span className="crop-chip" key={crop}>{cropLabel(crop)}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Contract builder ---------- */}
        <section className="bulk-section">
          <div className="bulk-section-head">
            <h2 className="bulk-section-title">Build a contract request</h2>
            <p className="bulk-section-sub">
              Set the volume and the price you will pay per kg. The split updates as you type — the
              same figures the farmer and the platform will see.
            </p>
          </div>

          <form className="rfq-form card card-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="rfq-crop">Crop / commodity</label>
              <select
                id="rfq-crop"
                className="form-select"
                value={cropKey}
                onChange={(e) => handleCropChange(e.target.value)}
              >
                {CROP_OPTIONS.map(option => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="rfq-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="rfq-tons">Volume (tons)</label>
                <input
                  id="rfq-tons"
                  type="number"
                  min="1"
                  step="1"
                  className="form-input"
                  value={tons}
                  onChange={(e) => setTons(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rfq-price">Your offer (₹/kg)</label>
                <input
                  id="rfq-price"
                  type="number"
                  min="1"
                  step="0.5"
                  className="form-input"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rfq-grade">Quality certificate required</label>
              <select
                id="rfq-grade"
                className="form-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                {QUALITY_GRADES.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rfq-delivery">Delivery target month</label>
              <input
                id="rfq-delivery"
                type="month"
                className="form-input"
                value={deliveryMonth}
                onChange={(e) => setDeliveryMonth(e.target.value)}
                required
              />
            </div>

            {/* Live contract split — recomputed on every keystroke */}
            <div className="rfq-estimate">
              <div className="rfq-estimate-head">
                <span>Contract value</span>
                <strong>{formatINR(contractValue)}</strong>
              </div>

              <div className="rfq-estimate-row">
                <span>Quantity</span>
                <span>{formatCount(quantityKg)} kg</span>
              </div>
              <div className="rfq-estimate-row">
                <span>Farm-gate price</span>
                <span>₹{pricing.farmPrice}/kg</span>
              </div>
              <div className="rfq-estimate-row">
                <span>Platform &amp; quality fee</span>
                <span>+₹{pricing.platformFee}/kg</span>
              </div>
              <div className="rfq-estimate-divider" />
              <div className="rfq-estimate-row strong">
                <span>Farmer collectives receive</span>
                <span>{formatINR(farmerPayout)}</span>
              </div>
              <div className="rfq-estimate-row">
                <span>Platform retains</span>
                <span>{formatINR(platformFee)}</span>
              </div>

              <p className="rfq-estimate-note">
                Against supermarket-equivalent sourcing of {formatINR(retailEquivalent)}, this
                contract saves <strong>{formatINR(bulkSaving)} ({bulkSavingPercent}%)</strong> while
                paying farmers ₹{pricing.farmPrice}/kg — the benchmark Mandi rate for {cropLabel(cropKey)} is
                ₹{pricing.mandiPrice}/kg.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" id="submit-rfq-btn">
              📨 Broadcast RFQ to {FPOS.length} FPOs
            </button>

            {submitted && (
              <p className="rfq-sent" role="status">
                ✅ Sent to all {FPOS.length} collectives at {formatINR(contractValue)}. Responses
                typically arrive within 48 hours.
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}