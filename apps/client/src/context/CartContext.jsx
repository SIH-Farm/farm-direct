import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { calculatePricing } from '../utils/pricingEngine';

const CartContext = createContext();

const initialState = {
  items: [],
  isOpen: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.productId === action.payload.productId);
      if (existing) {
        // Never allow the basket to exceed the stock the farmer actually listed.
        const max = existing.maxQuantity > 0 ? existing.maxQuantity : Infinity;
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, max) }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.productId !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item => {
          if (item.productId !== action.payload.productId) return item;
          const max = item.maxQuantity > 0 ? item.maxQuantity : Infinity;
          return { ...item, quantity: Math.max(1, Math.min(action.payload.quantity, max)) };
        }),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Single source of truth for money: prices ALWAYS come from the pricing engine,
  // never from a price field that happens to sit on the product object.
  const addToCart = useCallback((product, quantity = 1) => {
    const { platformPrice } = calculatePricing(product.farmPrice, product.cropName);
    const availableStock = Number(product.quantity) || 0;
    const requested = Math.max(1, Number(quantity) || 1);

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.id,
        product,
        quantity: availableStock > 0 ? Math.min(requested, availableStock) : requested,
        maxQuantity: availableStock,
        pricePerUnit: platformPrice,
      },
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    }
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: 'CLOSE_CART' });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = state.items.reduce(
    (sum, item) => sum + item.quantity * item.pricePerUnit,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalItems,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
