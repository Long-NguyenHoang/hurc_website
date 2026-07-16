"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Khai báo khuôn mẫu TypeScript để không bị lỗi thuộc tính target
type NavItem = {
    name: string;
    href: string;
    target?: string;
};

const navLinks: NavItem[] = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Về HURC', href: '/gioi-thieu' },
    { name: 'Quá trình hình thành', href: '/qua-trinh-hinh-thanh' },
    { name: 'Lịch chạy tàu', href: '/lich-chay-tau' },
    { name: 'Hoá đơn', href: '/hoa-don' },
    { name: 'Tin tức', href: '/tin-tuc' },
    { name: 'Tuyển dụng', href: '/tuyen-dung' },
    { name: 'Liên hệ', href: '/lien-he' },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Hiệu ứng đổ bóng mờ khi cuộn chuột xuống
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-100 py-1' : 'bg-white border-transparent py-3'
                }`}
        >
            {/* KHUNG CHUẨN: max-w-[120rem] (1920px) */}
            <div className="max-w-[120rem] mx-auto px-4 lg:px-[112px]">
                <div className="flex items-center justify-between lg:justify-start h-16 relative">
                    <button
                        className="text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex lg:hidden w-1/3 justify-start pl-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* LOGO */}
                    <Link href="/" className="flex items-center flex justify-center w-1/3 lg:w-auto shrink-0">
                        <img src="/logo.png" alt="HCMC Metro" className="h-25 w-auto object-contain block" />
                    </Link>

                    {/* KHỐI CÂN BẰNG PHẢI TRÊN MOBILE */}
                    {/* Khối này trống, có w-1/3 để đẩy Logo vào đúng chính giữa màn hình trên mobile */}
                    <div className="flex lg:hidden w-1/3"></div>

                    {/* MENU DESKTOP (Vẫn giữ nguyên bên phải trên màn hình lớn) */}
                    <nav className="hidden lg:flex items-center gap-8 ml-auto">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target={link.target || '_self'}
                                    className={`text-[15px] transition-colors whitespace-nowrap ${isActive ? 'text-[#004b87] font-medium' : 'text-slate-700 hover:text-[#004b87]'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                </div>
            </div>

            {/* MENU MOBILE DROP-DOWN */}
            <div
                className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="flex flex-col px-4 py-4 space-y-2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                target={link.target || '_self'}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`px-4 py-3 rounded-xl text-[15px] transition-colors ${isActive ? 'bg-blue-50 text-[#004b87] font-medium' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}