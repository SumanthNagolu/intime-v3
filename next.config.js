/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Temporarily ignore ESLint errors during build (to be fixed in follow-up)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Temporarily ignore TypeScript errors during build (to be fixed in follow-up)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Exclude problematic packages from server bundling
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/realtime-js', '@supabase/ssr'],

  experimental: {
    // Enable server components by default
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    // Optimize package imports
    optimizePackageImports: ['react-icons', 'date-fns'],
  },

  webpack: (config, { dev, isServer }) => {
    // Suppress warnings from OpenTelemetry and require-in-the-middle
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      ...(config.ignoreWarnings || [])
    ];

    // Suppress webpack serialization warnings
    config.infrastructureLogging = {
      level: 'error',
    };

    return config;
  },
};

export default nextConfig;
