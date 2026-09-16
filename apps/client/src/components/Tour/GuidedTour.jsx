import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../UI/Toast';
import './GuidedTour.css';

const TOUR_STEPS = [
  {
    step: 1,
    title: '👋 Welcome to FarmDirect Hackathon Tour!',
    role: 'consumer',
    targetPath: '/',
    content: 'FarmDirect connects farmers directly to consumers & bulk buyers, eliminating middlemen and providing transparent pricing.',
    actionLabel: 'Next: Switch to Farmer Role →',
  },
  {
    step: 2,
    title: '🧑‍🌾 Step 1: Farmer Posting Produce',
    role: 'farmer',
    targetPath: '/farmer',
    content: 'We are now in the Farmer Portal. Farmers enter their crop, expected price, harvest date, and quantity. Platform auto-suggests pricing based on Mandi benchmark.',
    actionLabel: 'Try Posting Listing →',
  },
  {
    step: 3,
    title: '🛒 Step 2: Live Marketplace Integration',
    role: 'consumer',
    targetPath: '/marketplace',
    content: 'Switching to Consumer Role! Notice how any produce newly listed by a farmer instantly appears live on the Marketplace without a page refresh.',
    actionLabel: 'See Price Transparency →',
  },
  {
    step: 4,
    title: '💡 Step 3: Transparent Pricing Engine',
    role: 'consumer',
    targetPath: '/marketplace',
    content: 'Look at the product cards! Every item displays direct farmer payout, 8% platform fee breakdown, and savings vs supermarket retail rates.',
    actionLabel: 'Check Admin & Logistics →',
  },
  {
    step: 5,
    title: '📊 Step 4: AI Forecast & Route Logistics',
    role: 'admin',
    targetPath: '/analytics',
    content: 'Admins get real-time demand forecast, crop yield predictions, and cold-chain route optimization.',
    actionLabel: 'Finish Tour 🎉',
  },
];

export default function GuidedTour() {
  const [active, setActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { setCurrentRole } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleStartTour = () => {
    setActive(true);
    setCurrentStepIndex(0);
    applyStep(TOUR_STEPS[0]);
    addToast('🚀 Guided Demo Tour started for Judges!', 'info');
  };

  const applyStep = (stepObj) => {
    if (stepObj.role) {
      setCurrentRole(stepObj.role);
    }
    if (stepObj.targetPath) {
      navigate(stepObj.targetPath);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      applyStep(TOUR_STEPS[nextIdx]);
    } else {
      setActive(false);
      addToast('🎉 Demo Tour Completed! Feel free to explore freely.', 'success');
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      applyStep(TOUR_STEPS[prevIdx]);
    }
  };

  return (
    <>
      {/* Floating Demo Trigger Button */}
      {!active && (
        <button className="tour-trigger-btn pulse-glow" onClick={handleStartTour} id="start-tour-btn">
          <span>🚀</span> Guided Demo Tour
        </button>
      )}

      {/* Tour Overlay Modal */}
      {active && (
        <div className="tour-overlay">
          <div className="tour-card card slide-in-bottom">
            <div className="tour-header flex justify-between items-center">
              <span className="badge badge-green">Judge Demo Mode • Step {currentStep.step}/{TOUR_STEPS.length}</span>
              <button className="cart-close-btn" onClick={() => setActive(false)}>✕</button>
            </div>

            <div className="tour-body">
              <h3 className="tour-title">{currentStep.title}</h3>
              <p className="tour-desc text-secondary">{currentStep.content}</p>

              <div className="tour-role-badge mt-2">
                Active Role Auto-Set: <strong className="badge badge-amber">{currentStep.role.toUpperCase()}</strong>
              </div>
            </div>

            <div className="tour-footer flex justify-between items-center mt-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
              >
                ← Back
              </button>

              <div className="tour-dots">
                {TOUR_STEPS.map((_, i) => (
                  <span key={i} className={`tour-dot ${i === currentStepIndex ? 'active' : ''}`}></span>
                ))}
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleNext}>
                {currentStep.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
