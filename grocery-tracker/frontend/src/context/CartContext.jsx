import React, { createContext, useState } from 'react';
import { toast } from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      toast.error('Out of stock!');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.cartQuantity >= product.stockQuantity) {
          toast.error('Cannot add more than available stock!');
          return prev;
        }
        return prev.map(item => 
          item._id === product._id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, delta, maxStock) => {
    setCart(prev => prev.map(item => {
      if (item._id === productId) {
        const newQty = item.cartQuantity + delta;
        if (newQty > maxStock && delta > 0) {
          toast.error('Stock limit reached');
          return item;
        }
        if (newQty < 1) return item;
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '' });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const sub = item.price * item.cartQuantity;
      const gst = (sub * item.gstRate) / 100;
      return total + sub + gst;
    }, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      customerInfo, 
      setCustomerInfo,
      getCartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};
