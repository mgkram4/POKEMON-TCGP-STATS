import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import GoogleAdScript from './components/GoogleAdScript';
import Navigation from './components/navigation';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TCGP Pocket - Pokemon TCG Meta Stats",
  description: "Mobile-friendly Pokemon Trading Card Game meta statistics and analysis. Track deck performance, matchups, and tier rankings for TCGP competitive play on the go.",
  keywords: "TCG Pocket, Pokemon TCGP, meta stats, mobile stats, deck analysis, competitive pokemon, TCGP meta",
  icons: {
    icon: [
      {
        url: '/header.jpg',
        sizes: '32x32',
        type: 'image/jpg',
      },
      {
        url: '/header.jpg',
        sizes: '16x16',
        type: 'image/jpg',
      }
    ],
    shortcut: '/header.jpg',
    apple: '/header.jpg',
  },
  openGraph: {
    title: "TCGP Pocket - Pokemon TCGP Meta Stats",
    description: "Mobile-friendly Pokemon Trading Card Game meta statistics and analysis for competitive TCGP play.",
    type: "website",
    locale: "en_US",
    siteName: "TCGP Pocket",
    url: "https://www.tcgpocketmeta.com",
    images: [{
      url: 'https://www.tcgpocketmeta.com/header.jpg',
      width: 1200,
      height: 630,
      alt: 'TCGP Pocket Header'
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "TCGP Pocket - Pokemon TCG Meta Stats",
    description: "Mobile-friendly Pokemon Trading Card Game meta statistics and analysis for competitive TCGP play.",
    images: {
      url: 'https://www.tcgpocketmeta.com/header.jpg',
      alt: 'TCGP Pocket - Pokemon TCG Meta Stats'
    }
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#4F46E5",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TCGP Pocket",
  },
  other: {
    "google-adsense-account": "ca-pub-1233511905544381"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAdScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
