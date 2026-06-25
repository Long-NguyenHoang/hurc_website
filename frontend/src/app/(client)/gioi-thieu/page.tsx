import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Về HURC | HCMC Metro",
    description: "Giới thiệu chung về Công ty TNHH MTV Đường sắt Đô thị số 1 TP.HCM (HURC1)",
};

export default function AboutPage() {
    return (
        <div className="w-full bg-white pb-16 md:pb-24 max-w-[120rem] mx-auto px-8 lg:px-[112px] pt-4 md:pt-8">
            {/* KHUNG TỶ LỆ VÀNG ĐỒNG BỘ VỚI HEADER VÀ TRANG CHỦ */}

            {/* TIÊU ĐỀ TRANG */}
            <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-[#005596] mb-2 md:mb-6">
                Giới thiệu chung
            </h1>

            {/* ẢNH COVER LỚN (Bo góc mềm mại, trải dài tỉ lệ 21:9) */}
            <div className="w-full aspect-[16/7] md:aspect-[21/9] lg:aspect-[2.5/1] rounded-2xl overflow-hidden">
                <img
                    src="/anh-4.png"
                    alt="Toàn cảnh ga Metro TP.HCM"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* KHU VỰC NỘI DUNG VĂN BẢN (Sẽ đổ dữ liệu vào đây) */}
            <div className="w-full pt-8 space-y-10 md:space-y-8 text-slate-800">

                {/* PHẦN 1: THÀNH LẬP VÀ ĐI VÀO HOẠT ĐỘNG */}
                <section>
                    <h2 className="text-[20px] md:text-[24px] font-medium mb-2">
                        Thành lập và đi vào hoạt động
                    </h2>
                    <div className="text-[15px] md:text-[16px] leading-relaxed text-justify">
                        <p>
                            Công ty TNHH MTV Đường sắt Đô thị số 1 TP.HCM (HURC1) được Ủy ban nhân dân Thành phố thành lập vào năm 2015 với nhiệm vụ tiếp nhận, quản lý, vận hành và khai thác các tuyến đường sắt đô thị của TP.HCM. Sự ra đời của HURC1 là một phần quan trọng trong chiến lược phát triển giao thông công cộng hiện đại của thành phố, nhằm giảm ùn tắc giao thông và cải thiện môi trường sống. Giai đoạn 2015 – 2019, Công ty đã có quyết định thành lập nhưng chưa đi vào hoạt động chính thức, giai đoạn này các Chuyên gia thuộc Cơ Quan hợp tác Quốc tế Nhật Bản hỗ trợ kỹ thuật nhằm tăng cường năng lực quản lý cho các nhân sự chủ chốt Công ty vận hành, tuyến đường sắt đô thị số 1, Bến Thành – Suối Tiên. Ngày 22 tháng 4 năm 2019, Ủy ban nhân dân Thành phố đã điều động và bổ nhiệm đồng chí Lê Minh Triết (Giám đốc Trung tâm Quản lý Điều hành giao thông thành phố) giữ chức vụ Giám đốc Công ty TNHH MTV Đường sắt Đô thị số 1. Tháng 8 năm 2019, Công ty đã thành lập 04 phòng gồm phòng Hành chính – Tổ chức, Kế hoạch, Kỹ thuật và Tài chính - Kế toán. Đến nay 2026, Tổ chức bộ máy Công ty gồm 05 phòng và 02 Xí nghiệp (Phòng Hành chính – Tổ chức, Kế hoạch – Tài chính, Kỹ thuật – An toàn, Kinh doanh – Quan hệ Công chúng, Vật tư - Thiết bị - Dịch vụ, Xí nghiệp Vận hành và Xí nghiệp Bảo dưỡng).
                        </p>
                    </div>
                </section>

                {/* PHẦN 2: MỤC TIÊU, CHỨC NĂNG VÀ NHIỆM VỤ */}
                <section>
                    <h2 className="text-[20px] md:text-[24px] font-medium mb-2">
                        Mục tiêu và chức năng và nhiệm vụ
                    </h2>
                    <div className="text-[15px] md:text-[16px] leading-relaxed text-justify">
                        <p>
                            Công ty tổ chức khai thác, vận hành hệ thống giao thông vận tải đường sắt đô thị do Ủy ban nhân dân Thành phố giao nhiệm vụ nhằm phát triển giao thông vận tải công cộng thông suốt, an toàn, nhanh chóng, thuận tiện, giảm ùn tắc giao thông; góp phần hiện đại hóa hệ thống giao thông công cộng kết nối giao thông với mục tiêu phát triển đô thị hiện đại và phát triển kinh tế xã hội của thành phố; góp phần xây dựng và phát triển thành phố bền vững, trung tâm kinh tế chính trị xã hội của cả nước. Tổ chức hoạt động sản xuất kinh doanh vận tải hành khách đường sắt đô thị, các phương thức vận tải hành khách công cộng kết nối với hệ thống đường sắt đô thị, kinh doanh kết cấu hạ tầng đường sắt và các hoạt động kinh doanh theo ngành nghề được phê duyệt; tổ chức cứu hộ, cứu nạn, đảm bảo an ninh, trật tự, an toàn giao thông vận tải đường sắt theo quy định. Chuẩn bị các điều kiện cần thiết cho việc tiếp nhận, triển khai, quản lý, vận hành và bảo dưỡng đường sắt đô thị khi dự án hoàn thành và chuyển giao; Quản lý vận hành khai thác đường sắt đô thị, các phương thức vận tải kết nối với hệ thống đường sắt đô thị.
                        </p>
                    </div>
                </section>

            </div>
            {/* PHẦN 3: VĂN HOÁ METRO */}
            <div className="mt-2 md:mt-6">

                <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-[#005596] mb-2 md:mb-4">
                    Văn hoá Metro
                </h1>

                {/* Bố cục 2 cột: Ảnh bên trái (5 phần), Chữ bên phải (7 phần) */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

                    <section className="w-full lg:w-5/12">
                        <div>
                            <img
                                src="/anh-5.png"
                                alt="Văn hoá Metro"
                            />
                        </div>
                    </section>

                    {/* CỘT PHẢI: NỘI DUNG VĂN BẢN */}
                    <section className="w-full lg:w-7/12 text-[14px] md:text-[16px] text-slate-800 leading-relaxed space-y-2">

                        <p className="font-bold text-[#005596] text-[16px] md:text-[18px]">
                            HURC1 – "Chung bước hành trình, đô thị văn minh"
                        </p>

                        <p className="text-justify">
                            Là doanh nghiệp hoạt động đa dạng các lĩnh vực về đường sắt với đội ngũ nhân sự có chuyên môn và kinh nghiệm cũng như sự tận tâm, khả năng sáng tạo và nỗ lực không ngừng, tập thể công ty HURC1 tin rằng chúng tôi sẽ trao đến Quý khách hàng nhiều sản phẩm và dịch vụ tiện ích phù hợp.
                        </p>

                        <p>
                            <strong className="text-[#005596]">Khẩu hiệu:</strong> "Chung bước hành trình, đô thị văn minh - Xuất phát với nụ cười, trải nghiệm với yêu thương"
                        </p>

                        <p>
                            <strong className="text-[#005596]">Tầm nhìn:</strong> Chung sức xây dựng thành phố xanh, văn minh, hiện đại và phát triển bền vững
                        </p>

                        <p className="text-justify">
                            <strong className="text-[#005596]">Sứ mệnh:</strong> Chúng tôi cam kết cung cấp cho bạn những trải nghiệm di chuyển tốt nhất có thể nhằm tạo ra sự kết nối và phục vụ chất lượng, đồng thời góp phần vào sự phát triển bền vững của thành phố.
                        </p>

                        <p>
                            <strong className="text-[#005596]">Phương châm hoạt động:</strong> "Tin cậy trong vận hành, Tận tâm trong công việc"
                        </p>

                        <div className="pt-2">
                            <strong className="text-[#005596] text-[16px]">Giá trị cốt lõi:</strong>
                            {/* Danh sách các giá trị cốt lõi */}
                            <ul className="mt-3 space-y-2">
                                <li className="flex gap-2">
                                    <span className="text-[#005596] mt-0.5">•</span>
                                    <span><strong>Khách hàng là trọng tâm:</strong> Luôn ưu tiên nhu cầu và lợi ích của khách hàng trong mọi hoạt động.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#005596] mt-0.5">•</span>
                                    <span><strong>Đổi mới và sáng tạo:</strong> Không ngừng cải tiến, tìm kiếm giải pháp mới và phát triển sản phẩm, dịch vụ từng ngày.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#005596] mt-0.5">•</span>
                                    <span><strong>Chất lượng và cam kết:</strong> Đảm bảo sản phẩm, dịch vụ đáp ứng nhu cầu của khách hàng.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#005596] mt-0.5">•</span>
                                    <span><strong>Chính trực và minh bạch:</strong> Hoạt động với sự trung thực, minh bạch và tuân thủ đạo đức kinh doanh.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#005596] mt-0.5">•</span>
                                    <span><strong>Hợp tác và tôn trọng:</strong> Xây dựng môi trường làm việc tích cực, khuyến khích sự hợp tác và tôn trọng lẫn nhau.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#005596] mt-0.5">•</span>
                                    <span><strong>Phát triển bền vững:</strong> Cam kết bảo vệ môi trường, đóng góp cho cộng đồng và hoạt động kinh doanh lâu dài.</span>
                                </li>
                            </ul>
                        </div>

                    </section>
                </div>
            </div>
            {/* PHẦN 4: SƠ ĐỒ TỔ CHỨC */}
            <div className="mt-4 md:mt-10">

                <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-[#005596] mb-2 md:mb-4">
                    Sơ đồ tổ chức
                </h1>

                {/* Khung chứa ảnh sơ đồ */}
                <section className="w-full rounded-2xl overflow-hidden">
                    <img
                        src="/anh-4.png"
                        alt="Sơ đồ tổ chức HURC1"
                        // w-full và h-auto đảm bảo dù sơ đồ dọc hay ngang đều hiển thị đầy đủ 100% không bị méo
                        className="w-full h-auto object-contain"
                    />
                </section>


            </div>
        </div >
    );
}