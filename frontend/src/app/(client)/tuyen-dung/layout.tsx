import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tuyển dụng | HCMC Metro",
    description: "Cơ hội nghề nghiệp và các vị trí đang tuyển dụng tại Công ty TNHH MTV Đường sắt Đô thị số 1 TP.HCM (HURC1).",
};

export default function JobsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}