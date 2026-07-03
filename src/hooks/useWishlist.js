import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

/**
 * Custom hook để sử dụng Wishlist Context
 * 
 * Cách dùng:
 * const { wishlistItems, toggleWishlist, isInWishlist } = useWishlist();
 * 
 * @returns {Object} - Chứa wishlistItems, wishlistCount và các hàm quản lý
 */
export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  return context;
};