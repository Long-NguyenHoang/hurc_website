"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { contactService, Subject } from "@/services/contact.service";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        subject: "FEEDBACK" as Subject,
        message: "",
        website_url: "", // HONEYPOT FIELD
    });

    // State chứa các câu thông báo lỗi
    const [errors, setErrors] = useState<{
        full_name?: string;
        email?: string;
        phone?: string;
        message?: string;
    }>({});

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // --- XỬ LÝ KHI NHẬP LIỆU ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Tự động xóa lỗi khi người dùng bắt đầu gõ lại
        if (errors[e.target.name as keyof typeof errors]) {
            setErrors({ ...errors, [e.target.name]: undefined });
        }
    };

    // --- CUSTOM VALIDATE VÀ GỬI FORM ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn trình duyệt tự tải lại trang

        // 1. Kiểm tra lỗi (Validation)
        const newErrors: typeof errors = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = "Vui lòng nhập họ và tên của bạn.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập Email";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email = "Vui lòng nhập đúng định dạng email (ví dụ: abc@gmail.com)";
            }
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Vui lòng nhập Số điện thoại";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Vui lòng nhập nội dung cần liên hệ";
        }

        // Nếu có bất kỳ lỗi nào thì hiển thị ra và DỪNG LẠI, không gọi API
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 2. Nếu không có lỗi, tiến hành gọi API
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            await contactService.create(formData);
            setSubmitStatus('success');
            // Reset form sau khi gửi thành công
            setFormData({
                full_name: "",
                email: "",
                phone: "",
                subject: "FEEDBACK",
                message: "",
                website_url: "",
            });
            setErrors({});
        } catch (error) {
            console.error("Lỗi gửi liên hệ:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full bg-white min-h-[80vh] flex items-center py-4 md:py-12">
            <div className="max-w-[120rem] w-full mx-auto px-8 lg:px-[56px]">
                <div className="max-w-5xl mx-auto w-full">

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">

                        {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
                        <div className="flex flex-col justify-center md:col-span-5">
                            <h1 className="text-[28px] md:text-[36px] font-bold text-[#005596] mb-8 tracking-tight">
                                Thông tin liên hệ
                            </h1>

                            <ul className="space-y-3">
                                <li className="flex items-start gap-4">
                                    <Mail className="w-6 h-6 text-slate-800 shrink-0 mt-0.5" strokeWidth={1.5} />
                                    <div>
                                        <p className="font-medium text-[16px] text-[#005596]">Email</p>
                                        <p className="text-slate-1000 leading-relaxed max-w-sm">
                                            <a href="mailto:hurc1@tphcm.gov.vn">hurc1@tphcm.gov.vn</a>
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-slate-800 shrink-0 mt-.5" strokeWidth={1.5} />
                                    <div>
                                        <p className="font-medium text-[16px] text-[#005596]">Địa chỉ</p>
                                        <p className="text-slate-1000 leading-relaxed max-w-sm">
                                            Toà nhà OCC, số 55 Đường 11, Khu phố Giản Dân, Phường Long Bình, TP. Hồ Chí Minh
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-4">
                                    <Phone className="w-6 h-6 text-slate-800 shrink-0 mt-0.5" strokeWidth={1.5} />
                                    <div>
                                        <p className="font-medium text-[16px] text-[#005596]">Điện thoại</p>
                                        <p className="text-slate-1000 leading-relaxed max-w-sm">
                                            <a href="tel:1900 638 885">1900 638 885</a>
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* CỘT PHẢI: FORM LIÊN HỆ */}
                        <div className="w-full bg-white rounded-xl border border-[#005596]/30 shadow-sm p-4 md:py-6 md:px-8 md:col-span-7">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>

                                {/* TRƯỜNG HONEYPOT TÀNG HÌNH ĐỂ BẮT BOT (MẮT THƯỜNG KHÔNG THẤY) */}
                                <div style={{ position: 'absolute', opacity: 0, top: -9999, left: -9999 }} aria-hidden="true">
                                    <label htmlFor="website_url">Website URL</label>
                                    <input
                                        type="text"
                                        id="website_url"
                                        name="website_url"
                                        value={formData.website_url}
                                        onChange={handleChange}
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Họ và tên */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="full_name" className="text-[14px] font-bold text-slate-800">Họ và tên <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên..."
                                        className={`w-full px-4 py-2.5 rounded-md border focus:ring-1 outline-none transition-all text-[15px] ${errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#005596] focus:ring-[#005596]'}`}
                                    />
                                    {errors.full_name && <p className="text-red-500 text-[13px]">{errors.full_name}</p>}
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="email" className="text-[14px] font-bold text-slate-800">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Nhập Email..."
                                        className={`w-full px-4 py-2.5 rounded-md border focus:ring-1 outline-none transition-all text-[15px] ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#005596] focus:ring-[#005596]'}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-[13px]">{errors.email}</p>}
                                </div>

                                {/* Số điện thoại */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="phone" className="text-[14px] font-bold text-slate-800">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Nhập sđt..."
                                        className={`w-full px-4 py-2.5 rounded-md border focus:ring-1 outline-none transition-all text-[15px] ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#005596] focus:ring-[#005596]'}`}
                                    />
                                    {errors.phone && <p className="text-red-500 text-[13px]">{errors.phone}</p>}
                                </div>

                                {/* Loại liên hệ */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="subject" className="text-[14px] font-bold text-slate-800">Loại</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:border-[#005596] focus:ring-1 focus:ring-[#005596] outline-none transition-all bg-white text-[15px]"
                                    >
                                        <option value="FEEDBACK">Góp ý</option>
                                        <option value="LOST_ITEMS">Báo mất đồ</option>
                                    </select>
                                </div>

                                {/* Nội dung */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="message" className="text-[14px] font-bold text-slate-800">Nội dung <span className="text-red-500">*</span></label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Nhập nội dung..."
                                        className={`w-full px-4 py-2.5 rounded-md border focus:ring-1 outline-none transition-all resize-none text-[15px] ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#005596] focus:ring-[#005596]'}`}
                                    />
                                    {errors.message && <p className="text-red-500 text-[13px]">{errors.message}</p>}
                                </div>

                                {/* THÔNG BÁO TRẠNG THÁI GỬI */}
                                {submitStatus === 'success' && (
                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md text-[14px]">
                                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                                        Gửi thông tin thành công! Chúng tôi sẽ phản hồi sớm nhất.
                                    </div>
                                )}
                                {submitStatus === 'error' && (
                                    <div className="text-red-600 bg-red-50 p-3 rounded-md text-[14px]">
                                        Có lỗi xảy ra khi gửi. Vui lòng thử lại sau.
                                    </div>
                                )}

                                {/* Nút Submit */}
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-2.5 bg-[#005596] hover:bg-[#00447a] text-white font-medium rounded-md transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gửi"}
                                    </button>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}