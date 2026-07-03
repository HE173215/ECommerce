import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import { cacheService } from '../services/cacheService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); // Đã load cache chưa

  // ============================================
  // LOAD CART TỪ CACHE KHI APP KHỞI ĐỘNG
  // ============================================
  useEffect(() => {
    const loadCartFromCache = async () => {
      const cachedCart = await cacheService.loadCart();
      if (cachedCart && cachedCart.length > 0) {
        setCartItems(cachedCart);
        console.log('🔄 Cart restored from cache');
      }
      setIsLoaded(true);
    };

    loadCartFromCache();
  }, []);

  // ============================================
  // TỰ ĐỘNG LƯU CART MỖI KHI THAY ĐỔI
  // ============================================
  useEffect(() => {
    if (isLoaded) {
      cacheService.saveCart(cartItems);
    }
  }, [cartItems, isLoaded]);

  // ============================================
  // CÁC HÀM QUẢN LÝ CART (giữ nguyên)
  // ============================================
  const addToCart = useCallback((product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId, type) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === productId) {
            if (type === 'increase') {
              return { ...item, quantity: item.quantity + 1 };
            } else if (type === 'decrease') {
              return { ...item, quantity: item.quantity - 1 };
            }
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    cacheService.clearCart();
  }, []);

  // ============================================
  // TÍNH TOÁN
  // ============================================
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    totalPrice,
    itemCount,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};