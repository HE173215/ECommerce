import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import { cacheService } from '../services/cacheService';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ============================================
  // LOAD WISHLIST TỪ CACHE KHI APP KHỞI ĐỘNG
  // ============================================
  useEffect(() => {
    const loadWishlistFromCache = async () => {
      const cachedWishlist = await cacheService.loadWishlist();
      if (cachedWishlist && cachedWishlist.length > 0) {
        setWishlistItems(cachedWishlist);
        console.log('🔄 Wishlist restored from cache');
      }
      setIsLoaded(true);
    };

    loadWishlistFromCache();
  }, []);

  // ============================================
  // TỰ ĐỘNG LƯU WISHLIST MỖI KHI THAY ĐỔI
  // ============================================
  useEffect(() => {
    if (isLoaded) {
      cacheService.saveWishlist(wishlistItems);
    }
  }, [wishlistItems, isLoaded]);

  // ============================================
  // HÀM 1: Toggle (thêm nếu chưa có, xóa nếu đã có)
  // ============================================
  const toggleWishlist = useCallback((product) => {
    setWishlistItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === product.id);

      if (exists) {
        // Đã có → xóa
        return prevItems.filter((item) => item.id !== product.id);
      } else {
        // Chưa có → thêm
        return [...prevItems, product];
      }
    });
  }, []);

  // ============================================
  // HÀM 2: Thêm vào wishlist
  // ============================================
  const addToWishlist = useCallback((product) => {
    setWishlistItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === product.id);
      if (exists) return prevItems; // Đã có thì không thêm nữa
      return [...prevItems, product];
    });
  }, []);

  // ============================================
  // HÀM 3: Xóa khỏi wishlist
  // ============================================
  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }, []);

  // ============================================
  // HÀM 4: Kiểm tra sản phẩm có trong wishlist không
  // ============================================
  const isInWishlist = useCallback(
    (productId) => {
      return wishlistItems.some((item) => item.id === productId);
    },
    [wishlistItems]
  );

  // ============================================
  // HÀM 5: Xóa toàn bộ wishlist
  // ============================================
  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  // ============================================
  // TÍNH TOÁN
  // ============================================
  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  const value = {
    wishlistItems,
    wishlistCount,
    isLoaded,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};