import { Users, Map, Mail, ShieldAlert, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-6">

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bảng điều khiển</h1>
                {/* <p className="text-[13px] text-slate-500 mt-1">
                    System Overview
                </p> */}
            </div>

            {/* Stat Cards Row (Giống .stats-grid trong HR Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[13px] font-semibold text-slate-500">Tổng Nhà Ga</span>
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-[12px]">
                            <Map className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">14</div>
                        <div className="text-[11px] font-medium text-slate-400 mt-2">Tổng số nhà ga toàn tuyến</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[13px] font-semibold text-slate-500">Phản hồi chờ xử lý</span>
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-[12px]">
                            <Mail className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">5</div>
                        <div className="mt-2 flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 w-fit px-2 py-0.5 rounded-md">
                            Cần xử lý ngay
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[13px] font-semibold text-slate-500">Nhật ký hôm nay</span>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-[12px]">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">28</div>
                        <div className="text-[11px] font-medium text-slate-400 mt-2">Tổng log hệ thống ghi nhận</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[13px] font-semibold text-slate-500">Tài khoản</span>
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-[12px]">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">3</div>
                        <div className="text-[11px] font-medium text-slate-400 mt-2">Nhân sự có quyền truy cập</div>
                    </div>
                </div>

            </div>

            {/* Content Grid (2 Columns giống phần Upcoming Interviews / Recent Applications) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Box Trái */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" /> Phản hồi mới nhất
                        </h3>
                        <button className="text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                            Xem tất cả →
                        </button>
                    </div>

                    {/* List items giống .interview-item */}
                    <div className="flex-1 divide-y divide-slate-100">
                        {/* Dòng 1 */}
                        <div className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[13px] border border-blue-100">
                                    T
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-900">Trần Văn A</p>
                                    <p className="text-[12px] text-slate-500 mt-0.5">Lỗi cổng soát vé ga Suối Tiên</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                                    Chưa đọc
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">10:45 Hôm nay</span>
                            </div>
                        </div>

                        {/* Dòng 2 */}
                        <div className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[13px] border border-slate-200">
                                    N
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-900">Nguyễn Thị B</p>
                                    <p className="text-[12px] text-slate-500 mt-0.5">Góp ý về thẻ lên tàu</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    Đã xử lý
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">Hôm qua</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Box Phải */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-400" /> Hoạt động gần đây
                        </h3>
                    </div>

                    {/* List items giống .interview-item style có thanh sọc bên trái */}
                    <div className="flex-1 divide-y divide-slate-100 p-2">

                        <div className="flex items-start gap-4 p-3 hover:bg-slate-50/80 transition-colors rounded-xl">
                            <div className="w-1.5 h-10 bg-indigo-500 rounded-full mt-1"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-slate-900">Cập nhật giá vé</p>
                                <p className="text-[12px] text-slate-500 mt-0.5">Admin đã thay đổi giá vé cho tuyến số 1.</p>
                                <span className="text-[11px] font-medium text-slate-400 mt-1 block">15 phút trước</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-3 hover:bg-slate-50/80 transition-colors rounded-xl">
                            <div className="w-1.5 h-10 bg-emerald-500 rounded-full mt-1"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-slate-900">Đăng nhập thành công</p>
                                <p className="text-[12px] text-slate-500 mt-0.5">Nguyễn Hoang Long vừa đăng nhập vào hệ thống.</p>
                                <span className="text-[11px] font-medium text-slate-400 mt-1 block">2 giờ trước</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}