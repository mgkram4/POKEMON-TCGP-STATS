"use client"

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: { push: (params: object) => void }[];
  }
}


export default function TestAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({} as { push: (params: object) => void });
    } catch (err) {
      console.error('Ad Error:', err);
    }
  }, []);

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={`ca-pub-1233511905544381`}
        data-ad-slot="test-slot"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
} 