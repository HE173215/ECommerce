import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * CartItem - Hiển thị 1 sản phẩm trong giỏ hàng
 * 
 * @param {Object} item - { id, title, price, thumbnail, quantity }
 * @param {Function} onIncrease - Tăng số lượng
 * @param {Function} onDecrease - Giảm số lượng
 * @param {Function} onRemove - Xóa khỏi giỏ
 */
export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <View style={styles.container}>
      {/* Ảnh sản phẩm */}
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Thông tin sản phẩm */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>
          {formatPrice(item.price)}
        </Text>

        {/* Điều khiển số lượng */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={onDecrease}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={16} color="#007AFF" />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={onIncrease}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tổng tiền + Nút xóa */}
      <View style={styles.rightContainer}>
        <Text style={styles.subtotal}>
          {formatPrice(item.price * item.quantity)}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 13,
    color: '#666',
    marginVertical: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  subtotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  removeButton: {
    padding: 6,
  },
});