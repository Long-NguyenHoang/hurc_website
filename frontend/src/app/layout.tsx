import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ['vietnamese'] });

export const metadata: Metadata = {
  title: "HURC - Metro CMS",
  description: "Hệ thống quản trị Đường sắt Đô thị",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body suppressHydrationWarning className={inter.className}>{children}</body>
    </html>
  );
}
