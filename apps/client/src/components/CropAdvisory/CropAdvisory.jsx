import React from 'react';
import './CropAdvisory.css';

const AI_RECOMMENDATIONS = [
  {
    cropName: 'Turmeric (हल्दी)',
    variety: 'Salem High-Curcumin',
    predictedDemand: '+48% Shortage',
    recommendedPrice: 160,
    mandiPrice: 110,
    marginBonus: '+45% Margin',
    bestPlantingMonth: 'October 2026',
    reasoning: 'High export demand from Europe & shortage in Telangana Mandis projected.',
  },
  {
    cropName: 'Cherry Tomato (चेरी टमाटर)',
    variety: 'Hybrid Red Cluster',
    predictedDemand: '+32% High Demand',
    recommendedPrice: 38,
    mandiPrice: 24,
    marginBonus: '+38% Margin',
    bestPlantingMonth: 'Immediate',
    reasoning: 'Supermarket contracts seeking organic certified Grade A greenhouse batches.',
  },
  {
    cropName: 'Arabica Coffee (कॉफी)',
    variety: 'Coorg Single-Origin',
    predictedDemand: '+25% Export Surge',
    recommendedPrice: 420,
    mandiPrice: 330,
    marginBonus: '+28% Margin',
    bestPlantingMonth: 'November 2026',
    reasoning: 'Global coffee futures up 18%; direct export buyers bidding on FarmDirect.',
  },
];

export default function CropAdvisory({ onSelectCrop }) {
  return (
    <div className="crop-advisory-container card card-body my-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="badge badge-green">🤖 AI Crop Demand Advisory Engine</span>
          <h3 className="mt-1">What Should I Grow Next? (Optimal Margin Predictor)</h3>
          <p className="text-xs text-secondary">Analyzing Agmarknet Mandi historical data & bulk buyer forward contracts</p>
        </div>
      </div>

      <div className="grid grid-3 gap-4">
        {AI_RECOMMENDATIONS.map((rec, idx) => (
          <div key={idx} className="advisory-card card p-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="badge badge-amber">{rec.predictedDemand}</span>
                <span className="badge badge-green">{rec.marginBonus}</span>
              </div>

              <h4 className="mt-2 text-md font-bold">{rec.cropName}</h4>
              <div className="text-xs text-secondary">{rec.variety}</div>

              <div className="my-2 p-2 rounded text-xs" style={{ background: 'var(--bg-input)' }}>
                <div className="flex justify-between">
                  <span>FarmDirect Target Payout:</span>
                  <strong className="text-success">₹{rec.recommendedPrice}/kg</strong>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Traditional Mandi Rate:</span>
                  <span className="strike">₹{rec.mandiPrice}/kg</span>
                </div>
              </div>

              <p className="text-xs text-secondary mb-2">💡 <em>{rec.reasoning}</em></p>
            </div>

            <button
              className="btn btn-primary btn-sm w-full mt-2"
              onClick={() => onSelectCrop && onSelectCrop(rec)}
            >
              🌱 Apply AI Suggested Listing
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
