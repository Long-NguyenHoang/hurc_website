import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chi tiết tuyển dụng | HCMC Metro",
    description: "Thông tin chi tiết vị trí tuyển dụng tại Công ty TNHH MTV Đường sắt Đô thị số 1 TP.HCM (HURC1)",
};

export default function JobDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}