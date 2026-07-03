import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // ← THÊM

import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AIRecommendScreen from '../screens/AIRecommendScreen';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

const Stack = createNativeStackNavigator();

// Component riêng cho header right
function HeaderRight() {
  const navigation = useNavigation(); // ← Hook này tự lấy đúng navigator
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <TouchableOpacity
        style={{ position: 'relative', padding: 4 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => navigation.navigate('Wishlist')}
      >
        <Ionicons name="heart" size={22} color="#FF3B30" />
        {wishlistCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: -4,
              backgroundColor: '#FF3B30',
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 3,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {wishlistCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={{ fontSize: 12, color: '#999', marginRight: 8 }}>
        🛒 {itemCount}
      </Text>
    </View>
  );
}

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
        },
        headerTintColor: '#007AFF',
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          title: '🛍️ Shop',
          headerRight: () => <HeaderRight />,
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: 'Product Detail',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          title: 'My Wishlist',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="AIRecommend"
        component={AIRecommendScreen}
        options={{
          title: '✨ AI Recommend',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}