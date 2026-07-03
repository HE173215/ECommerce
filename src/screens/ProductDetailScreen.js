import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useCart } from "../hooks/useCart";
import PriceSummary from "../components/PriceSummary";
import { useWishlist } from "../hooks/useWishlist";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { addToCart, cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(productId);

  // Kiểm tra sản phẩm đã có trong giỏ chưa
  const isInCart = cartItems.some((item) => item.id === productId);

  // Fetch chi tiết sản phẩm
  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const fetchProductDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (err) {
      console.error("❌ Error fetching product detail:", err);
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      brand: product.brand,
    });

    Alert.alert(
      "✅ Added to Cart",
      `${product.title} has been added to your cart`,
      [
        { text: "Continue Shopping", style: "cancel" },
        {
          text: "View Cart",
          onPress: () => navigation.navigate("Cart"), // ← ĐÚNG: sang tab Cart
        },
      ],
    );
  };

  // Format giá
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  // Format discount
  const formatDiscount = (discount) => {
    if (!discount || discount === 0) return null;
    return `-${discount}%`;
  };

  // Render stars rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFB800" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFB800" />,
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#FFB800" />,
        );
      }
    }
    return stars;
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchProductDetail}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // EMPTY STATE
  // ============================================
  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // MAIN CONTENT
  // ============================================
  const images = product.images || [product.thumbnail];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== PHẦN ẢNH ===== */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[imageIndex] }}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Discount badge */}
          {product.discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {formatDiscount(product.discountPercentage)}
              </Text>
            </View>
          )}

          {/* Image pagination dots */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === imageIndex && styles.activeDot]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Thumbnail selector */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
            contentContainerStyle={styles.thumbnailContent}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setImageIndex(index)}
                style={[
                  styles.thumbnail,
                  index === imageIndex && styles.activeThumbnail,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ===== PHẦN THÔNG TIN ===== */}
        <View style={styles.infoContainer}>
          {/* Brand */}
          {product.brand && (
            <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
          )}

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>{renderStars(product.rating || 0)}</View>
            <Text style={styles.ratingText}>
              {product.rating?.toFixed(1) || "0.0"}
            </Text>
            {product.stock !== undefined && (
              <Text style={styles.stockText}>• {product.stock} in stock</Text>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.discountPercentage > 0 && (
              <Text style={styles.originalPrice}>
                {formatPrice(
                  product.price / (1 - product.discountPercentage / 100),
                )}
              </Text>
            )}
          </View>

          {/* Category */}
          {product.category && (
            <View style={styles.categoryContainer}>
              <Ionicons name="pricetag-outline" size={14} color="#666" />
              <Text style={styles.category}>{product.category}</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description || "No description available."}
            </Text>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>SKU:</Text>
              <Text style={styles.infoValue}>{product.sku || "N/A"}</Text>
            </View>
            {product.weight && (
              <View style={styles.infoRow}>
                <Ionicons name="scale-outline" size={18} color="#666" />
                <Text style={styles.infoLabel}>Weight:</Text>
                <Text style={styles.infoValue}>{product.weight}g</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#34C759"
              />
              <Text style={styles.infoLabel}>Availability:</Text>
              <Text style={[styles.infoValue, { color: "#34C759" }]}>
                {product.availabilityStatus || "In Stock"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ===== NÚT ADD TO CART (CỐ ĐỊNH DƯỚI) ===== */}
      <View style={styles.bottomBar}>
        {/* Nút Wishlist */}
        <TouchableOpacity
          style={[
            styles.wishlistButton,
            isWishlisted && styles.wishlistedButton,
          ]}
          onPress={() => toggleWishlist(product)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={22}
            color={isWishlisted ? "#fff" : "#FF3B30"}
          />
        </TouchableOpacity>

        {/* Phần giá + nút Add to Cart */}
        <View style={styles.priceSummary}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>{formatPrice(product.price)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, isInCart && styles.addedButton]}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isInCart ? "checkmark-circle" : "cart-outline"}
            size={20}
            color="#fff"
          />
          <Text style={styles.addToCartText}>
            {isInCart ? "Added to Cart" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Để không bị bottomBar che
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  // Image
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 18,
  },

  // Thumbnails
  thumbnailContainer: {
    maxHeight: 80,
    backgroundColor: "#fff",
  },
  thumbnailContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  activeThumbnail: {
    borderColor: "#007AFF",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  // Info
  infoContainer: {
    padding: 16,
  },
  brand: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stars: {
    flexDirection: "row",
    marginRight: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  stockText: {
    fontSize: 13,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  price: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF3B30",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  category: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
    textTransform: "capitalize",
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },

  // Additional info
  additionalInfo: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
    marginRight: 6,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  priceSummary: {
    marginRight: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: "#999",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF3B30",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  addedButton: {
    backgroundColor: "#34C759",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  wishlistButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  wishlistedButton: {
    backgroundColor: "#FF3B30",
    borderColor: "#FF3B30",
  },
});
