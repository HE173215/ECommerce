import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * PriceSummary - Hiển thị tóm tắt giá
 * 
 * @param {Number} itemCount - Tổng số lượng sản phẩm
 * @param {Number} totalPrice - Tổng tiền
 * @param {Number} shippingFee - Phí ship (mặc định 0)
 */
export default function PriceSummary({
  itemCount,
  totalPrice,
  shippingFee = 0,
}) {
  const formatPrice = (price) => `$${price.toFixed(2)}`;
  const grandTotal = totalPrice + shippingFee;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal ({itemCount} items)</Text>
        <Text style={styles.value}>{formatPrice(totalPrice)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Shipping</Text>
        <Text style={styles.value}>
          {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(grandTotal)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
});