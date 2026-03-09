/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Output configuration
  output: "standalone",
  // Image optimization
  images: {
  },
};

module.exports = nextConfig;