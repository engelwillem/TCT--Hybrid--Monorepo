import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { AppShell } from '@/layouts/AppShell';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseAuthSync } from '@/components/FirebaseAuthSync';

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
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
<<<<<<< HEAD
      <body className="antialiased">
        <FirebaseClientProvider>
          <FirebaseAuthSync />
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </FirebaseClientProvider>
=======
      <body className="antialiased" suppressHydrationWarning>
        <AppShell>
          {children}
        </AppShell>
        <Toaster />
>>>>>>> a6cbc4e10ace31329aef5508cde4000f2fd9f7cb
      </body>
    </html>
  );
}
