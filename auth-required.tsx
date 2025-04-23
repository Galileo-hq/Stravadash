"use client";

import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useStrava } from '@/strava-context';

/**
 * Authentication wrapper component that ensures the user is authenticated
 * before rendering the children. If not authenticated, it shows a sign-in button.
 */
export function AuthRequired({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { client, isLoading: clientLoading } = useStrava();

  // Show loading state while checking authentication
  if (status === 'loading' || clientLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show sign-in button
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-6">Strava Running Dashboard</h1>
          <p className="mb-6">Please connect your Strava account to view your running data.</p>
          <button
            onClick={() => signIn('strava')}
            className="px-6 py-3 bg-[#FC4C02] text-white font-semibold rounded-md hover:bg-[#E34402] transition-colors"
          >
            Connect with Strava
          </button>
        </div>
      </div>
    );
  }

  // If authenticated but no Strava client, something went wrong
  if (!client) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-6">Connection Error</h1>
          <p className="mb-6">There was a problem connecting to Strava. Please try again.</p>
          <button
            onClick={() => signIn('strava')}
            className="px-6 py-3 bg-[#FC4C02] text-white font-semibold rounded-md hover:bg-[#E34402] transition-colors"
          >
            Reconnect with Strava
          </button>
        </div>
      </div>
    );
  }

  // If authenticated and client is ready, render children
  return <>{children}</>;
}
