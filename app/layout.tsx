import React from 'react';
import { Providers } from '@/providers';
import { AuthRequired } from '@/auth-required';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Strava Running Dashboard',
  description: 'Visualize your running data from Strava',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthRequired>
            {children}
          </AuthRequired>
        </Providers>
      </body>
    </html>
  );
}
