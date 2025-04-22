"use client";

import React from 'react';

/**
 * Test utility component for verifying Strava API connection
 * This component displays the authentication status and API connection test results
 */
export function ApiConnectionTest() {
  const [testStatus, setTestStatus] = React.useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [apiResponse, setApiResponse] = React.useState<any>(null);

  const testApiConnection = async () => {
    setTestStatus('testing');
    setErrorMessage(null);
    setApiResponse(null);

    try {
      // Test the athlete endpoint
      const response = await fetch('/api/strava/athlete');
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      setApiResponse(data);
      setTestStatus('success');
    } catch (error) {
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Strava API Connection Test</h2>
      
      <div className="mb-6">
        <button
          onClick={testApiConnection}
          disabled={testStatus === 'testing'}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {testStatus === 'testing' ? 'Testing...' : 'Test API Connection'}
        </button>
      </div>

      {testStatus === 'testing' && (
        <div className="flex items-center text-blue-600">
          <div className="mr-2 h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          Testing API connection...
        </div>
      )}

      {testStatus === 'success' && (
        <div className="mt-4">
          <div className="text-green-600 font-medium mb-2">✓ API connection successful!</div>
          <div className="bg-gray-50 p-4 rounded overflow-auto max-h-60">
            <pre className="text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        </div>
      )}

      {testStatus === 'error' && (
        <div className="mt-4">
          <div className="text-red-600 font-medium mb-2">✗ API connection failed</div>
          <div className="bg-red-50 p-4 rounded text-red-800">
            {errorMessage || 'An unknown error occurred'}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Possible issues:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Environment variables not set correctly</li>
              <li>Strava API credentials are invalid</li>
              <li>Authentication flow not completed</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
