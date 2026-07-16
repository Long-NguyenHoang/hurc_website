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
    // Lưu ý: rewrites() được Next.js biên dịch và hardcode 1 lần duy nhất lúc "next build".
    // Do đó không thể dùng biến môi trường chạy thật như INTERNAL_API_URL ở đây được.
    // Nếu là môi trường 'development' (npm run dev), trỏ về localhost.
    // Nếu là môi trường 'production' (next build trong Docker), trỏ về http://api:3000.
    const isDev = process.env.NODE_ENV === 'development';
    const backendUrl = isDev 
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
      : 'http://api:3000';
    
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
