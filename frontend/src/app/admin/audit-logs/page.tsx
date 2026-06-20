'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Eye, ShieldCheck, Clock, User as UserIcon, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { auditLogService, AuditLog } from '@/services/audit-log.service';
import Modal from '@/components/Modal';

// --- BỘ TỪ ĐIỂN DỊCH TÊN BẢNG SANG TIẾNG VIỆT ---
const entityNameTranslator: Record<string, string> = {
    'Article': 'Tin tức',
    'Banner': 'Banner',
    'Station': 'Nhà ga',
    'User': 'Tài khoản',
    'TicketFare': 'Bảng giá vé',
    'Media': 'Thư viện ảnh'
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // --- STATE MODAL XEM CHI TIẾT ---
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Khi trang hiện tại thay đổi, tự động gọi lại API
    useEffect(() => {
        fetchLogs();
    }, [currentPage]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            // Truyền tham số page và limit vào API khớp với PaginationDto của Backend
            const response: any = await auditLogService.getAll({ page: currentPage, limit: 10 });

            // Xử lý lấy danh sách dữ liệu
            const dataList = response?.data?.items || response?.data?.data || (Array.isArray(response) ? response : response?.data || []);

            // Xử lý lấy thông tin phân trang (meta) từ Backend
            const meta = response?.data?.meta || response?.meta;
            if (meta) {
                setTotalPages(meta.lastPage || 1);
                setTotalItems(meta.total || dataList.length);
            } else {
                setTotalItems(dataList.length);
            }

            // Đảm bảo sắp xếp mới nhất lên đầu (trường hợp Backend chưa sắp xếp)
            const sortedList = dataList.sort((a: AuditLog, b: AuditLog) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setLogs(sortedList);
        } catch (error) {
            console.error('Lỗi tải nhật ký hệ thống:', error);
            toast.error('Không thể tải dữ liệu nhật ký!');
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM LỌC ---
    const filteredLogs = logs.filter(log =>
        log.actor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- HÀM PHỤ TRỢ UI ---
    const formatDate = (isoString: string) => {
        if (!isoString) return '—';
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(new Date(isoString));
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE':
                return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">Thêm mới</span>;
            case 'UPDATE':
                return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">Cập nhật</span>;
            case 'DELETE':
                return <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">Xóa bỏ</span>;
            default:
                return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider">{action}</span>;
        }
    };

    const translateEntity = (name: string) => {
        return entityNameTranslator[name] || name;
    };

    const renderJsonData = (data: any) => {
        if (!data || Object.keys(data).length === 0) return <span className="text-slate-400 italic text-[12px]">Không có dữ liệu</span>;
        return (
            <pre className="text-[12px] bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono shadow-inner border border-slate-700">
                {JSON.stringify(data, null, 2)}
            </pre>
        );
    };

    return (
        <div className="flex flex-col gap-6 relative">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7 text-blue-600" /> Nhật ký hệ thống
                    </h1>
                    <p className="text-[13px] text-slate-500 mt-1">Lịch sử mọi thao tác Thêm, Sửa, Xóa trên hệ thống của các tài khoản.</p>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text" placeholder="Tìm theo Email hoặc tên bảng (trang hiện tại)..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div className="text-[13px] font-medium text-slate-500">
                        Hệ thống ghi nhận: <span className="font-bold text-slate-900">{totalItems}</span> thao tác
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thời gian</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tài khoản thực hiện</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Hành động</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mục dữ liệu</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                                        <p className="text-[13px] font-medium text-slate-500">Đang tải nhật ký...</p>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {formatDate(log.created_at)}
                                        </div>
                                    </td>

                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                <UserIcon className="w-3 h-3 text-slate-500" />
                                            </div>
                                            <span className="text-[13px] font-bold text-slate-800">{log.actor_email}</span>
                                        </div>
                                    </td>

                                    <td className="py-3 px-5 text-center">
                                        {getActionBadge(log.action)}
                                    </td>

                                    <td className="py-3 px-5">
                                        <span className="text-[13px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                            {translateEntity(log.entity_name)}
                                        </span>
                                        <span className="text-[11px] text-slate-400 ml-2 font-mono" title={log.entity_id}>
                                            ID: {log.entity_id.split('-')[0]}...
                                        </span>
                                    </td>

                                    <td className="py-3 px-5 text-right">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="px-3 py-1.5 text-[12px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Xem
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-[13px] text-slate-500">
                                        Không tìm thấy dữ liệu nhật ký phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
                {!isLoading && totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <span className="text-[13px] text-slate-500 font-medium">
                            Đang hiển thị trang <strong className="text-slate-800">{currentPage}</strong> trên tổng số <strong className="text-slate-800">{totalPages}</strong> trang
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================= */}
            {/* MODAL CHI TIẾT SỰ THAY ĐỔI DỮ LIỆU        */}
            {/* ========================================= */}
            <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Chi tiết thao tác" maxWidth="4xl">
                {selectedLog && (
                    <div className="flex flex-col">
                        <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar flex flex-col gap-6">

                            {/* THÔNG TIN CHUNG */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Hành động</span>
                                    {getActionBadge(selectedLog.action)}
                                </div>
                                <div>
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Mục dữ liệu</span>
                                    <span className="text-[13px] font-semibold text-slate-800">{translateEntity(selectedLog.entity_name)}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Người thực hiện</span>
                                    <span className="text-[13px] font-semibold text-slate-800">{selectedLog.actor_email}</span>
                                    <span className="text-[11px] text-slate-500 ml-2">vào lúc {formatDate(selectedLog.created_at)}</span>
                                </div>
                                <div className="col-span-4">
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Entity ID (ID Đối tượng)</span>
                                    <span className="text-[12px] font-mono text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded">{selectedLog.entity_id}</span>
                                </div>
                            </div>

                            {/* SO SÁNH DỮ LIỆU CŨ VÀ MỚI */}
                            {selectedLog.action === 'UPDATE' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-red-500 font-bold text-[13px] uppercase">
                                            <Database className="w-4 h-4" /> Dữ liệu cũ (Bị ghi đè)
                                        </div>
                                        {renderJsonData(selectedLog.old_values)}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[13px] uppercase">
                                            <Database className="w-4 h-4" /> Dữ liệu mới (Đã lưu)
                                        </div>
                                        {renderJsonData(selectedLog.new_values)}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-blue-500 font-bold text-[13px] uppercase">
                                        <Database className="w-4 h-4" />
                                        {selectedLog.action === 'CREATE' ? 'Nội dung dữ liệu được tạo mới' : 'Nội dung dữ liệu đã bị xóa'}
                                    </div>
                                    {renderJsonData(selectedLog.action === 'CREATE' ? selectedLog.new_values : selectedLog.old_values)}
                                </div>
                            )}

                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50 rounded-b-2xl">
                            <button onClick={() => setSelectedLog(null)} className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                Đóng lại
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}