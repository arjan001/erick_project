/**
 * IP Geolocation Service
 * Uses free IP geolocation APIs to get location data from IP addresses
 */

const GEOLOCATION_APIS = [
  {
    name: 'ipapi.co',
    url: (ip) => `https://ipapi.co/${ip}/json/`,
    parser: (data) => ({
      country: data.country_name,
      city: data.city,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude
    })
  },
  {
    name: 'ip-api.com',
    url: (ip) => `http://ip-api.com/json/${ip}`,
    parser: (data) => ({
      country: data.country,
      city: data.city,
      region: data.regionName,
      latitude: data.lat,
      longitude: data.lon
    })
  }
];

class LocationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get location data for an IP address
   * @param ip - IP address to lookup
   * @returns Location data or null if failed
   */
  async getLocation(ip) {
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      return null;
    }

    // Check cache first
    const cached = this.cache.get(ip);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Try each API until one succeeds
    for (const api of GEOLOCATION_APIS) {
      try {
        const response = await fetch(api.url(ip));
        if (!response.ok) continue;

        const data = await response.json();
        const location = api.parser(data);

        if (location && location.country) {
          // Cache the result
          this.cache.set(ip, {
            data: location,
            timestamp: Date.now()
          });
          return location;
        }
      } catch (error) {
        console.warn(`Failed to fetch location from ${api.name}:`, error);
        continue;
      }
    }

    return null;
  }

  /**
   * Get location from browser's geolocation API (client-side only)
   * @returns Promise with latitude and longitude
   */
  async getBrowserLocation() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        { timeout: 5000 }
      );
    });
  }

  /**
   * Parse user agent string to get device info
   * @param userAgent - User agent string
   * @returns Device information
   */
  parseUserAgent(userAgent) {
    const ua = userAgent.toLowerCase();

    // Device type
    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
      deviceType = /tablet|ipad/i.test(ua) ? 'tablet' : 'mobile';
    }

    // Browser
    let browser = 'unknown';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';

    // OS
    let os = 'unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { deviceType, browser, os };
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const locationService = new LocationService();
