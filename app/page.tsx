import React from 'react';
import { Header } from '@/header';
import { Dashboard } from '@/dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Dashboard />
      </main>
    </div>
  );
}
