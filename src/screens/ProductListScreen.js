import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

// Danh sách categories từ DummyJSON
const CATEGORIES = [
  { id: "all", name: "All", icon: "apps" },
  { id: "smartphones", name: "Phones", icon: "phone-portrait" },
  { id: "laptops", name: "Laptops", icon: "laptop" },
  { id: "fragrances", name: "Fragrances", icon: "flower" },
  { id: "skincare", name: "Skincare", icon: "hand-left" },
  { id: "groceries", name: "Groceries", icon: "basket" },
  { id: "home-decoration", name: "Home", icon: "home" },
];

export default function ProductListScreen({ navigation }) {
  const {
    products,
    loading,
    error,
    hasMore,
    searchQuery,
    isSearching,
    isFromCache,
    searchProducts,
    loadMore,
    reset,
    fetchProducts,
    fetchByCategory,
  } = useProducts();

  const { addToCart, cartItems } = useCart();

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("default"); // default, price-low, price-high, rating
  const [showSortMenu, setShowSortMenu] = useState(false);

  const searchTimeout = useRef(null);

  // Kiểm tra sản phẩm đã có trong giỏ chưa
  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  // ============================================
  // SEARCH WITH DEBOUNCE
  // ============================================
  const handleSearch = (text) => {
    setSearchText(text);

    // Clear timeout cũ
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set timeout mới (debounce 500ms)
    searchTimeout.current = setTimeout(() => {
      searchProducts(text);
    }, 500);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchText("");
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    reset();
  };

  // ============================================
  // CATEGORY FILTER
  // ============================================
  const handleCategorySelect = (categoryId) => {
    // Nếu đã chọn category này rồi → không làm gì
    if (selectedCategory === categoryId) return;

    setSelectedCategory(categoryId);

    // Clear search nếu đang search
    if (searchText) {
      setSearchText("");
    }

    if (categoryId === "all") {
      // Về tất cả → reset và fetch lại
      reset();
    } else {
      // Fetch theo category từ API
      fetchByCategory(categoryId, 0, false);
    }
  };

  // ============================================
  // PULL TO REFRESH
  // ============================================
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(0, false);
    setRefreshing(false);
  };

  // ============================================
  // SORT PRODUCTS
  // ============================================
  const getSortedProducts = () => {
    let sorted = [...products];

    // ✅ KHÔNG filter theo category nữa (đã filter từ API)
    // Chỉ sort
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return sorted;
  };

  const sortedProducts = getSortedProducts();

  // ============================================
  // ADD TO CART
  // ============================================
  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      brand: product.brand,
    });
    Alert.alert("✅ Added to cart", product.title);
  };

  // ============================================
  // RENDER FOOTER
  // ============================================
  const renderFooter = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.footer}>
          <LoadingSpinner
            message={isSearching ? "Searching..." : "Loading more..."}
          />
        </View>
      );
    }

    if (!hasMore && sortedProducts.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>🎉 You've reached the end!</Text>
        </View>
      );
    }

    return null;
  };

  // ============================================
  // RENDER EMPTY
  // ============================================
  const renderEmpty = () => {
    if (loading) return null;

    if (error) {
      return <ErrorState message={error} onRetry={reset} />;
    }

    if (isSearching && sortedProducts.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="No results found"
          message={`No products match "${searchQuery}"`}
        />
      );
    }

    if (selectedCategory !== "all" && sortedProducts.length === 0 && !loading) {
      return (
        <EmptyState
          icon="folder-open-outline"
          title="No products in this category"
          message={`No products found in "${selectedCategory}"`}
        />
      );
    }

    return (
      <EmptyState
        icon="cube-outline"
        title="No products"
        message="Pull down to refresh"
      />
    );
  };

  // ============================================
  // SORT MENU
  // ============================================
  const renderSortMenu = () => {
    if (!showSortMenu) return null;

    const sortOptions = [
      { id: "default", label: "Default", icon: "swap-vertical" },
      { id: "price-low", label: "Price: Low to High", icon: "arrow-up" },
      { id: "price-high", label: "Price: High to Low", icon: "arrow-down" },
      { id: "rating", label: "Top Rated", icon: "star" },
    ];

    return (
      <View style={styles.sortMenu}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortOption,
              sortBy === option.id && styles.sortOptionActive,
            ]}
            onPress={() => {
              setSortBy(option.id);
              setShowSortMenu(false);
            }}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={sortBy === option.id ? "#007AFF" : "#666"}
            />
            <Text
              style={[
                styles.sortOptionText,
                sortBy === option.id && styles.sortOptionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ===== SEARCH BAR ===== */}
        <SearchBar
          value={searchText}
          onChangeText={handleSearch}
          onClear={handleClearSearch}
          placeholder="Search products..."
        />

        {/* ===== CATEGORY FILTER ===== */}
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === item.id && styles.categoryChipActive,
                ]}
                onPress={() => handleCategorySelect(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={selectedCategory === item.id ? "#fff" : "#666"}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.categoryTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ===== INFO BAR + SORT ===== */}
        <View style={styles.infoBar}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoText}>
              {isSearching
                ? `🔍 "${searchQuery}" (${sortedProducts.length})`
                : selectedCategory !== "all"
                  ? `📂 ${selectedCategory} (${sortedProducts.length})`
                  : isFromCache
                    ? `💾 ${sortedProducts.length} (cached)`
                    : `📦 ${sortedProducts.length} products`}
            </Text>
            {hasMore && !isSearching && (
              <Text style={styles.hasMoreText}>↓ more</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortMenu(!showSortMenu)}
            activeOpacity={0.7}
          >
            <Ionicons name="options" size={18} color="#007AFF" />
            <Text style={styles.sortButtonText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* ===== SORT MENU ===== */}
        {renderSortMenu()}

        {/* ===== PRODUCT LIST ===== */}
        <FlatList
          data={sortedProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onAddToCart={handleAddToCart}
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: item.id })
              }
              isInCart={isInCart(item.id)}
            />
          )}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        />

        {/* ===== FAB: AI RECOMMENDATION (Bonus 3) ===== */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AIRecommend")}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },

  // Category
  categoryContainer: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryList: {
    paddingHorizontal: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // Info bar
  infoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  hasMoreText: {
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "600",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    gap: 4,
  },
  sortButtonText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "600",
  },

  // Sort menu
  sortMenu: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  sortOptionActive: {
    backgroundColor: "#E3F2FD",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#666",
  },
  sortOptionTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },

  // List
  listContent: {
    paddingVertical: 10,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },

  // Footer
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#999",
  },

  // FAB (Floating Action Button)
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#9C27B0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
