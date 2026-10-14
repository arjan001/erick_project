import React from 'react'

// IMPORTANT: Place the card payment logo image (Visa, Mastercard, Amex) at: public/card-payment-logos.png
// The user provided this image showing the three card logos
export const CardBrandLogo = ({ brand, className = '' }) => {
  const brandLower = (brand || '').toLowerCase()

  // Return the image for Visa, Mastercard, and Amex
  if (brandLower.includes('visa') || brandLower.includes('master') || brandLower.includes('amex') || brandLower.includes('american')) {
    return (
      <img
        src="/card-payment-logos.png"
        alt="Payment Methods"
        className={className}
        style={{ maxWidth: '200px', height: 'auto' }}
      />
    )
  }

  return null
}

// Keep M-Pesa as SVG (it's unique to Kenya)
export const MpesaLogo = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 48 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="32" rx="4" fill="#4CAF50" />
    <path
      d="M12 10H20V12H14V14H19V16H14V20H12V10Z"
      fill="white"
    />
    <path
      d="M22 10H26C27 10 28 10.5 28 12C28 13 27.5 13.5 27 13.5C28 14 28.5 14.5 28.5 15.5C28.5 17 27.5 18 26 18H22V10ZM24 12V13H25.5C26 13 26 12.5 26 12.5C26 12 26 12 25.5 12H24ZM24 14V16H25.5C26 16 26.5 15.5 26.5 15C26.5 14.5 26 14 25.5 14H24Z"
      fill="white"
    />
    <path
      d="M30 10H38V12H32V14H37V16H32V18H30V10Z"
      fill="white"
    />
  </svg>
)
