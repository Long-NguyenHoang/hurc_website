import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quá trình hình thành | HCMC Metro",
    description: "Lịch sử và quá trình hình thành của Công ty TNHH MTV Đường sắt Đô thị số 1 TP.HCM (HURC1)",
};

export default function HistoryPage() {
    return (
        // 1. Dùng flex và items-center kết hợp min-h-[75vh] để ép toàn bộ nội dung vào chính giữa chiều dọc màn hình
        <div className="w-full bg-white min-h-[50vh] flex items-center py-12">

            {/* Khung tỷ lệ vàng w-full để chiếm trọn không gian flex */}
            <div className="max-w-[120rem] w-full mx-auto px-8 lg:px-[56px]">

                {/* 2. Dùng mx-auto ở đây để đẩy cả khối văn bản (rộng tối đa 5xl) ra chính giữa chiều ngang */}
                <div className="w-full lg:max-w-5xl mx-auto text-slate-800">

                    {/* TIÊU ĐỀ TRANG */}
                    {/* Tôi thêm text-center ở mobile và text-left ở desktop để nhìn thuận mắt hơn */}
                    <h1 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold text-[#005596] mb-2 md:mb-4 tracking-tight text-center md:text-left">
                        Quá trình hình thành
                    </h1>

                    <section>
                        {/* TIÊU ĐỀ PHỤ */}
                        <h2 className="text-[18px] md:text-[20px] font-bold text-[#005596] mb-2 text-center md:text-left tracking-tight">
                            Thành lập và đi vào hoạt động
                        </h2>

                        {/* NỘI DUNG CHÍNH (Vẫn giữ text-justify để hai lề chữ thẳng tắp) */}
                        <div className="text-[14px] md:text-[16px] leading-relaxed text-justify">
                            <p>
                                Công ty TNHH MTV Đường sắt Đô thị số 1 TP.HCM (HURC1) được Ủy ban nhân dân Thành phố thành lập vào năm 2015 với nhiệm vụ tiếp nhận, quản lý, vận hành và khai thác các tuyến đường sắt đô thị của TP.HCM. Sự ra đời của HURC1 là một phần quan trọng trong chiến lược phát triển giao thông công cộng hiện đại của thành phố, nhằm giảm ùn tắc giao thông và cải thiện môi trường sống. Giai đoạn 2015 – 2019, Công ty đã có quyết định thành lập nhưng chưa đi vào hoạt động chính thức, giai đoạn này các Chuyên gia thuộc Cơ Quan hợp tác Quốc tế Nhật Bản hỗ trợ kỹ thuật nhằm tăng cường năng lực quản lý cho các nhân sự chủ chốt Công ty vận hành, tuyến đường sắt đô thị số 1, Bến Thành – Suối Tiên. Ngày 22 tháng 4 năm 2019, Ủy ban nhân dân Thành phố đã điều động và bổ nhiệm đồng chí Lê Minh Triết (Giám đốc Trung tâm Quản lý Điều hành giao thông thành phố) giữ chức vụ Giám đốc Công ty TNHH MTV Đường sắt Đô thị số 1. Tháng 8 năm 2019, Công ty đã thành lập 04 phòng gồm phòng Hành chính – Tổ chức, Kế hoạch, Kỹ thuật và Tài chính - Kế toán. Đến nay 2026, Tổ chức bộ máy Công ty gồm 05 phòng và 02 Xí nghiệp (Phòng Hành chính – Tổ chức, Kế hoạch – Tài chính, Kỹ thuật – An toàn, Kinh doanh – Quan hệ Công chúng, Vật tư - Thiết bị - Dịch vụ, Xí nghiệp Vận hành và Xí nghiệp Bảo dưỡng).
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}