import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../hooks/useWishlist';

/**
 * ProductCard - Hiển thị thông tin 1 sản phẩm
 */
export default function ProductCard({ product, onAddToCart, onPress, isInCart = false }) {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  // Sử dụng wishlist hook
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const shortTitle =
    product.title.length > 40
      ? product.title.substring(0, 40) + '...'
      : product.title;

  // Handle toggle wishlist
  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Phần ảnh */}
      <View style={styles.imageContainer}>
        {imageLoading && !imageError && (
          <ActivityIndicator
            style={styles.imageLoader}
            size="small"
            color="#007AFF"
          />
        )}
        {imageError ? (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        ) : (
          <Image
            source={{ uri: product.thumbnail }}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}

        {/* Nút Wishlist (trái tim) */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleToggleWishlist}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={isWishlisted ? '#FF3B30' : '#fff'}
          />
        </TouchableOpacity>

        {/* Badge "In Cart" */}
        {isInCart && (
          <View style={styles.cartBadge}>
            <Ionicons name="cart" size={12} color="#fff" />
          </View>
        )}
      </View>

      {/* Phần thông tin */}
      <View style={styles.infoContainer}>
        <Text style={styles.brand}>{product.brand || 'Generic'}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {shortTitle}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        {/* Nút Add to Cart */}
        <TouchableOpacity
          style={[styles.addButton, isInCart && styles.addedButton]}
          onPress={() => {
            if (onAddToCart) {
              onAddToCart(product);
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isInCart ? 'checkmark-circle' : 'cart-outline'}
            size={16}
            color="#fff"
          />
          <Text style={styles.addButtonText}>
            {isInCart ? 'Added' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    maxWidth: '48%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#34C759',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 10,
  },
  brand: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    minHeight: 36,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  addedButton: {
    backgroundColor: '#34C759',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});