import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chi tiết tin tức | HCMC Metro",
    description: "Thông tin chi tiết tin tức Công ty TNHH MTV Đường sắt Đô thị số 1 TP.HCM (HURC1)",
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Đơn giản là render lại cái page.tsx (children) của bạn
    return <>{children}</>;
}