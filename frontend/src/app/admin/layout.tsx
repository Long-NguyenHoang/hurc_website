'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Map, Ticket, Mail, ShieldAlert, Train, ChevronDown, LogOut, Users, Image as ImageIcon, Layers, FileText, UserIcon, Loader2, Save, AlertTriangle } from 'lucide-react';
import { authService } from '@/services/auth.service';
import toast, { Toaster } from 'react-hot-toast';
import { User, userService } from '@/services/user.service';
import Modal from '@/components/Modal';

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

    const [userProfile, setUserProfile] = useState<User | null>(null);

    // --- STATE CHO MODAL CẬP NHẬT PROFILE ---
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        full_name: '',
        password: '',
        confirm_password: ''
    });

    // THÊM: STATE LƯU TRỮ LỖI VALIDATION
    const [profileErrors, setProfileErrors] = useState<{ full_name?: string; password?: string; confirm_password?: string }>({});

    // --- LẤY THÔNG TIN USER KHI LOAD TRANG ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response: any = await userService.getProfile();
                const data = response?.data || response;
                setUserProfile(data);
                setProfileFormData({
                    full_name: data.full_name || '',
                    password: '',
                    confirm_password: ''
                });
            } catch (error) {
                console.error("Lỗi lấy thông tin cá nhân:", error);
            }
        };
        fetchProfile();
    }, []);

    // --- HÀM XỬ LÝ CẬP NHẬT PROFILE ---
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { full_name?: string; password?: string; confirm_password?: string } = {};
        let isValid = true;

        if (!profileFormData.full_name.trim()) {
            newErrors.full_name = 'Họ tên không được để trống!';
            isValid = false;
        }

        if (profileFormData.password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!passwordRegex.test(profileFormData.password)) {
                newErrors.password = 'Mật khẩu phải từ 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt (@$!%*?&)!';
                isValid = false;
            }

            if (profileFormData.password !== profileFormData.confirm_password) {
                newErrors.confirm_password = 'Mật khẩu xác nhận không khớp!';
                isValid = false;
            }
        }

        setProfileErrors(newErrors);

        if (!isValid) return;

        setIsUpdatingProfile(true);
        try {
            // Tạo payload chỉ chứa những trường cần gửi
            const payload: any = { full_name: profileFormData.full_name };

            // Nếu có nhập mật khẩu thì mới đính kèm vào payload gửi lên API
            if (profileFormData.password) {
                payload.password = profileFormData.password;
            }

            await userService.updateProfile(payload);
            toast.success(profileFormData.password ? 'Đã cập nhật họ tên và mật khẩu!' : 'Cập nhật thông tin cá nhân thành công!');
            setIsProfileModalOpen(false);

            // Cập nhật lại UI
            setUserProfile(prev => prev ? { ...prev, full_name: profileFormData.full_name } : null);

            // Reset lại form mật khẩu và lỗi cho lần mở sau
            setProfileFormData({ full_name: profileFormData.full_name, password: '', confirm_password: '' });
            setProfileErrors({});
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin!');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

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
                                <Link href="/admin/articles" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/articles') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <FileText className="w-4 h-4" /> Quản lý Tin tức
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/banner" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/banner') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <Layers className="w-4 h-4" /> Quản lý Banner
                                </Link>
                            </li>
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
                            <li>
                                <Link href="/admin/media" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/media') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <ImageIcon className="w-4 h-4" /> Thư viện Media
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
                            {/* CHỈ ADMIN MỚI THẤY QUẢN LÝ TÀI KHOẢN */}
                            {userProfile?.role === 'ADMIN' && (
                                <li>
                                    <Link href="/admin/users" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/users') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        <Users className="w-4 h-4" /> Quản lý tài khoản
                                    </Link>
                                </li>
                            )}

                            <li>
                                <Link href="/admin/contacts" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/contacts') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <Mail className="w-4 h-4" /> Phản hồi khách hàng
                                </Link>
                            </li>

                            {/* CHỈ ADMIN MỚI THẤY NHẬT KÝ BẢO MẬT */}
                            {userProfile?.role === 'ADMIN' && (
                                <li>
                                    <Link href="/admin/audit-logs" className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${isActive('/admin/audit-logs') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        <ShieldAlert className="w-4 h-4" /> Nhật ký bảo mật
                                    </Link>
                                </li>
                            )}
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
                    </div>

                    <div className="flex items-center gap-3 ml-4 relative">

                        {/* Nút User Dropdown */}
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2.5 p-1 pr-2.5 bg-white border border-slate-200 rounded-[16px] shadow-[0_4px_12px_rgba(15,23,42,0.04)] hover:bg-slate-50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                                {userProfile?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden md:flex flex-col text-left min-w-0">
                                <span className="text-[12px] font-semibold text-slate-900 truncate max-w-[120px]">
                                    {userProfile?.full_name || 'Đang tải...'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    {userProfile?.role === 'ADMIN' ? 'Quản trị viên' : 'Biên tập viên'}
                                </span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                                <div className="absolute top-[calc(100%+8px)] right-0 w-[280px] bg-white border border-slate-200 rounded-[16px] shadow-[0_10px_30px_rgba(15,23,42,0.12)] p-2 z-50">
                                    <div className="flex gap-3 p-2 pb-3">
                                        <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-[14px] flex items-center justify-center font-bold text-lg uppercase">
                                            {userProfile?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <span className="text-[13px] font-semibold text-slate-900 truncate">{userProfile?.full_name}</span>
                                            <span className="text-[11px] text-slate-500 truncate">{userProfile?.email}</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 my-1"></div>

                                    {/* NÚT THÔNG TIN CÁ NHÂN */}
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            setProfileFormData({
                                                full_name: userProfile?.full_name || '',
                                                password: '',
                                                confirm_password: ''
                                            });
                                            setProfileErrors({});
                                            setIsProfileModalOpen(true);
                                        }}
                                        className="flex items-center gap-2.5 w-full p-2.5 text-[13px] text-slate-700 hover:bg-slate-50 rounded-[10px] transition-colors text-left font-medium"
                                    >
                                        <UserIcon className="w-4 h-4" /> Thông tin cá nhân
                                    </button>

                                    <button onClick={handleLogout} className="flex items-center gap-2.5 w-full p-2.5 text-[13px] text-red-600 hover:bg-red-50 rounded-[10px] transition-colors text-left font-medium">
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

            {/* MODAL CẬP NHẬT THÔNG TIN CÁ NHÂN */}
            <Modal isOpen={isProfileModalOpen} onClose={() => { setIsProfileModalOpen(false); setProfileErrors({}); }} title="Thông tin cá nhân" maxWidth="md">
                <form onSubmit={handleUpdateProfile} noValidate className="flex flex-col">
                    <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh] custom-scrollbar">

                        {/* THÔNG TIN CƠ BẢN */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email đăng nhập</label>
                            <input
                                type="email"
                                value={userProfile?.email || ''}
                                disabled
                                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-[13px] cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={profileFormData.full_name}
                                onChange={(e) => {
                                    setProfileFormData({ ...profileFormData, full_name: e.target.value });
                                    if (profileErrors.full_name) setProfileErrors({ ...profileErrors, full_name: undefined });
                                }}
                                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${profileErrors.full_name ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                                placeholder="Nhập họ tên của bạn..."
                            />
                            {profileErrors.full_name && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {profileErrors.full_name}</p>}
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Vai trò hệ thống</label>
                            <div className="px-3.5 py-2.5 bg-blue-50 border border-blue-100 text-blue-700 font-medium rounded-xl text-[13px]">
                                {userProfile?.role === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Biên tập viên (Editor)'}
                            </div>
                        </div>

                        {/* ĐƯỜNG KẺ NGĂN CÁCH */}
                        <div className="h-px bg-slate-200 my-1"></div>

                        {/* KHU VỰC ĐỔI MẬT KHẨU */}
                        <div>
                            <h4 className="text-[14px] font-bold text-slate-800">Đổi mật khẩu</h4>
                            <p className="text-[12px] text-slate-500 mt-1 mb-4">Bỏ trống 2 ô dưới đây nếu bạn không muốn thay đổi mật khẩu hiện tại.</p>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={profileFormData.password}
                                        onChange={(e) => {
                                            setProfileFormData({ ...profileFormData, password: e.target.value });
                                            if (profileErrors.password) setProfileErrors({ ...profileErrors, password: undefined });
                                        }}
                                        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${profileErrors.password ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                                        autoComplete="new-password"
                                        placeholder="Nhập mật khẩu mới..."
                                    />
                                    {profileErrors.password ? (
                                        <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {profileErrors.password}</p>
                                    ) : (
                                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                                            Mật khẩu phải có ít nhất <strong className="text-slate-500">8 ký tự</strong>, bao gồm chữ <strong className="text-slate-500">Hoa</strong>, chữ <strong className="text-slate-500">thường</strong>, <strong className="text-slate-500">số</strong> và <strong className="text-slate-500">ký tự đặc biệt</strong>.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        value={profileFormData.confirm_password}
                                        onChange={(e) => {
                                            setProfileFormData({ ...profileFormData, confirm_password: e.target.value });
                                            if (profileErrors.confirm_password) setProfileErrors({ ...profileErrors, confirm_password: undefined });
                                        }}
                                        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${profileErrors.confirm_password ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                                        placeholder="Nhập lại mật khẩu mới..."
                                        autoComplete="new-password"
                                    />
                                    {profileErrors.confirm_password && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {profileErrors.confirm_password}</p>}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                        <button type="button" onClick={() => { setIsProfileModalOpen(false); setProfileErrors({}); }} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={isUpdatingProfile} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm">
                            {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        fontSize: '13px',
                        fontWeight: '500',
                        borderRadius: '12px',
                    },
                }}
            />
        </div>
    );
}