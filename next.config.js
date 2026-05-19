/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Reduces parse/eval time for large icon/UI packages by tree-shaking
    // at the import level instead of bundling the entire barrel file.
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'framer-motion'],
  },
};

export default nextConfig;
