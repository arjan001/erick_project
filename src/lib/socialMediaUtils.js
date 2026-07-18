// Utility functions to format social media URLs with base domains

export const SOCIAL_MEDIA_PATTERNS = {
  instagram: {
    base: 'https://instagram.com/',
    regex: /^https?:\/\/(www\.)?instagram\.com\//i,
    placeholder: 'username'
  },
  linkedin: {
    base: 'https://linkedin.com/in/',
    regex: /^https?:\/\/(www\.)?linkedin\.com\/in\//i,
    placeholder: 'username'
  },
  twitter: {
    base: 'https://twitter.com/',
    regex: /^https?:\/\/(www\.)?twitter\.com\//i,
    placeholder: 'username'
  },
  x: {
    base: 'https://x.com/',
    regex: /^https?:\/\/(www\.)?x\.com\//i,
    placeholder: 'username'
  },
  youtube: {
    base: 'https://youtube.com/@',
    regex: /^https?:\/\/(www\.)?youtube\.com\/@/i,
    placeholder: 'channel'
  },
  vimeo: {
    base: 'https://vimeo.com/',
    regex: /^https?:\/\/(www\.)?vimeo\.com\//i,
    placeholder: 'username'
  },
  imdb: {
    base: 'https://imdb.com/name/',
    regex: /^https?:\/\/(www\.)?imdb\.com\/name\//i,
    placeholder: 'nm1234567'
  },
  website: {
    base: 'https://',
    regex: /^https?:\/\//i,
    placeholder: 'example.com'
  }
};

/**
 * Format a social media URL with the appropriate base domain
 * @param {string} platform - Platform key (instagram, linkedin, twitter, etc.)
 * @param {string} value - User input (username or full URL)
 * @returns {string} Formatted URL
 */
export function formatSocialMediaUrl(platform, value) {
  if (!value || !value.trim()) return '';
  
  const trimmedValue = value.trim();
  const pattern = SOCIAL_MEDIA_PATTERNS[platform];
  
  if (!pattern) return trimmedValue;
  
  // If already has the base URL, return as is
  if (pattern.regex.test(trimmedValue)) {
    return trimmedValue;
  }
  
  // If starts with http/https but not the correct domain, return as is
  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }
  
  // Remove leading @ for platforms that use it
  const cleanValue = trimmedValue.startsWith('@') ? trimmedValue.slice(1) : trimmedValue;
  
  // Add base URL
  return pattern.base + cleanValue;
}

/**
 * Extract username from a social media URL
 * @param {string} platform - Platform key
 * @param {string} url - Full URL
 * @returns {string} Username without base URL
 */
export function extractUsername(platform, url) {
  if (!url) return '';
  
  const pattern = SOCIAL_MEDIA_PATTERNS[platform];
  if (!pattern) return url;
  
  if (pattern.regex.test(url)) {
    return url.replace(pattern.regex, '').replace(/\/$/, '');
  }
  
  return url;
}
