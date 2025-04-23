"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useAthleteProfile } from '@/strava-hooks';

/**
 * Header component for the dashboard
 * Shows user profile and sign out button
 */
export function Header() {
  const { data: session } = useSession();
  const { data: athlete, isLoading } = useAthleteProfile();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Strava Running Dashboard</h1>
          </div>
          <div className="flex items-center">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : athlete ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {athlete?.profile && (
                    <img
                      src={athlete.profile}
                      alt={`${athlete?.firstname ?? ''} ${athlete?.lastname ?? ''}`}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {athlete?.firstname ?? ''} {athlete?.lastname ?? ''}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                {session?.user?.name || 'Authenticated User'}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
