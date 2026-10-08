import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getCart, setCart, addToCart as addToCartService, removeFromCart as removeFromCartService, updateCartQuantity as updateCartQuantityService, clearCart as clearCartService, getWishlist, setWishlist, addToWishlist as addToWishlistService, removeFromWishlist as removeFromWishlistService, isInWishlist as isInWishlistService, setCurrentUserId } from '@/services/shopService';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const { user, isAuthenticated: authIsAuthenticated } = useAuth();
  const [cart, setCartState] = useState([]);
  const [wishlist, setWishlistState] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
      loadCart();
      loadWishlist();
    }
  }, [user?.id]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const cartItems = await getCart();
      setCartState(cartItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const wishlistItems = await getWishlist();
      setWishlistState(wishlistItems);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, options = {}) => {
    const updated = await addToCartService(product, quantity, options);
    setCartState(updated);
    return true;
  };

  const removeFromCart = async (itemId) => {
    const updated = await removeFromCartService(itemId);
    setCartState(updated);
  };

  const setQuantity = async (itemId, quantity) => {
    const updated = await updateCartQuantityService(itemId, quantity);
    setCartState(updated);
  };

  const clear = async () => {
    await clearCartService();
    setCartState([]);
  };

  const toggleWish = async (product) => {
    const isWished = await isInWishlistService(product.id);
    let updated;
    if (isWished) {
      // Remove from wishlist
      const wishlistItems = await getWishlist();
      const itemToRemove = wishlistItems.find(w => w.product_id === product.id);
      if (itemToRemove) {
        updated = await removeFromWishlistService(itemToRemove.id);
      }
    } else {
      // Add to wishlist
      updated = await addToWishlistService(product);
    }
    setWishlistState(updated);
  };

  const isWished = async (productId) => {
    return await isInWishlistService(productId);
  };

  return (
    <ShopContext.Provider value={{ cart, wishlist, loading, isAuthenticated: authIsAuthenticated, addToCart, removeFromCart, setQuantity, clear, toggleWish, isWished }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
