import React from 'react';

export const VisaLogo = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 48 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="32" rx="4" fill="#1A1F71" />
    <path
      d="M19.5 21H17L18.5 11H21L19.5 21Z"
      fill="white"
    />
    <path
      d="M28 11L25.5 18L25 15.5L24.5 11.5C24.5 11.5 24 11 23 11H19V11.5L22.5 21H25L29 11H28Z"
      fill="white"
    />
    <path
      d="M32 11V11H35C35 11 36 11 36 12V14C36 14 35.5 14.5 35 14.5L36 21H33.5L33 15H32V11Z"
      fill="white"
    />
    <path
      d="M14 11L11 18L10.5 15.5L10 11.5C10 11.5 9.5 11 8.5 11H4.5V11.5L8 21H10.5L14 11Z"
      fill="white"
    />
  </svg>
);

export const MastercardLogo = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 48 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="32" rx="4" fill="#000" />
    <circle cx="18" cy="16" r="10" fill="#EB001B" />
    <circle cx="30" cy="16" r="10" fill="#F79E1B" />
    <path
      d="M24 8.5C21.5 10.5 19.5 13 19.5 16C19.5 19 21.5 21.5 24 23.5C26.5 21.5 28.5 19 28.5 16C28.5 13 26.5 10.5 24 8.5Z"
      fill="#FF5F00"
    />
  </svg>
);

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
);

export const CardBrandLogo = ({ brand, className = '' }) => {
  const brandLower = (brand || '').toLowerCase();
  if (brandLower.includes('visa')) return <VisaLogo className={className} />;
  if (brandLower.includes('master')) return <MastercardLogo className={className} />;
  return null;
};
