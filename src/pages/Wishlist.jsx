import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function WishlistPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Wishlist feature has been removed - redirect to shop
    navigate('/Shop')
  }, [navigate])

  return null
}
