import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateSavings } from '../../data/mockData';
import CheckoutModal from '../CheckoutModal/CheckoutModal';
import './CartDrawer.css';

export default function CartDrawer({ onOpenTracker }) {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { t } = useApp();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    setShowCheckoutModal(true);
  };

  const handleOrderSuccess = () => {
    clearCart();
    setShowCheckoutModal(false);
    closeCart();
    if (onOpenTracker) onOpenTracker();
  };

  const totalSavings = items.reduce((sum, item) => {
    const savings = (item.product.retailPrice - item.product.platformPrice) * item.quantity;
    return sum + (savings > 0 ? savings : 0);
  }, 0);

  return (
    <>
      <div className="cart-backdrop" onClick={closeCart}>
        <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header">
            <h2>🛒 Your Farm Basket ({items.reduce((s, i) => s + i.quantity, 0)})</h2>
            <button className="cart-close-btn" onClick={closeCart}>✕</button>
          </div>

          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🌾</span>
              <h3>Your basket is empty</h3>
              <p>Direct farm fresh produce is just a click away!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item) => {
                  const p = item.product;
                  const savings = calculateSavings(p.platformPrice || (p.farmPrice * 1.08), p.retailPrice || (p.farmPrice * 2));
                  return (
                    <div key={item.productId} className="cart-item">
                      <div className="cart-item-details">
                        <h4>{p.cropName} <span className="cart-item-grade">Grade {p.grade || 'A'}</span></h4>
                        <p className="cart-item-farmer">Farmer: {p.farmerName || p.farmerId}</p>
                        <div className="cart-item-price-row">
                          <span className="cart-item-price">₹{p.platformPrice || p.price}/kg</span>
                          <span className="cart-item-retail">Retail: ₹{p.retailPrice || (p.farmPrice * 2)}/kg</span>
                        </div>
                      </div>

                      <div className="cart-item-controls">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                        <span>{item.quantity} kg</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                        <button className="cart-remove-btn" onClick={() => removeFromCart(item.productId)}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                {/* Hyperlocal Batch Logistics Note */}
                <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', border: '1px solid #7dd3fc', marginBottom: '12px', fontSize: '0.75rem', color: '#0369a1' }}>
                  <strong>🚚 Neighborhood Micro-Hub Logistics:</strong> Small retail orders (1-4 kg) are aggregated at your gated society/locality drop-point for zero-cost morning delivery!
                </div>

                {totalSavings > 0 && (
                  <div className="cart-total-savings">
                    🎉 Total Consumer Savings: <strong>{formatCurrency(totalSavings)}</strong>
                  </div>
                )}
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Direct Delivery & Quality Cert</span>
                  <span className="text-success">FREE</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Total Amount</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>

                <button className="btn btn-primary btn-lg w-full" onClick={handleCheckoutClick} id="checkout-btn">
                  Proceed to Checkout ({formatCurrency(totalAmount)})
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showCheckoutModal && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          cartItems={items.map(i => i.product)}
          totalAmount={totalAmount}
          onOrderSuccess={handleOrderSuccess}
        />
      )}
    </>
  );
}
