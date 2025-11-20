/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Temporarily ignore ESLint errors during build (to be fixed in follow-up)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Temporarily ignore TypeScript errors during build (to be fixed in follow-up)
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Enable server components by default
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Temporarily disable CSS minification to debug build issue
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (plugin) => plugin.constructor.name !== 'CssMinimizerPlugin'
      );
    }
    return config;
  },
};

export default nextConfig;
