import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-[#005596] text-white py-8 mt-auto">
            {/* BỘ KHUNG CHUẨN ĐỒNG BỘ VỚI HEADER: max-w 120rem và padding 56px */}
            <div className="max-w-[120rem] mx-auto px-4 lg:px-[56px]">

                {/* Flexbox bọc toàn bộ nội dung, dàn đều 2 bên, canh giữa theo chiều dọc */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 px-4">

                    {/* BÊN TRÁI: Nhóm Logo và Text Thông tin */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">

                        {/* Khối Logo nền trắng bo góc giống hình ảnh */}
                        <div className="bg-white px-6 py-2 rounded-xl shrink-0 flex items-center justify-center h-[120px] w-[230px]">
                            <img
                                src="/logo.png"
                                alt="HCMC Metro"
                                className="max-h-full max-w-full object-contain block"
                            />
                        </div>

                        {/* Khối Text thông tin */}
                        <div className="space-y-1 text-[14px] lg:text-[15px]">
                            <p className="font-medium">Công ty TNHH MTV Đường sắt Đô thị số 1</p>
                            <p>Mã số thuế: 0315818455</p>
                            <p>Giám đốc: Lê Minh Triết</p>
                            <p>Điện thoại: <a href="tel:1900 638 885">1900 638 885</a></p>
                            <p>Địa chỉ thư điện tử (Email): <a href="mailto:hurc1@tphcm.gov.vn">hurc1@tphcm.gov.vn</a></p>
                            <p>Địa chỉ: Toà nhà OCC, số 55 Đường 11, Khu phố Giản Dân, Phường Long Bình, Thành phố Hồ Chí Minh</p>
                        </div>
                    </div>

                    {/* BÊN PHẢI: Icon Facebook đã thay bằng thẻ img */}
                    <div className="shrink-0 lg:pr-10 flex items-center gap-4 md:gap-5">
                        <Link
                            href="https://www.facebook.com/HURC1HCMC"
                            target="_blank"
                            className="inline-block hover:opacity-80 hover:-translate-y-1 transition-all"
                        >
                            <img
                                src="/facebook.png"
                                alt="Facebook HCMC Metro"
                                className="w-8 h-8 md:w-9 md:h-9 object-contain block"
                            />
                        </Link>
                        <Link
                            href="https://www.tiktok.com/@metrohurc1"
                            target="_blank"
                            className="inline-block hover:opacity-80 hover:-translate-y-1 transition-all"
                        >
                            <img
                                src="/tiktok.png"
                                alt="TikTok HCMC Metro"
                                className="w-8 h-8 md:w-9 md:h-9 object-contain block"
                            />
                        </Link>
                        <Link
                            href="https://www.instagram.com/hcmcmetroline1/"
                            target="_blank"
                            className="inline-block hover:opacity-80 hover:-translate-y-1 transition-all"
                        >
                            <img
                                src="/instagram.png"
                                alt="Instagram HCMC Metro"
                                className="w-8 h-8 md:w-9 md:h-9 object-contain block"
                            />
                        </Link>
                        <Link
                            href="https://www.youtube.com/@hurcoffical"
                            target="_blank"
                            className="inline-block hover:opacity-80 hover:-translate-y-1 transition-all"
                        >
                            <img
                                src="/youtube.png"
                                alt="Youtube HCMC Metro"
                                className="w-8 h-8 md:w-9 md:h-9 object-contain block"
                            />
                        </Link>
                    </div>

                </div>
            </div>
        </footer>
    );
}