"use client";

import Link from "next/link";
import { Cloud, Home, Mail, Menu, Phone, X } from "lucide-react";
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

    const [weather, setWeather] = useState({ min: 26, max: 32, isLoading: true });

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=10.8231&longitude=106.6297&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok&forecast_days=1');
                const data = await res.json();

                if (data && data.daily) {
                    setWeather({
                        min: Math.round(data.daily.temperature_2m_min[0]),
                        max: Math.round(data.daily.temperature_2m_max[0]),
                        isLoading: false
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải thời tiết:", error);
                // Vẫn giữ fallback 26-32 độ nếu rớt mạng
                setWeather(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchWeather();
    }, []);

    return (
        <header className="sticky top-0 z-50 transition-all duration-300 shadow-sm flex flex-col">
            <div className="relative bg-white border-b border-slate-200">
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-[url('/header-bg.png')] bg-cover bg-center bg-no-repeat"></div>

                <div className="max-w-[120rem] mx-auto px-6 lg:px-[180px] relative z-10">
                    <div className="flex items-center py-2 lg:py-4 h-[65px] lg:h-[85px]">

                        {/* LOGO */}
                        <Link href="/" className="shrink-0 flex items-center">
                            <img src="/logo.png" alt="HCMC Metro" className="h-16 lg:h-24 w-auto object-contain ml-2" />
                        </Link>

                        <div className="hidden lg:flex items-center gap-8 text-[18px] text-slate-800 font-medium">
                            <div className="flex items-center gap-2 ml-15">
                                <Cloud className={`w-5 h-5 text-slate-600 ${weather.isLoading ? 'animate-pulse' : ''}`} />
                                {weather.isLoading ? (
                                    <span className="animate-pulse bg-slate-200 h-4 w-24 rounded"></span>
                                ) : (
                                    <span>Hồ Chí Minh, {weather.min}° - {weather.max}°</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 ml-15">
                                <Phone className="w-5 h-5 text-slate-600" />
                                <a href="tel:1900 638 885">1900 638 885</a>
                            </div>
                            <div className="flex items-center gap-2 ml-15">
                                <Mail className="w-5 h-5 text-slate-600" />
                                <a href="mailto:hurc1@tphcm.gov.vn">hurc1@tphcm.gov.vn</a>
                            </div>
                        </div>

                        <div className="flex lg:hidden items-center gap-2 text-[14px] sm:text-sm text-slate-800 font-medium">
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 ml-4 md:ml-50" />
                            <a href="mailto:hurc1@tphcm.gov.vn">hurc1@tphcm.gov.vn</a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#005596] text-white">
                <div className="max-w-[120rem] mx-auto px-4 lg:px-[112px] h-12 lg:h-16 flex items-center justify-between">

                    {/* NÚT HOME (Góc trái) - Tự động trích xuất từ navLinks có href là '/' */}
                    <Link
                        href="/"
                        className={`transition-colors hover:text-blue-200 ${pathname === '/' ? 'text-white' : 'text-slate-300'}`}
                        title="Trang chủ"
                    >
                        <Home className="w-6 h-6 lg:w-8 lg:h-8 ml-3 lg:ml-25" strokeWidth={1} />
                    </Link>

                    {/* MENU DESKTOP */}
                    {/* Bỏ qua phần tử "Trang chủ" vì đã dùng Icon Home ở trên */}
                    <nav className="hidden ml-20 lg:flex items-center gap-8 flex-1 justify-center">
                        {navLinks.filter(link => link.href !== '/').map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target={link.target || '_self'}
                                    className={`text-[20px] px-2 transition-colors whitespace-nowrap ${isActive ? 'text-white font-bold' : 'text-slate-200 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* NÚT TOGGLE MENU (MOBILE) */}
                    <button
                        className="lg:hidden text-white hover:text-slate-200 p-3"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                </div>
            </div>
            {/* MENU MOBILE DROP-DOWN */}
            <div
                className={`lg:hidden absolute top-full left-0 w-full bg-[#005596] shadow-xl overflow-hidden transition-all duration-300 ease-in-out border-t border-blue-800/50 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="flex flex-col px-4 py-4 space-y-1">
                    {/* Render lại toàn bộ Menu cho Mobile, kể cả chữ Trang chủ */}
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={`mobile-${link.name}`}
                                href={link.href}
                                target={link.target || '_self'}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`px-4 py-3 rounded-xl text-[15px] transition-colors ${isActive
                                    ? 'bg-white/10 text-white font-bold'
                                    : 'text-slate-200 hover:bg-white/5 hover:text-white'
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