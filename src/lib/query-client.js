import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
			refetchOnMount: false,
			refetchOnReconnect: true
		},
		mutations: {
			retry: 1
		}
	},
});