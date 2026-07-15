import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allowedDevOrigins: ['192.168.0.55'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '192.168.1.217',
        port: '3000',
        pathname: '/uploads/**'
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        // Hardcode proxy về mạng nội bộ Docker để không bị phụ thuộc vào biến môi trường lúc Build
        destination: `http://api:3000/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
