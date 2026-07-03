import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Custom hook để sử dụng Cart Context
 * 
 * Cách dùng:
 * const { cartItems, addToCart, totalPrice } = useCart();
 * 
 * @returns {Object} - Chứa cartItems, totalPrice, itemCount và các hàm quản lý
 */
export const useCart = () => {
  const context = useContext(CartContext);

  // Kiểm tra xem hook có được dùng trong CartProvider không
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};