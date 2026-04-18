/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => 'build-final-v2',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
