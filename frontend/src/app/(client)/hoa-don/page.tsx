"use client";

import { InvoiceDetail, invoiceService } from "@/services/invoice.service";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

export default function InvoiceLookupPage() {
    const [invoiceCode, setInvoiceCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [invoiceData, setInvoiceData] = useState<InvoiceDetail | null>(null);
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoiceCode.trim()) {
            setError("Vui lòng nhập mã hoá đơn");
            return;
        }
        setIsLoading(true);
        setError("");
        setInvoiceData(null);

        try {
            const response = await invoiceService.lookup(invoiceCode.trim());
            const rawData = (response as any).eInvoice;

            if (!rawData) {
                throw new Error("Dữ liệu trả về không hợp lệ");
            }

            const mappedData: InvoiceDetail = {
                so_hoa_don: rawData.id,
                ngay_tao: formatDate(rawData.date_created),
                ga_di: rawData.start_station,
                ga_den: rawData.end_station,
                loai_khach: rawData.bname,
                loai_ve: rawData.ticket_type_name,
                don_gia: Number(rawData.item_price) || 0,
                so_luong: Number(rawData.item_quantity) || 0,
                tong_tien: Number(rawData.item_amount) || 0,
                link_xem_hoa_don: rawData.link,
            };
            setInvoiceData(mappedData);
        } catch (error) {
            console.error("Lỗi tra cứu: ", error);
            setError("Không tìm thấy thông tin hoá đơn hoặc có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);

        // Lấy các thành phần và thêm số 0 ở đầu nếu cần (ví dụ: 9 -> 09)
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng trong JS bắt đầu từ 0
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <div className="w-full bg-white min-h-[80vh] py-12 md:py-20">
            <div className="max-w-[80rem] mx-auto px-4 lg:px-[56px]">

                {/* BỐ CỤC 2 CỘT: Trái chứa Form & Kết quả, Phải chứa Ảnh minh họa */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">

                    {/* CỘT TRÁI (Chiếm 7 phần) */}
                    <div className="lg:col-span-7 flex flex-col pt-4">

                        <h1 className="text-[32px] md:text-[40px] font-bold text-[#005596] mb-8 tracking-tight">
                            Tra cứu hoá đơn
                        </h1>

                        {/* FORM TÌM KIẾM */}
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10 w-full max-w-2xl">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    value={invoiceCode}
                                    onChange={(e) => {
                                        setInvoiceCode(e.target.value);
                                        if (error) setError("");
                                    }}
                                    placeholder="Mã hoá đơn..."
                                    className={`w-full px-5 py-3 rounded-full border ${error ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-[#005596] focus:ring-[#005596]"
                                        } focus:ring-1 outline-none transition-all text-[15px]`}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-[#005596] hover:bg-[#00447a] text-white font-medium rounded-full transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tra cứu"}
                            </button>
                        </form>

                        {/* HIỂN THỊ LỖI (NẾU CÓ) */}
                        {error && <p className="text-red-500 text-[14px] mb-6 -mt-6 ml-2">{error}</p>}

                        {/* KHU VỰC KẾT QUẢ (Chỉ hiện khi có invoiceData) */}
                        {invoiceData && (
                            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-[18px] font-medium text-[#005596] mb-6">
                                    Thông tin hoá đơn
                                </h3>

                                {/* Lưới thông tin chi tiết */}
                                <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-6">

                                    {/* Hàng 1 */}
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[13px] text-slate-400 font-medium">Số hoá đơn</span>
                                        <span className="text-[15px] text-slate-800 font-medium break-all">{invoiceData.so_hoa_don}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[13px] text-slate-400 font-medium">Ngày tạo</span>
                                        <span className="text-[15px] text-slate-800 font-medium">{invoiceData.ngay_tao}</span>
                                    </div>

                                    {/* Hàng 2 */}
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[13px] text-slate-400 font-medium">Ga đi</span>
                                        <span className="text-[15px] text-slate-800 font-medium">{invoiceData.ga_di}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[13px] text-slate-400 font-medium">Ga đến</span>
                                        <span className="text-[15px] text-slate-800 font-medium">{invoiceData.ga_den}</span>
                                    </div>

                                    {/* Hàng 3 */}
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[13px] text-slate-400 font-medium">Loại khách</span>
                                        <span className="text-[15px] text-slate-800 font-medium">{invoiceData.loai_khach}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[13px] text-slate-400 font-medium">Loại vé</span>
                                        <span className="text-[15px] text-slate-800 font-medium">{invoiceData.loai_ve}</span>
                                    </div>

                                    {/* Hàng 4 */}
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[13px] text-slate-400 font-medium">Đơn giá</span>
                                        <span className="text-[15px] text-slate-800 font-medium">{formatCurrency(invoiceData.don_gia)}</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[13px] text-slate-400 font-medium">Số lượng</span>
                                        <span className="text-[15px] text-slate-800 font-medium">{invoiceData.so_luong}</span>
                                    </div>
                                </div>

                                {/* Đường kẻ ngang */}
                                <div className="w-full h-px bg-slate-200 my-6"></div>

                                {/* Tổng tiền & Link */}
                                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                                    <div className="flex flex-col gap-1.5 justify-center">
                                        <span className="text-[14px] text-slate-500 font-medium">Tổng tiền</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 justify-center">
                                        <span className="text-[16px] text-[#005596] font-bold">{formatCurrency(invoiceData.tong_tien)}</span>
                                    </div>

                                    <div className="flex flex-col gap-1.5 justify-center">
                                        <span className="text-[14px] text-slate-500 font-medium">Thông tin chi tiết</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5 justify-center">
                                        <a
                                            href={invoiceData.link_xem_hoa_don}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[15px] text-[#005596] font-medium hover:underline flex items-center gap-1 w-fit"
                                        >
                                            Xem hoá đơn
                                        </a>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: ẢNH MINH HỌA (Chiếm 5 phần, ẩn trên mobile) */}
                    <div className="hidden lg:flex lg:col-span-5 justify-center items-start pt-10">
                        <div className="w-full max-w-md">
                            <img
                                src="/tra-cuu-hoa-don.svg"
                                alt="Tra cứu hóa đơn minh họa"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}