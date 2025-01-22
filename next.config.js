/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/**',
      },
      {
        protocol: 'https',
        hostname: 'pagead2.googlesyndication.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'googleads.g.doubleclick.net',
        pathname: '/**',
      },
    ],
  },
  // Add Content Security Policy for Google Ads
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.googletagservices.com https://googleads.g.doubleclick.net;",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 