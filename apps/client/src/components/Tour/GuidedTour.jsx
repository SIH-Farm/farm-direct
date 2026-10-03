import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../UI/Toast';
import { calculatePricing, MANDI_BENCHMARKS } from '../../utils/pricingEngine';
import './GuidedTour.css';

const CROP_CHOICES = Object.entries(MANDI_BENCHMARKS).map(([key, bench]) => ({
  key,
  label: bench.crop,
}));

/**
 * The tour is deliberately four stops long so it can be run end to end inside a
 * judging slot. Stop 2 carries the interactive pricing lab, which is the one thing
 * a judge has to touch to understand the product.
 */
const TOUR_STEPS = [
  {
    badge: 'The Problem',
    title: '🌾 Four middlemen sit between the farmer and your plate.',
    body:
      'A tomato grower is paid the Mandi rate minus agent commission — in practice about 60% of it. The buyer still pays supermarket retail. Every rupee in between is absorbed before the produce moves.',
    role: 'consumer',
    targetPath: '/',
    action: 'Open the pricing model →',
  },
  {
    badge: '★ The Core Model',
    title: '💡 One price in, five outcomes out — recomputed live.',
    body:
      'This is the transparent pricing engine. The same function prices every marketplace card, every cart line and every order receipt. Drag it and watch all five stakeholders move in the same instant.',
    role: 'consumer',
    targetPath: '/',
    lab: true,
    action: 'See it on real listings →',
  },
  {
    badge: 'Real-Time Reach',
    title: '📡 One farmer re-prices — the whole market reacts.',
    body:
      'Listings are re-polled every 6 seconds and the live activity feed every 10, so a farmer posting or re-pricing produce surfaces here without a refresh. The cart and the order payout are recomputed from that same engine.',
    role: 'consumer',
    targetPath: '/marketplace',
    action: 'Follow the money to the farmer →',
  },
  {
    badge: 'Verified Payout',
    title: '🧑‍🌾 The farmer is shown the number the buyer was charged.',
    body:
      'There is no hidden spread to reconcile, because the payout on this screen is derived from the identical engine that rendered the buyer\'s price. That is what makes the margin promise auditable rather than a claim on a slide.',
    role: 'farmer',
    targetPath: '/farmer',
    action: 'Finish tour 🎉',
  },
];

