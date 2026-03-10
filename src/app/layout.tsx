import type { Metadata } from 'next';
import React from 'react';
import { DM_Serif_Display, Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/layouts/AppShell';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseAuthSync } from '@/components/FirebaseAuthSync';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'TheChoosenTalks',
  description: 'Bertumbuh Dalam Iman — Ruang harian Anda untuk inspirasi dan komunitas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${dmSerifDisplay.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <FirebaseClientProvider>
          <FirebaseAuthSync />
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
