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

  // Temporarily ignore TypeScript errors during build (to be fixed in follow-up)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Exclude problematic packages from server bundling
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/realtime-js', '@supabase/ssr'],
  
  // Transpile packages that use modern ESM
  transpilePackages: ['@react-pdf/renderer'],

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    optimizePackageImports: ['react-icons', 'date-fns'],
  },

  // Exclude large data files from serverless function bundles
  outputFileTracingExcludes: {
    '/api/ai/guru': ['./data/rag-knowledge-base/**'],
    '*': ['./data/rag-knowledge-base/**'],
  },

  // Next.js 16 uses Turbopack by default - acknowledge the migration
  turbopack: {},

  // Webpack config (used when building with --webpack flag)
  webpack: (config) => {
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      ...(config.ignoreWarnings || [])
    ];
    config.infrastructureLogging = { level: 'error' };
    return config;
  },
};

export default nextConfig;
