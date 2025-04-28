import { QueryClient } from '@tanstack/react-query';
import { useError } from '../context/ErrorContext';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 404s or auth errors
          if (error?.response?.status === 404 || error?.response?.status === 401) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
};

// Custom hook for handling query errors
export const useQueryErrorHandler = () => {
  const { showError } = useError();

  return (error) => {
    const message = error?.response?.data?.message || error?.message || 'An error occurred';
    showError(message);
  };
};
