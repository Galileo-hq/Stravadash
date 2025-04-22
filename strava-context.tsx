"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StravaApiClient } from '../api/strava-client';

// Define the context type
type StravaContextType = {
  client: StravaApiClient | null;
  isLoading: boolean;
  error: Error | null;
};

// Create the context with default values
const StravaContext = createContext<StravaContextType>({
  client: null,
  isLoading: false,
  error: null,
});

// Provider props type
type StravaProviderProps = {
  children: ReactNode;
};

/**
 * Provider component that wraps the app and makes the Strava client
 * available to any child component that calls useStrava().
 */
export function StravaProvider({ children }: StravaProviderProps) {
  const { data: session, status } = useSession();
  const [client, setClient] = useState<StravaApiClient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only initialize the client when we have a valid session
    if (status === 'loading') {
      return;
    }

    if (status === 'authenticated' && session?.accessToken) {
      try {
        const stravaClient = new StravaApiClient(
          session.accessToken as string,
          session.refreshToken as string,
          session.expiresAt as number
        );
        setClient(stravaClient);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize Strava client'));
        setClient(null);
      }
    } else {
      setClient(null);
    }

    setIsLoading(false);
  }, [session, status]);

  const value = {
    client,
    isLoading,
    error,
  };

  return <StravaContext.Provider value={value}>{children}</StravaContext.Provider>;
}

/**
 * Hook that provides access to the Strava client
 */
export function useStrava() {
  const context = useContext(StravaContext);
  if (context === undefined) {
    throw new Error('useStrava must be used within a StravaProvider');
  }
  return context;
}