/** Interactive lab: drag one farm price, watch every downstream number recompute. */
function PricingLab() {
  const [cropKey, setCropKey] = useState('tomato');
  const [farmPrice, setFarmPrice] = useState(Math.round(MANDI_BENCHMARKS.tomato.mandiPrice));

  const pricing = calculatePricing(farmPrice, cropKey);

  // Each crop gets its own slider range, so pepper and cumin stay usable.
  const floor = Math.max(1, Math.round(pricing.mandiPrice * 0.4));
  const ceiling = Math.max(floor + 1, Math.round(pricing.mandiPrice * 1.8));

  const handleCropChange = (key) => {
    setCropKey(key);
    // Whole rupees only, so the thumb lands exactly on the price shown beside it.
    setFarmPrice(Math.round(MANDI_BENCHMARKS[key].mandiPrice));
  };

  const cells = [
    { icon: '🌾', label: 'Farmer keeps', value: `₹${pricing.farmPrice}`, tone: 'green' },
    { icon: '🏦', label: 'Platform fee (8%)', value: `₹${pricing.platformFee}`, tone: 'neutral' },
    { icon: '🛒', label: 'Buyer pays', value: `₹${pricing.platformPrice}`, tone: 'blue' },
    { icon: '💚', label: 'Buyer saves vs supermarket', value: `₹${pricing.consumerSaving}`, sub: `${pricing.consumerSavingPercent}% off ₹${pricing.retailPrice}`, tone: 'green' },
    { icon: '✨', label: 'Farmer beats Mandi agent', value: `+₹${pricing.farmerBonusVsMandi}`, sub: `${pricing.farmerBonusPercent}% over ₹${pricing.mandiNetFarmerPayout} net`, tone: 'green' },
  ];

  return (
    <div className="tour-lab">
      <div className="tour-lab-controls">
        <select
          className="tour-lab-crop"
          value={cropKey}
          onChange={(e) => handleCropChange(e.target.value)}
          aria-label="Select crop"
          id="tour-lab-crop"
        >
          {CROP_CHOICES.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <span className="tour-lab-readout">₹{pricing.farmPrice}/kg</span>
      </div>

      <input
        type="range"
        className="tour-lab-slider"
        min={floor}
        max={ceiling}
        step={1}
        value={farmPrice}
        onChange={(e) => setFarmPrice(Number(e.target.value))}
        aria-label="Farmer set price per kg"
        id="tour-lab-slider"
      />

      <div className="tour-lab-grid">
        {cells.map(cell => (
          <div className={`tour-lab-cell ${cell.tone}`} key={cell.label}>
            <span className="tour-lab-cell-label">{cell.icon} {cell.label}</span>
            <strong className="tour-lab-cell-value">{cell.value}</strong>
            {cell.sub && <span className="tour-lab-cell-sub">{cell.sub}</span>}
          </div>
        ))}
      </div>

      <p className="tour-lab-note">
        Reference — Mandi <strong>₹{pricing.mandiPrice}/kg</strong>, which nets the farmer
        <strong> ₹{pricing.mandiNetFarmerPayout}/kg</strong> after commission. Supermarket
        <strong> ₹{pricing.retailPrice}/kg</strong>.
      </p>
    </div>
  );
}

export default function GuidedTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const { setCurrentRole } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const step = TOUR_STEPS[stepIndex];
  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  // Navigate and switch role together: a protected route needs the role applied
  // before it renders, otherwise the judge lands on the wrong screen.
  const goToStep = (index) => {
    const next = TOUR_STEPS[index];
    if (next.role) setCurrentRole(next.role);
    if (next.targetPath) navigate(next.targetPath);
    setStepIndex(index);
  };

  const handleStart = () => {
    setActive(true);
    goToStep(0);
    addToast('🚀 Judge tour started — 4 stops, about 90 seconds.', 'info');
  };

  const handleNext = () => {
    if (!isLastStep) {
      goToStep(stepIndex + 1);
    } else {
      setActive(false);
      addToast('🎉 Tour complete — explore freely.', 'success');
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  };

  return (
    <>
      {!active && (
        <button className="tour-trigger-btn pulse-glow" onClick={handleStart} id="start-tour-btn">
          <span>🚀</span> Run Judge Demo Tour
        </button>
      )}

      {active && (
        <div className="tour-overlay">
          <div className="tour-card card slide-in-bottom">
            <div className="tour-progress" aria-hidden="true">
              <div
                className="tour-progress-bar"
                style={{ width: `${((stepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>

            <div className="tour-header flex justify-between items-center">
              <span className="badge badge-green">
                {step.badge} · {stepIndex + 1}/{TOUR_STEPS.length}
              </span>
              <button
                className="cart-close-btn"
                onClick={() => setActive(false)}
                aria-label="Exit tour"
              >
                ✕
              </button>
            </div>

            <div className="tour-body">
              <h3 className="tour-title">{step.title}</h3>
              <p className="tour-desc text-secondary">{step.body}</p>

              {step.lab && <PricingLab />}

              <div className="tour-role-line">
                Role auto-set to <strong>{step.role}</strong> · route <code>{step.targetPath}</code>
              </div>
            </div>

            <div className="tour-footer flex justify-between items-center mt-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePrev}
                disabled={stepIndex === 0}
              >
                ← Back
              </button>

              <div className="tour-dots">
                {TOUR_STEPS.map((s, i) => (
                  <span key={s.badge} className={`tour-dot ${i === stepIndex ? 'active' : ''}`} />
                ))}
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleNext} id="tour-next-btn">
                {isLastStep ? 'Finish tour 🎉' : step.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}