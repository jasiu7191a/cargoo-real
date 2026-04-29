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
