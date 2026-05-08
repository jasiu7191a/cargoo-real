/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => 'build-final-v2',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/sitemap' },
      { source: '/sitemap_index.xml', destination: '/sitemap' },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests" },
        ],
      },
      // CORS for /api/* — needed because the static customer dashboard at
      // www.cargooimport.eu is on a different Cloudflare Pages project from
      // the Next.js API and calls admin.cargooimport.eu/api/* with
      // credentials. Static config rather than middleware because
      // middleware-set response headers don't reliably propagate on
      // OpenNext/Cloudflare. We hardcode www as the allowed origin since
      // it's the only cross-origin caller; same-origin requests from
      // admin.cargooimport.eu skip the CORS check entirely.
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://www.cargooimport.eu' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-csrf-token, Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' },
          { key: 'Vary', value: 'Origin' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
