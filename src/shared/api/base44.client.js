// Mock Base44 client to prevent crashes
// This is a placeholder since we're not using Base44 auth

export const base44 = {
  auth: {
    me: async () => {
      const storedUser = localStorage.getItem('studio22_user');
      return storedUser ? JSON.parse(storedUser) : null;
    },
    logout: () => {
      localStorage.removeItem('studio22_user');
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = '/signin';
    }
  },
  entities: {
    // Mock entity methods - return empty arrays or handle gracefully
    filter: async () => [],
    create: async (data) => ({ ...data, id: `mock_${Date.now()}` }),
    update: async (id, data) => ({ ...data, id }),
    delete: async (id) => true,
    get: async (id) => null
  },
  appLogs: {
    logUserInApp: async () => {
      // Silently ignore - no logging needed
    }
  }
};
