import React from 'react';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateSavings } from '../../data/mockData';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { t } = useApp();

  if (!isOpen) return null;

  const handleCheckout = () => {
    alert('🎉 Order placed successfully! Live tracking is enabled on your logistics dashboard.');
    clearCart();
    closeCart();
  };

  const totalSavings = items.reduce((sum, item) => {
    const savings = (item.product.retailPrice - item.product.platformPrice) * item.quantity;
    return sum + (savings > 0 ? savings : 0);
  }, 0);

  return (
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
                const savings = calculateSavings(p.platformPrice, p.retailPrice);
                return (
                  <div key={item.productId} className="cart-item">
                    <div className="cart-item-details">
                      <h4>{p.cropName} <span className="cart-item-grade">Grade {p.grade}</span></h4>
                      <p className="cart-item-farmer">Farmer: {p.farmerId}</p>
                      <div className="cart-item-price-row">
                        <span className="cart-item-price">₹{p.platformPrice}/kg</span>
                        <span className="cart-item-retail">Retail: ₹{p.retailPrice}/kg</span>
                      </div>
                      <span className="cart-item-savings-tag">Save ₹{savings.saving * item.quantity}</span>
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

              <button className="btn btn-primary btn-lg w-full" onClick={handleCheckout} id="checkout-btn">
                Proceed to Checkout ({formatCurrency(totalAmount)})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
