'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Map, Ticket, Mail,
    ShieldAlert, Train, ChevronDown, LogOut
} from 'lucide-react';
import { authService } from '@/services/auth.service';



export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const router = useRouter();

    // Hàm xử lý đăng xuất
    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.log('Lỗi khi đăng xuất: ', error);
        } finally {
            router.push('/admin/login')
        }
    }

    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">

            {/* --- SIDEBAR (Light Theme like HR Portal) --- */}
            <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-slate-200 flex flex-col z-50 transition-all">
                {/* Logo Header */}
                <div className="h-[72px] px-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Train className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 tracking-tight">HCMC METRO</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Nhóm 1: MENU */}
                    <div>
                        <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] mb-2 block">
                            Menu
                        </span>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <LayoutDashboard className="w-4 h-4" /> Bảng điều khiển
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Nhóm 2: QUẢN LÝ DỮ LIỆU */}
                    <div>
                        <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] mb-2 block">
                            Quản lý dữ liệu
                        </span>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/admin/stations" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/stations') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <Map className="w-4 h-4" /> Nhà ga & Lịch chạy tàu
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/ticket-fares" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/ticket-fares') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <Ticket className="w-4 h-4" /> Bảng giá vé
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Nhóm 3: TƯƠNG TÁC & HỆ THỐNG */}
                    <div>
                        <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] mb-2 block">
                            Hệ thống
                        </span>
                        <ul className="space-y-1">
                            <li>
                                <Link href="/admin/contacts" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/contacts') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <Mail className="w-4 h-4" /> Phản hồi khách hàng
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/audit-logs" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/audit-logs') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <ShieldAlert className="w-4 h-4" /> Nhật ký bảo mật
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>

            {/* --- MAIN AREA --- */}
            <div className="flex-1 ml-[240px] flex flex-col min-w-0">

                {/* HEADER (Glassmorphism & Search Bar) */}
                <header className="sticky top-0 z-30 min-h-[72px] bg-slate-50/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 py-3">

                    {/* Thanh Search */}
                    <div className="relative flex-1 max-w-[460px]">
                        {/* <div className="flex items-center gap-2.5 h-10 px-3.5 bg-white border border-slate-200 rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                            <Search className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm menu, nhà ga, vé..."
                                className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-900 placeholder:text-slate-400"
                            />
                            <span className="inline-flex items-center justify-center min-w-[38px] h-[22px] px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-500 tracking-wide">
                                ⌘K
                            </span>
                        </div> */}
                    </div>

                    <div className="flex items-center gap-3 ml-4 relative">
                        {/* Nút Notification */}
                        {/* <button className="relative flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-[14px] text-slate-600 shadow-[0_4px_12px_rgba(15,23,42,0.04)] hover:bg-blue-50 hover:text-slate-900 transition-colors">
                            <Bell className="w-4 h-4" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
                                3
                            </span>
                        </button> */}

                        {/* Nút User Dropdown */}
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2.5 p-1 pr-2.5 bg-white border border-slate-200 rounded-[16px] shadow-[0_4px_12px_rgba(15,23,42,0.04)] hover:bg-slate-50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                A
                            </div>
                            <div className="hidden md:flex flex-col text-left min-w-0">
                                <span className="text-[12px] font-semibold text-slate-900 truncate">Super Admin</span>
                                <span className="text-[11px] text-slate-400">Quản trị viên</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu Giả lập */}
                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                                <div className="absolute top-[calc(100%+8px)] right-0 w-[280px] bg-white border border-slate-200 rounded-[16px] shadow-[0_10px_30px_rgba(15,23,42,0.12)] p-2 z-50">
                                    <div className="flex gap-3 p-2 pb-3">
                                        <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-[14px] flex items-center justify-center font-bold text-lg">A</div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-[13px] font-semibold text-slate-900">Super Admin</span>
                                            <span className="text-[11px] text-slate-500">admin@hurc.vn</span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    <button className="flex items-center gap-2.5 w-full p-2.5 text-[13px] text-red-600 hover:bg-red-50 rounded-[10px] transition-colors text-left font-medium" onClick={handleLogout}>
                                        <LogOut className="w-4 h-4" /> Đăng xuất
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* NỘI DUNG CHÍNH */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-[1280px] mx-auto w-full">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}