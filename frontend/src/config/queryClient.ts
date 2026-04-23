import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * Optimized for caching, background refetching, and error handling
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Caching configuration
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time (formerly cacheTime)
      
      // Refetch configuration
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when reconnecting
      refetchOnMount: true, // Refetch on component mount
      
      // Retry configuration
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Performance optimization
      structuralSharing: true, // Optimize re-renders by sharing unchanged data
    },
    mutations: {
      // Retry configuration for mutations
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Query Keys Factory
 * Centralized query key management for better cache control
 */
export const queryKeys = {
  athletes: {
    all: ['athletes'] as const,
    lists: () => [...queryKeys.athletes.all, 'list'] as const,
    list: (filters?: Record<string, unknown> | { search?: string; is_active?: boolean; has_debt?: boolean }) => 
      [...queryKeys.athletes.lists(), filters] as const,
    details: () => [...queryKeys.athletes.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.athletes.details(), id] as const,
  },
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (athleteId?: number) => 
      [...queryKeys.payments.lists(), athleteId] as const,
  },
  shelves: {
    all: ['shelves'] as const,
    lists: () => [...queryKeys.shelves.all, 'list'] as const,
    list: (filters?: Record<string, unknown> | { is_occupied?: boolean; search?: string }) => 
      [...queryKeys.shelves.lists(), filters] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },
};
