import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys cho AsyncStorage
const CACHE_KEYS = {
  CART: '@ecommerce_cart',
  PRODUCTS: '@ecommerce_products',
  WISHLIST: '@ecommerce_wishlist',
};

/**
 * Cache Service - Quản lý lưu trữ local
 */
export const cacheService = {
  // ============================================
  // CART CACHE
  // ============================================
  saveCart: async (cartItems) => {
    try {
      const jsonValue = JSON.stringify(cartItems);
      await AsyncStorage.setItem(CACHE_KEYS.CART, jsonValue);
      console.log('✅ Cart saved to cache');
    } catch (error) {
      console.error('❌ Error saving cart:', error);
    }
  },

  loadCart: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(CACHE_KEYS.CART);
      if (jsonValue) {
        const cartItems = JSON.parse(jsonValue);
        console.log('✅ Cart loaded from cache:', cartItems.length, 'items');
        return cartItems;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      return [];
    }
  },

  clearCart: async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.CART);
      console.log('✅ Cart cache cleared');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
    }
  },

  // ============================================
  // PRODUCTS CACHE
  // ============================================
  saveProducts: async (products) => {
    try {
      const jsonValue = JSON.stringify(products);
      await AsyncStorage.setItem(CACHE_KEYS.PRODUCTS, jsonValue);
      console.log('✅ Products saved to cache:', products.length, 'items');
    } catch (error) {
      console.error('❌ Error saving products:', error);
    }
  },

  loadProducts: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(CACHE_KEYS.PRODUCTS);
      if (jsonValue) {
        const products = JSON.parse(jsonValue);
        console.log('✅ Products loaded from cache:', products.length, 'items');
        return products;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading products:', error);
      return null;
    }
  },

  // ============================================
  // WISHLIST CACHE (dùng ở bước sau)
  // ============================================
  saveWishlist: async (wishlist) => {
    try {
      const jsonValue = JSON.stringify(wishlist);
      await AsyncStorage.setItem(CACHE_KEYS.WISHLIST, jsonValue);
    } catch (error) {
      console.error('❌ Error saving wishlist:', error);
    }
  },

  loadWishlist: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(CACHE_KEYS.WISHLIST);
      if (jsonValue) {
        return JSON.parse(jsonValue);
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading wishlist:', error);
      return [];
    }
  },

  // ============================================
  // CLEAR ALL CACHE
  // ============================================
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.CART,
        CACHE_KEYS.PRODUCTS,
        CACHE_KEYS.WISHLIST,
      ]);
      console.log('✅ All cache cleared');
    } catch (error) {
      console.error('❌ Error clearing all cache:', error);
    }
  },
};