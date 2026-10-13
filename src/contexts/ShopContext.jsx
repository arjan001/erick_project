import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getCart, setCart, addToCart as addToCartService, removeFromCart as removeFromCartService, updateCartQuantity as updateCartQuantityService, clearCart as clearCartService, setCurrentUserId } from '@/services/shopService'

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  // Defensive: try to get auth context, but don't crash if not available yet
  let authContext
  try {
    authContext = useAuth()
  } catch (err) {
    // AuthProvider not ready yet - return null context until it's ready
    authContext = { user: null, isAuthenticated: false }
  }

  const { user, isAuthenticated: authIsAuthenticated } = authContext
  const [cart, setCartState] = useState([])
  const [loading, setLoading] = useState(false)
  const [toastSuccess, setToastSuccess] = useState(() => () => { })
  const [toastError, setToastError] = useState(() => () => { })

  // Get toast functions from parent context if available
  useEffect(() => {
    // Try to get toast from window if available (fallback)
    const getToastFunctions = () => {
      try {
        // This is a fallback - the proper way is to wrap the provider
        return {
          success: (title, message) => console.log('[Toast] Success:', title, message),
          error: (title, message) => console.log('[Toast] Error:', title, message),
          info: (title, message) => console.log('[Toast] Info:', title, message)
        }
      } catch {
        return {
          success: (title, message) => console.log('[Toast] Success:', title, message),
          error: (title, message) => console.log('[Toast] Error:', title, message),
          info: (title, message) => console.log('[Toast] Info:', title, message)
        }
      }
    }
    const toasts = getToastFunctions()
    setToastSuccess(() => toasts.success)
    setToastError(() => toasts.error)
  }, [])

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id)
      loadCart()
    }
  }, [user?.id])

  const loadCart = async () => {
    setLoading(true)
    try {
      const cartItems = await getCart()
      setCartState(cartItems)
    } catch (error) {
      console.warn('Failed to load cart:', error)
      setCartState([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product, quantity = 1, options = {}) => {
    const updated = await addToCartService(product, quantity, options)
    setCartState(updated)
    toastSuccess('Added to Cart', `${product.name} has been added to your cart`)
    return true
  }

  const removeFromCart = async (itemId) => {
    const updated = await removeFromCartService(itemId)
    setCartState(updated)
  }

  const setQuantity = async (itemId, quantity) => {
    const updated = await updateCartQuantityService(itemId, quantity)
    setCartState(updated)
  }

  const clear = async () => {
    await clearCartService()
    setCartState([])
  }

  return (
    <ShopContext.Provider value={{ cart, loading, isAuthenticated: authIsAuthenticated, addToCart, removeFromCart, setQuantity, clear }}>
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return context
}
