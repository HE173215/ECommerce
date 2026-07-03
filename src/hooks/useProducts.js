import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { cacheService } from '../services/cacheService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all'); // ← MỚI

  const LIMIT = 10;
  
  // Ref để tránh gọi API nhiều lần
  const isFetchingRef = useRef(false);

  // ============================================
  // HÀM 1: FETCH PRODUCTS (có cache)
  // ============================================
  const fetchProducts = useCallback(async (pageNum = 0, append = false) => {
    // ✅ FIX: Dùng ref để tránh gọi nhiều lần
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Load cache cho trang đầu
    if (pageNum === 0 && !append && products.length === 0) {
      const cachedProducts = await cacheService.loadProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        setProducts(cachedProducts);
        setIsFromCache(true);
      }
    }

    setLoading(true);
    setError(null);

    try {
      const skip = pageNum * LIMIT;
      const response = await api.get('/products', {
        params: { limit: LIMIT, skip },
      });

      const newProducts = response.data.products || [];
      const total = response.data.total || 0;
      const moreAvailable = skip + LIMIT < total;

      if (append) {
        setProducts((prev) => {
          const updated = [...prev, ...newProducts];
          cacheService.saveProducts(updated);
          return updated;
        });
      } else {
        setProducts(newProducts);
        cacheService.saveProducts(newProducts);
      }

      setHasMore(moreAvailable);
      setPage(pageNum);
      setIsFromCache(false);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetchingRef.current = false; // ✅ Reset ref
    }
  }, []); // ✅ FIX: Dependency rỗng, không phụ thuộc vào state

  // ============================================
  // HÀM 2: FETCH BY CATEGORY (← MỚI)
  // ============================================
  const fetchByCategory = useCallback(async (category, pageNum = 0, append = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const skip = pageNum * LIMIT;
      const response = await api.get(`/products/category/${category}`, {
        params: { limit: LIMIT, skip },
      });

      const newProducts = response.data.products || [];
      const total = response.data.total || 0;
      const moreAvailable = skip + LIMIT < total;

      if (append) {
        setProducts((prev) => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      setHasMore(moreAvailable);
      setPage(pageNum);
      setCurrentCategory(category);
      setIsFromCache(false);
    } catch (err) {
      console.error('❌ Error fetching category:', err);
      setError(err.message || 'Failed to load category');
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // ============================================
  // HÀM 3: SEARCH
  // ============================================
  const searchProducts = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setIsSearching(false);
      setSearchQuery('');
      setProducts([]);
      setPage(0);
      setHasMore(true);
      setCurrentCategory('all');
      await fetchProducts(0, false);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setIsSearching(true);
    setSearchQuery(query);
    setLoading(true);
    setError(null);
    setProducts([]);
    setCurrentCategory('all');

    try {
      const response = await api.get('/products/search', {
        params: { q: query, limit: 100 },
      });

      const results = response.data.products || [];
      setProducts(results);
      setHasMore(false);
    } catch (err) {
      console.error('❌ Error searching:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchProducts]);

  // ============================================
  // HÀM 4: LOAD MORE (← FIX)
  // ============================================
  const loadMore = useCallback(() => {
    // ✅ FIX: Kiểm tra kỹ trước khi load
    if (isFetchingRef.current || loading || !hasMore) return;

    const nextPage = page + 1;

    if (isSearching) {
      // Search không phân trang
      return;
    } else if (currentCategory !== 'all') {
      // Đang filter category → fetch tiếp category đó
      fetchByCategory(currentCategory, nextPage, true);
    } else {
      // Fetch products bình thường
      fetchProducts(nextPage, true);
    }
  }, [loading, hasMore, isSearching, page, currentCategory, fetchProducts, fetchByCategory]);

  // ============================================
  // HÀM 5: RESET
  // ============================================
  const reset = useCallback(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    setSearchQuery('');
    setIsSearching(false);
    setIsFromCache(false);
    setCurrentCategory('all');
    isFetchingRef.current = false;
  }, []);

  // ============================================
  // AUTO FETCH KHI MOUNT
  // ============================================
  useEffect(() => {
    fetchProducts(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần

  return {
    products,
    loading,
    error,
    hasMore,
    searchQuery,
    isSearching,
    isFromCache,
    currentCategory,
    fetchProducts,
    fetchByCategory,
    searchProducts,
    loadMore,
    reset,
  };
};