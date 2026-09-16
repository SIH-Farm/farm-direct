import React from 'react';
import { calculatePricing } from '../../utils/pricingEngine';
import './PriceBreakdown.css';

export default function PriceBreakdown({ farmPrice, cropName, compact = false }) {
  const pricing = calculatePricing(farmPrice, cropName);

  if (compact) {
    return (
      <div className="price-breakdown-compact">
        <div className="price-main-pill">
          <span className="price-value">₹{pricing.platformPrice}</span>
          <span className="price-unit">/kg</span>
        </div>
        <div className="price-comparison-tag text-xs">
          <span className="strike">₹{pricing.retailPrice} Retail</span>
          <span className="saving-badge">Save {pricing.consumerSavingPercent}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="price-breakdown-card card">
      <div className="price-breakdown-header flex justify-between items-center">
        <h4>💡 Transparent Pricing Model</h4>
        <span className="badge badge-green">Zero Middlemen</span>
      </div>

      <div className="price-breakdown-bars">
        <div className="price-row flex justify-between items-center text-sm">
          <span>🧑‍🌾 Farmer Payout (Direct):</span>
          <strong className="text-success">₹{pricing.farmPrice}/kg</strong>
        </div>
        <div className="price-row flex justify-between items-center text-sm text-secondary">
          <span>🚚 Platform & Quality Fee (8%):</span>
          <span>+₹{pricing.platformFee}/kg</span>
        </div>
        <div className="price-divider"></div>
        <div className="price-row flex justify-between items-center text-md">
          <span><strong>🛒 FarmDirect Price:</strong></span>
          <strong className="text-primary text-lg">₹{pricing.platformPrice}/kg</strong>
        </div>

        <div className="price-row-comparison grid grid-2 gap-2 mt-3 text-xs">
          <div className="comp-box mandi-box">
            <span className="comp-title">🏛️ Mandi Rate</span>
            <span className="comp-value">₹{pricing.mandiPrice}/kg</span>
            <span className="comp-note">Net payout to farmer: ₹{pricing.mandiNetFarmerPayout}</span>
          </div>
          <div className="comp-box retail-box">
            <span className="comp-title">🏬 Supermarket</span>
            <span className="comp-value strike">₹{pricing.retailPrice}/kg</span>
            <span className="comp-note text-success">You save ₹{pricing.consumerSaving}/kg</span>
          </div>
        </div>

        <div className="farmer-bonus-banner mt-3">
          ✨ <strong>Farmer Payout Bonus:</strong> Earns <strong className="text-success">+₹{pricing.farmerBonusVsMandi}/kg ({pricing.farmerBonusPercent}%)</strong> more than traditional Mandi commission agents!
        </div>
      </div>
    </div>
  );
}
