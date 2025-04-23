"use client";

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StravaProvider } from '@/strava-context';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Provider component that wraps the app with all necessary providers
 * - SessionProvider for Next Auth
 * - QueryClientProvider for React Query
 * - StravaProvider for Strava API client
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <StravaProvider>{children}</StravaProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
