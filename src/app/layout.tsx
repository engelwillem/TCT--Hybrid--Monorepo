import type { Metadata, Viewport } from 'next';
import React from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ClientAppProviders } from '@/components/providers/ClientAppProviders';
import { getPrimarySiteUrl, isPrimaryProductionDeployment } from '@/lib/seo';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const APP_NAME = 'The Chosen Talks';
const TAGLINE = 'The Chosen People';
const DEFAULT_TITLE = `${APP_NAME} - ${TAGLINE}`;
const DEFAULT_DESCRIPTION = 'Start your day with living scripture, daily reflection, and meaningful faith community conversations.';
const SITE_URL = getPrimarySiteUrl();
const DEFAULT_OG_IMAGE = `${SITE_URL}/api/og/home`;

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const indexable = isPrimaryProductionDeployment();

  return {
    title: {
      default: DEFAULT_TITLE,
      template: `%s — ${APP_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: '/',
    },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        }
      : {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
            noarchive: true,
          },
        },
    openGraph: {
      type: 'website',
      siteName: APP_NAME,
      locale: 'en_US',
      url: SITE_URL,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: DEFAULT_TITLE,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
    other: {
      'app-name': APP_NAME,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'The Chosen Talks',
      'mobile-web-app-capable': 'yes',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased tct-body" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
          <ClientAppProviders>{children}</ClientAppProviders>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
