import React, { useState } from 'react';
import './CheckoutModal.css';

export default function CheckoutModal({ isOpen, onClose, cartItems, totalAmount, onOrderSuccess }) {
  const [step, setStep] = useState('payment'); // 'payment' | 'receipt'
  const [selectedUpi, setSelectedUpi] = useState('gpay');
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  if (!isOpen) return null;

  const platformFee = Math.round(totalAmount * 0.08);
  const farmerPayout = totalAmount - platformFee;

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const data = {
        txId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        farmerPayout,
        platformFee,
        totalAmount,
        farmerName: cartItems[0]?.farmerName || 'Rajesh Patil',
        farmerUpi: 'rajesh.patil@sbi',
        itemsCount: cartItems.length,
      };
      setReceiptData(data);
      setStep('receipt');
      if (onOrderSuccess) onOrderSuccess(data);
    }, 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{step === 'payment' ? '💳 Direct Farmer Payout Checkout' : '✅ Payout Receipt & Order Confirmed!'}</h2>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>

        {step === 'payment' ? (
          <div className="modal-body flex flex-col gap-4">
            {/* Price Breakdown Box */}
            <div className="p-3 rounded" style={{ background: '#ecfdf5', border: '1px solid #6ee7b7' }}>
              <div className="text-xs font-bold text-success">💡 TRANSPARENT ZERO-MIDDLEMEN PAYOUT</div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span>👨‍🌾 Direct Payout to Farmer Bank Account:</span>
                <strong className="text-success text-base">₹{farmerPayout}</strong>
              </div>
              <div className="flex justify-between items-center text-xs text-secondary mt-1">
                <span>🚚 Platform Operational & Quality Fee (8%):</span>
                <span>+₹{platformFee}</span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between items-center text-base font-bold">
                <span>Total Amount Payable:</span>
                <span className="text-primary text-xl">₹{totalAmount}</span>
              </div>
            </div>

            {/* Simulated UPI Method Selection */}
            <div>
              <label className="form-label font-bold">Select Simulated Payment Method:</label>
              <div className="grid grid-3 gap-2 mt-2">
                <button
                  type="button"
                  className={`upi-option-btn p-2 rounded ${selectedUpi === 'gpay' ? 'active' : ''}`}
                  onClick={() => setSelectedUpi('gpay')}
                >
                  🟢 Google Pay
                </button>
                <button
                  type="button"
                  className={`upi-option-btn p-2 rounded ${selectedUpi === 'phonepe' ? 'active' : ''}`}
                  onClick={() => setSelectedUpi('phonepe')}
                >
                  🟣 PhonePe
                </button>
                <button
                  type="button"
                  className={`upi-option-btn p-2 rounded ${selectedUpi === 'paytm' ? 'active' : ''}`}
                  onClick={() => setSelectedUpi('paytm')}
                >
                  🔵 Paytm / UPI
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg w-full mt-2"
              onClick={handlePay}
              disabled={loading}
              id="pay-now-btn"
            >
              {loading ? '⏳ Processing Instant Bank Transfer...' : `⚡ Pay ₹${totalAmount} & Transfer ₹${farmerPayout} to Farmer`}
            </button>
          </div>
        ) : (
          <div className="modal-body text-center flex flex-col items-center gap-3">
            <div className="receipt-success-icon">🎉</div>
            <h3>Direct Farmer Bank Payout Initiated!</h3>
            <p className="text-sm text-secondary">Txn Ref: <strong>{receiptData?.txId}</strong> at {receiptData?.date}</p>

            {/* Direct Payout Certificate Card */}
            <div className="receipt-card p-4 rounded w-full text-left my-2" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <div className="flex justify-between text-xs text-secondary font-bold">
                <span>DIGITAL PAYOUT RECEIPT</span>
                <span className="badge badge-green">100% DIRECT</span>
              </div>

              <div className="flex justify-between text-sm mt-3">
                <span>Beneficiary Farmer:</span>
                <strong>{receiptData?.farmerName}</strong>
              </div>

              <div className="flex justify-between text-sm text-secondary mt-1">
                <span>Farmer UPI ID:</span>
                <code>{receiptData?.farmerUpi}</code>
              </div>

              <div className="flex justify-between text-sm font-bold text-success mt-2 pt-2 border-t">
                <span>Farmer Payout Amount:</span>
                <span>₹{receiptData?.farmerPayout}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={onClose}>
              🚚 Track Live Delivery Supply Chain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
