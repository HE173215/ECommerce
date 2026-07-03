import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGemini } from "../hooks/useGemini";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

// Gợi ý câu hỏi
const SUGGESTIONS = [
  { icon: "gift", text: "Gift for girlfriend under $50" },
  { icon: "laptop", text: "Best laptop for students" },
  { icon: "phone-portrait", text: "Phone with good camera" },
  { icon: "flower", text: "Perfume for summer" },
];

export default function AIRecommendScreen({ navigation }) {
  const { products } = useProducts();
  const { addToCart, cartItems } = useCart();
  const {
    loading,
    error,
    recommendations,
    explanation,
    recommendProducts,
    reset,
    isFallback,
  } = useGemini();

  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Lọc sản phẩm được recommend
  const recommendedProducts = products.filter((p) =>
    recommendations.includes(p.id),
  );

  // Kiểm tra sản phẩm đã có trong giỏ chưa
  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert("Error", "Please enter your requirements");
      return;
    }

    if (products.length === 0) {
      Alert.alert(
        "Error",
        "No products available. Please go back and load products first.",
      );
      return;
    }

    setHasSearched(true);
    await recommendProducts(query, products);
  };

  // Handle suggestion tap
  const handleSuggestionTap = async (text) => {
    setQuery(text);
    setHasSearched(true);
    await recommendProducts(text, products);
  };

  // Handle add to cart
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

  // Handle reset
  const handleReset = () => {
    setQuery("");
    setHasSearched(false);
    reset();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ===== HEADER ===== */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="sparkles" size={32} color="#9C27B0" />
            </View>
            <Text style={styles.headerTitle}>AI Shopping Assistant</Text>
            <Text style={styles.headerSubtitle}>
              Tell me what you're looking for, and I'll find the perfect
              products for you!
            </Text>
          </View>

          {/* ===== INPUT ===== */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="E.g., Gift for my mom, budget $100..."
              placeholderTextColor="#999"
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[
                styles.searchButton,
                loading && styles.searchButtonDisabled,
              ]}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="search" size={18} color="#fff" />
                  <Text style={styles.searchButtonText}>Ask AI</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ===== SUGGESTIONS (chỉ hiện khi chưa search) ===== */}
          {!hasSearched && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>💡 Try these:</Text>
              <View style={styles.suggestionsList}>
                {SUGGESTIONS.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestionTap(suggestion.text)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={suggestion.icon}
                      size={14}
                      color="#9C27B0"
                    />
                    <Text style={styles.suggestionText}>{suggestion.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ===== ERROR ===== */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ===== RESULTS ===== */}
          {hasSearched && !loading && (
            <>
              {explanation && (
                <View
                  style={[
                    styles.explanationContainer,
                    isFallback && styles.explanationContainerFallback, // Đổi màu khi fallback
                  ]}
                >
                  <View style={styles.explanationHeader}>
                    <Ionicons
                      name={isFallback ? "hardware-chip" : "sparkles"}
                      size={18}
                      color={isFallback ? "#007AFF" : "#9C27B0"}
                    />
                    <Text style={styles.explanationTitle}>
                      {isFallback
                        ? "Smart Local Search (Offline Mode)"
                        : "Gemini AI Recommendation"}
                    </Text>
                  </View>
                  <Text style={styles.explanationText}>{explanation}</Text>
                </View>
              )}

              {/* Recommended Products */}
              {recommendedProducts.length > 0 ? (
                <View style={styles.resultsContainer}>
                  <Text style={styles.resultsTitle}>
                    🎯 Found {recommendedProducts.length} products for you
                  </Text>
                  <View style={styles.productsGrid}>
                    {recommendedProducts.map((product) => (
                      <View key={product.id} style={styles.productWrapper}>
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onPress={() =>
                            navigation.navigate("ProductDetail", {
                              productId: product.id,
                            })
                          }
                          isInCart={isInCart(product.id)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <EmptyState
                  icon="sad-outline"
                  title="No matches found"
                  message="Try a different query or browse our products manually"
                />
              )}

              {/* Reset button */}
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={18} color="#007AFF" />
                <Text style={styles.resetButtonText}>Try another query</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ===== LOADING ===== */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9C27B0" />
              <Text style={styles.loadingText}>AI is thinking...</Text>
              <Text style={styles.loadingSubtext}>
                Analyzing {products.length} products to find the best match
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3E5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },

  // Input
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  input: {
    fontSize: 15,
    color: "#333",
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  searchButton: {
    flexDirection: "row",
    backgroundColor: "#9C27B0",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  // Suggestions
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  suggestionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  suggestionText: {
    fontSize: 13,
    color: "#333",
  },

  // Error
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#C62828",
  },

  // Explanation
  explanationContainer: {
    backgroundColor: "#FFF8E1",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#FFB800",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  explanationText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },

  // Results
  resultsContainer: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productWrapper: {
    width: "48%",
    marginBottom: 10,
  },

  // Loading
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9C27B0",
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 13,
    color: "#999",
    marginTop: 6,
  },

  // Reset
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    gap: 8,
  },
  resetButtonText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "600",
  },
  explanationContainerFallback: {
    backgroundColor: "#E3F2FD", // Màu xanh dương nhạt cho Local Search
    borderLeftColor: "#007AFF",
  },
});
