import React, { useState } from 'react';
import { apiPost } from '../../utils/api';
import { useApp } from '../../context/AppContext';
import './CheckoutModal.css';

const round2 = (n) => Math.round(n * 100) / 100;

/** Deterministic payout handle, e.g. "Rajesh Patil" -> rajesh.patil@farmdirect */
const payoutHandleFor = (name = '') => {
  const slug = name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.+|\.+$/g, '');
  return `${slug || 'farmer'}@farmdirect`;
};

export default function CheckoutModal({
  isOpen,
  onClose,
  onTrack,
  cartItems = [],
  totalAmount = 0,
  onOrderSuccess,
}) {
  const [step, setStep] = useState('payment'); // 'payment' | 'receipt'
  const [selectedUpi, setSelectedUpi] = useState('gpay');
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [error, setError] = useState('');
  const { t } = useApp();

  if (!isOpen) return null;

  // The split is derived from each farmer's own asking price — NOT from
  // totalAmount × 0.08 (the total already includes the fee). This is exactly what
  // the server does in buildOrder(), so cart, receipt and order always agree.
  const farmerPayout = round2(
    cartItems.reduce((sum, item) => sum + (Number(item.farmPrice) || 0) * item.quantity, 0)
  );
  const platformFee = round2(totalAmount - farmerPayout);
  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      // The order is really created server-side; stock is reserved and the payout
      // figures below come back from the API rather than being faked in the browser.
      const order = await apiPost('/orders', {
        buyerName: 'FarmDirect Consumer',
        items: cartItems.map(item => ({
          productId: item.id || item.productId,
          quantity: item.quantity,
        })),
      });

      setReceiptData({
        ...order,
        txId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unitsCount: order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? totalUnits,
      });
      setStep('receipt');
      if (onOrderSuccess) onOrderSuccess(order);
    } catch (err) {
      setError(err.message || 'Payment could not be processed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = () => {
    if (onTrack) onTrack(receiptData);
    else onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{step === 'payment' ? t('ui.checkout.title') : t('ui.checkout.receiptTitle')}</h2>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>

        {step === 'payment' ? (
          <div className="modal-body flex flex-col gap-4">
            {/* Price Breakdown Box */}
            <div className="p-3 rounded" style={{ background: '#ecfdf5', border: '1px solid #6ee7b7' }}>
              <div className="text-xs font-bold text-success">💡 TRANSPARENT ZERO-MIDDLEMEN PAYOUT</div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span>{t('ui.checkout.payoutLabel')}:</span>
                <strong className="text-success text-base">₹{farmerPayout}</strong>
              </div>
              <div className="flex justify-between items-center text-xs text-secondary mt-1">
                <span>{t('ui.checkout.feeLabel')}:</span>
                <span>+₹{platformFee}</span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between items-center text-base font-bold">
                <span>{t('ui.checkout.totalLabel')} ({totalUnits} kg):</span>
                <span className="text-primary text-xl">₹{totalAmount}</span>
              </div>
            </div>

            {/* Simulated UPI Method Selection */}
            <div>
              <label className="form-label font-bold">{t('ui.checkout.selectUpi')}:</label>
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

            {error && (
              <div
                className="p-3 rounded text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }}
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              className="btn btn-primary btn-lg w-full mt-2"
              onClick={handlePay}
              disabled={loading || cartItems.length === 0}
              id="pay-now-btn"
            >
              {loading ? t('ui.checkout.processing') : `⚡ ${t('ui.checkout.payNow')} ₹${totalAmount} → ₹${farmerPayout}`}
            </button>
          </div>
        ) : (
          <div className="modal-body text-center flex flex-col items-center gap-3">
            <div className="receipt-success-icon">🎉</div>
            <h3>Order Confirmed &amp; Farmer Payout Initiated!</h3>
            <p className="text-sm text-secondary">
              Order <strong>#{receiptData?.id}</strong> • Txn Ref: <strong>{receiptData?.txId}</strong> at {receiptData?.date}
            </p>

            {/* Direct Payout Certificate Card */}
            <div className="receipt-card p-4 rounded w-full text-left my-2" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <div className="flex justify-between text-xs text-secondary font-bold">
                <span>DIGITAL PAYOUT RECEIPT</span>
                <span className="badge badge-green">100% DIRECT</span>
              </div>

{(receiptData?.items || []).map(item => (
                <div key={item.productId} className="mt-3 pt-2" style={{ borderTop: '1px solid #e2e8f0' }}>
                  <div className="flex justify-between text-sm">
                    <span>
                      {item.cropName} <span className="text-secondary">({item.quantity}{item.unit})</span>
                    </span>
                    <strong>₹{item.lineTotal}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-secondary mt-1">
                    <span>Beneficiary Farmer:</span>
                    <span>{item.farmerName}</span>
                  </div>
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Farmer UPI ID:</span>
                    <code>{payoutHandleFor(item.farmerName)}</code>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-success">
                    <span>Direct Payout (₹{item.farmPrice}/kg):</span>
                    <span>₹{round2(item.farmPrice * item.quantity)}</span>
                  </div>
                </div>
              ))}

              <div className="flex justify-between text-sm font-bold mt-3 pt-3" style={{ borderTop: '2px solid #cbd5e1' }}>
                <span>Total Consumer Paid ({receiptData?.unitsCount ?? totalUnits} kg):</span>
                <span>₹{receiptData?.totalAmount ?? totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-success">
                <span>Total Direct Payout to Farmers:</span>
                <span>₹{receiptData?.farmerPayout ?? farmerPayout}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary">
                <span>Platform Fee:</span>
                <span>+₹{receiptData?.platformFee ?? platformFee}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={handleTrackClick}>
              {t('ui.checkout.track')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
