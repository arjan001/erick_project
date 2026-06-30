import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
  publishableKey: import.meta.env.VITE_PUBLISHABLE_KEY,
  baseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL,
});