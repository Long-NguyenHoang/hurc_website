import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allowedDevOrigins: ['192.168.0.55'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.217',
        port: '3000',
        pathname: '/uploads/**'
      },
      {
        protocol: 'https',
        hostname: '**.onrender.com',
        pathname: '/uploads/**'
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        pathname: '/uploads/**'
      }
    ],
  },
};

export default nextConfig;
