import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ConstructionBanner from './components/ConstructionBanner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyWhole Logistics - Intelligent Dispatch for Modern Trucking",
  description: "Professional 24/7 dispatching services for owner-operators and small fleets. Top-tier rate negotiation, strategic load planning, and seamless communication. Partner with SkyWhole Logistics to maximize your profitability.",
  keywords: "trucking dispatch, logistics dispatch, freight dispatch, owner operator dispatch, small fleet dispatch, trucking services, load planning, rate negotiation, 24/7 dispatch",
  authors: [{ name: "SkyWhole Logistics" }],
  openGraph: {
    title: "SkyWhole Logistics - Intelligent Dispatch for Modern Trucking",
    description: "Professional 24/7 dispatching services for owner-operators and small fleets. Top-tier rate negotiation, strategic load planning, and seamless communication.",
    type: "website",
    locale: "en_US",
    siteName: "SkyWhole Logistics",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'SkyWhole Logistics Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyWhole Logistics - Intelligent Dispatch for Modern Trucking",
    description: "Professional 24/7 dispatching services for owner-operators and small fleets.",
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  alternates: {
    canonical: 'https://skywholelogistics.us',
  },
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
      { url: '/logo.png', sizes: 'any' },
    ],
    shortcut: '/logo.png',
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  metadataBase: new URL('https://skywholelogistics.us'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="sticky top-0 left-0 w-full z-50">
            <ConstructionBanner />
            <Navigation />
          </div>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
