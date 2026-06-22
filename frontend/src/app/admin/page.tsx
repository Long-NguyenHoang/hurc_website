'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Map, Mail, ShieldAlert, Activity, Loader2 } from 'lucide-react';
import { stationService } from '@/services/station.service';
import { contactService, Contact } from '@/services/contact.service';
import { auditLogService, AuditLog } from '@/services/audit-log.service';
import { userService } from '@/services/user.service';

// --- BỘ TỪ ĐIỂN DỊCH TÊN BẢNG VÀ HÀNH ĐỘNG ---
const entityTranslator: Record<string, string> = {
    'Article': 'Tin tức', 'Banner': 'Banner', 'Station': 'Nhà ga',
    'User': 'Tài khoản', 'TicketFare': 'Bảng giá vé', 'Media': 'Thư viện ảnh', 'Contact': 'Phản hồi'
};
const actionTranslator: Record<string, string> = {
    'CREATE': 'Thêm mới', 'UPDATE': 'Cập nhật', 'DELETE': 'Xóa'
};

export default function AdminDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    // State lưu trữ số liệu thống kê
    const [stats, setStats] = useState({
        totalStations: 0,
        pendingFeedbacks: 0,
        todayLogs: 0,
        totalUsers: 0
    });

    // State lưu trữ danh sách mới nhất
    const [recentFeedbacks, setRecentFeedbacks] = useState<Contact[]>([]);
    const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // 1. Lấy Profile để biết Quyền của user hiện tại
            const profileRes: any = await userService.getProfile();
            const role = profileRes?.data?.role || profileRes?.role;
            setUserRole(role);

            // 2. Chuẩn bị mảng các API cần gọi (Chỉ gọi API mà quyền cho phép)
            const apiPromises: Promise<any>[] = [
                stationService.getAllAdmin(),
                contactService.getAllAdmin({ limit: 50 })
            ];

            // Nếu là ADMIN, thêm 2 API này vào để lấy thống kê
            if (role === 'ADMIN') {
                apiPromises.push(auditLogService.getAll({ limit: 50 }));
                apiPromises.push(userService.getAll({ limit: 50 }));
            }

            // Gọi đồng loạt các API đã chuẩn bị
            const results = await Promise.all(apiPromises);

            const stationsRes = results[0];
            const contactsRes = results[1];

            // Xử lý dữ liệu cơ bản chung cho cả ADMIN và EDITOR
            const stationsData = Array.isArray(stationsRes) ? stationsRes : stationsRes?.data || [];
            const contactsData = contactsRes?.data?.items || contactsRes?.data?.data || (Array.isArray(contactsRes) ? contactsRes : contactsRes?.data || []);
            const pendingContacts = contactsData.filter((c: Contact) => c.status === 'PENDING');

            let todayLogsCount = 0;
            let totalUsersCount = 0;
            let logsData = [];

            // Nếu là ADMIN, bóc tách thêm dữ liệu thống kê chuyên sâu
            if (role === 'ADMIN') {
                const logsRes = results[2];
                const usersRes = results[3];

                logsData = logsRes?.data?.items || logsRes?.data?.data || (Array.isArray(logsRes) ? logsRes : logsRes?.data || []);
                const todayStr = new Date().toDateString();
                todayLogsCount = logsData.filter((l: AuditLog) => new Date(l.created_at).toDateString() === todayStr).length;

                const usersData = usersRes?.data?.items || usersRes?.data?.data || (Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
                totalUsersCount = usersRes?.data?.meta?.total || usersData.length;
            }

            setStats({
                totalStations: stationsData.length,
                pendingFeedbacks: pendingContacts.length,
                todayLogs: todayLogsCount,
                totalUsers: totalUsersCount
            });

            // Gán dữ liệu cho bảng. Nếu là Editor, hiển thị nhiều phản hồi hơn vì không có bảng Nhật ký bên cạnh.
            setRecentFeedbacks(contactsData.slice(0, role === 'ADMIN' ? 4 : 6));
            if (role === 'ADMIN') {
                setRecentLogs(logsData.slice(0, 5));
            }

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu Dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM PHỤ TRỢ: TÍNH THỜI GIAN TRÔI QUA (TIME AGO) ---
    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Vừa xong';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;

        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-[14px] font-medium">Đang tổng hợp dữ liệu hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bảng điều khiển</h1>
            </div>

            {/* Stat Cards Row - Tự động thay đổi layout nếu là Editor */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${userRole === 'ADMIN' ? 'xl:grid-cols-4' : ''} gap-5`}>
                {/* Thẻ Nhà Ga */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[13px] font-semibold text-slate-500">Tổng Nhà Ga</span>
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-[12px]">
                            <Map className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">{stats.totalStations}</div>
                        <div className="text-[11px] font-medium text-slate-400 mt-2">Tổng số nhà ga toàn tuyến</div>
                    </div>
                </div>

                {/* Thẻ Phản hồi */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[13px] font-semibold text-slate-500">Phản hồi chờ xử lý</span>
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-[12px]">
                            <Mail className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-slate-900">{stats.pendingFeedbacks}</div>
                        {stats.pendingFeedbacks > 0 ? (
                            <div className="mt-2 flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 w-fit px-2 py-0.5 rounded-md">
                                Cần xử lý ngay
                            </div>
                        ) : (
                            <div className="mt-2 flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 w-fit px-2 py-0.5 rounded-md">
                                Đã xử lý tất cả
                            </div>
                        )}
                    </div>
                </div>

                {/* CHỈ ADMIN MỚI THẤY 2 THẺ NÀY */}
                {userRole === 'ADMIN' && (
                    <>
                        {/* Thẻ Nhật ký */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col transition-shadow hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[13px] font-semibold text-slate-500">Nhật ký hôm nay</span>
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-[12px]">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{stats.todayLogs}</div>
                                <div className="text-[11px] font-medium text-slate-400 mt-2">Thao tác được ghi nhận</div>
                            </div>
                        </div>

                        {/* Thẻ Tài khoản */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col transition-shadow hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[13px] font-semibold text-slate-500">Tài khoản</span>
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-[12px]">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
                                <div className="text-[11px] font-medium text-slate-400 mt-2">Nhân sự có quyền truy cập</div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Content Grid - Tràn viền rộng ra nếu là Editor */}
            <div className={`grid grid-cols-1 ${userRole === 'ADMIN' ? 'lg:grid-cols-2' : ''} gap-5`}>

                {/* Box Trái: Phản hồi khách hàng */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" /> Phản hồi mới nhất
                        </h3>
                        <Link href="/admin/contacts" className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                            Xem tất cả →
                        </Link>
                    </div>

                    <div className="flex-1 divide-y divide-slate-100">
                        {recentFeedbacks.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-[13px]">Chưa có phản hồi nào.</div>
                        ) : (
                            recentFeedbacks.map((contact) => (
                                <Link href="/admin/contacts" key={contact.id} className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group cursor-pointer block">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[13px] border border-blue-100 uppercase shrink-0">
                                            {contact.full_name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-semibold text-slate-900 truncate">{contact.full_name}</p>
                                            <p className="text-[12px] text-slate-500 mt-0.5 truncate">{contact.subject === 'LOST_ITEMS' ? 'Báo mất đồ' : 'Góp ý hệ thống'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                        {contact.status === 'PENDING' ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                                                Chờ xử lý
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                Đã xử lý
                                            </span>
                                        )}
                                        <span className="text-[10px] font-medium text-slate-400">{timeAgo(contact.created_at)}</span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* CHỈ ADMIN MỚI THẤY Box Phải: Nhật ký hệ thống */}
                {userRole === 'ADMIN' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-400" /> Hoạt động gần đây
                            </h3>
                            <Link href="/admin/audit-logs" className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                Xem tất cả →
                            </Link>
                        </div>

                        <div className="flex-1 divide-y divide-slate-100 p-2">
                            {recentLogs.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-[13px]">Hệ thống chưa ghi nhận hoạt động.</div>
                            ) : (
                                recentLogs.map((log) => {
                                    const colorClass = log.action === 'CREATE' ? 'bg-emerald-500' : log.action === 'DELETE' ? 'bg-red-500' : 'bg-indigo-500';

                                    return (
                                        <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-slate-50/80 transition-colors rounded-xl">
                                            <div className={`w-1.5 h-10 ${colorClass} rounded-full mt-1 shrink-0`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-slate-900">
                                                    {actionTranslator[log.action] || log.action} {entityTranslator[log.entity_name] || log.entity_name}
                                                </p>
                                                <p className="text-[12px] text-slate-500 mt-0.5 truncate">
                                                    Thực hiện bởi <strong>{log.actor_email}</strong>.
                                                </p>
                                                <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                                                    {timeAgo(log.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}