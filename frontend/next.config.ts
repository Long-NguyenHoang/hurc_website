import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allowedDevOrigins: ['192.168.0.55'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '192.168.1.217',
        port: '',
        pathname: '/uploads/**'
      },
    ],
  },
};

export default nextConfig;
