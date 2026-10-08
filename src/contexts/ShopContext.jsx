import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getCart, setCart, addToCart as addToCartService, removeFromCart as removeFromCartService, updateCartQuantity as updateCartQuantityService, clearCart as clearCartService } from '@/services/shopService';

const wishlistStorageKey = 'smartgigs_wishlist';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const { isAuthenticated: authIsAuthenticated } = useAuth();
  const [cart, setCartState] = useState([]);
  const [wishlist, setWishlistState] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
    loadWishlist();
  }, []);

  const loadCart = () => {
    setCartState(getCart());
  };

  const loadWishlist = () => {
    try {
      const raw = localStorage.getItem(wishlistStorageKey);
      setWishlistState(raw ? JSON.parse(raw) : []);
    } catch {
      setWishlistState([]);
    }
  };

  const addToCart = (product, quantity = 1, options = {}) => {
    const updated = addToCartService(product, quantity, options);
    setCartState(updated);
    return true;
  };

  const removeFromCart = (itemId) => {
    const updated = removeFromCartService(itemId);
    setCartState(updated);
  };

  const setQuantity = (itemId, quantity) => {
    const updated = updateCartQuantityService(itemId, quantity);
    setCartState(updated);
  };

  const clear = () => {
    clearCartService();
    setCartState([]);
  };

  const toggleWish = (product) => {
    const isWished = wishlist.some(w => w.product_id === product.id);
    let updated;
    if (isWished) {
      updated = wishlist.filter(w => w.product_id !== product.id);
    } else {
      updated = [...wishlist, {
        id: Date.now().toString(),
        product_id: product.id,
        product_name: product.name,
        image: product.image || product.images?.[0],
        price: product.price,
        added_at: new Date().toISOString(),
      }];
    }
    setWishlistState(updated);
    localStorage.setItem(wishlistStorageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const isWished = (productId) => {
    return wishlist.some(w => w.product_id === productId);
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
