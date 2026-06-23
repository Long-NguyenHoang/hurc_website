import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-[#005596] text-white py-8 mt-auto">
            {/* BỘ KHUNG CHUẨN ĐỒNG BỘ VỚI HEADER: max-w 120rem và padding 56px */}
            <div className="max-w-[120rem] mx-auto px-4 lg:px-[56px]">

                {/* Flexbox bọc toàn bộ nội dung, dàn đều 2 bên, canh giữa theo chiều dọc */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

                    {/* BÊN TRÁI: Nhóm Logo và Text Thông tin */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">

                        {/* Khối Logo nền trắng bo góc giống hình ảnh */}
                        <div className="bg-white px-6 py-4 rounded-xl shrink-0 flex items-center justify-center h-[100px] w-[180px]">
                            <img
                                src="/logo.png"
                                alt="HCMC Metro"
                                className="max-h-full max-w-full object-contain block"
                            />
                        </div>

                        {/* Khối Text thông tin */}
                        <div className="space-y-2 text-[15px] lg:text-[15px]">
                            <p className="font-medium">Công ty TNHH MTV Đường sắt Đô thị số 1</p>
                            <p>Mã số thuế: 0315818455</p>
                            <p>Giám đốc: Lê Minh Triết</p>
                            <p>Điện thoại: 1900 638 885</p>
                            <p>Địa chỉ thư điện tử (Email): hurc1@tphcm.gov.vn</p>
                            <p>Địa chỉ: Toà nhà OCC, số 55 Đường 11, Khu phố Giản Dân, Phường Long Bình, Thành phố Hồ Chí Minh</p>
                        </div>
                    </div>

                    {/* BÊN PHẢI: Icon Facebook đã thay bằng thẻ img */}
                    <div className="shrink-0 pt-4 pl-8 lg:pr-10">
                        <Link
                            href="https://www.facebook.com/HURC1HCMC"
                            target="_blank"
                            className="inline-block hover:opacity-80 transition-opacity"
                        >
                            <img
                                src="/facebook.png"
                                alt="Facebook HCMC Metro"
                                className="w-8 h-8 object-contain block"
                            />
                        </Link>
                    </div>

                </div>
            </div>
        </footer>
    );
}