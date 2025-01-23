"use client"

import Script from 'next/script';

const PUBLISHER_ID = 'pub-1233511905544381';

export default function GoogleAdScript() {
  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUBLISHER_ID}`}
      onError={(e) => {
        console.error('Error loading AdSense script:', e);
      }}
    />
  );
} 