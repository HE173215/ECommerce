import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/CartItem';
import PriceSummary from '../components/PriceSummary';
import EmptyState from '../components/EmptyState';

export default function CartScreen({ navigation }) {
  const {
    cartItems,
    totalPrice,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // ============================================
  // HANDLE CHECKOUT
  // ============================================
  const handleCheckout = () => {
    Alert.alert(
      'Confirm Order',
      `You are about to place an order for ${itemCount} ${
        itemCount === 1 ? 'item' : 'items'
      }.\n\nTotal: $${totalPrice.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          style: 'default',
          onPress: () => {
            Alert.alert(
              '✅ Order Placed!',
              'Thank you for your purchase. Your order will be delivered soon.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    clearCart();
                    // Optional: navigate về Home
                    // navigation.navigate('Home');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // ============================================
  // HANDLE CLEAR CART
  // ============================================
  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearCart,
        },
      ]
    );
  };

  // ============================================
  // EMPTY STATE
  // ============================================
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="cart-outline"
            title="Your cart is empty"
            message="Looks like you haven't added anything to your cart yet."
          />
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // MAIN CONTENT
  // ============================================
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity
          onPress={handleClearCart}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items List */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onIncrease={() => updateQuantity(item.id, 'increase')}
            onDecrease={() => updateQuantity(item.id, 'decrease')}
            onRemove={() => removeFromCart(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Price Summary + Checkout Button */}
      <View style={styles.bottomBar}>
        <PriceSummary itemCount={itemCount} totalPrice={totalPrice} />

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          activeOpacity={0.8}
        >
          <Ionicons name="lock-closed" size={18} color="#fff" />
          <Text style={styles.checkoutText}>
            Checkout • ${totalPrice.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  shopButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 4,
  },
  clearText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },

  // Bottom bar
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 12,
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});