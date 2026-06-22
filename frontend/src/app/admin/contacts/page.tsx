'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Eye, Trash2, AlertTriangle, Mail, Phone, User as UserIcon, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactService, Contact, ContactStatus, Subject } from '@/services/contact.service';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // --- STATE MODAL CHI TIẾT ---
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // --- STATE MODAL XÓA ---
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, [currentPage]);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const response: any = await contactService.getAllAdmin({ page: currentPage, limit: 10 });

            const dataList = response?.data?.items || response?.data?.data || (Array.isArray(response) ? response : response?.data || []);

            const meta = response?.data?.meta || response?.meta;
            if (meta) {
                setTotalPages(meta.lastPage || Math.ceil(meta.total / meta.limit) || 1);
                setTotalItems(meta.total || dataList.length);
            } else {
                setTotalItems(dataList.length);
            }

            const sortedList = dataList.sort((a: Contact, b: Contact) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setContacts(sortedList);
        } catch (error) {
            console.error('Lỗi tải danh sách phản hồi:', error);
            toast.error('Không thể tải dữ liệu phản hồi!');
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM XỬ LÝ CẬP NHẬT TRẠNG THÁI ---
    const handleUpdateStatus = async (status: ContactStatus) => {
        if (!selectedContact) return;
        setIsUpdatingStatus(true);
        try {
            await contactService.update(selectedContact.id, { status });
            toast.success('Đã cập nhật trạng thái xử lý!');

            // Cập nhật lại UI không cần fetch lại
            setSelectedContact({ ...selectedContact, status });
            setContacts(contacts.map(c => c.id === selectedContact.id ? { ...c, status } : c));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái!');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // --- HÀM XỬ LÝ XÓA ---
    const handleDeleteConfirm = async () => {
        if (!contactToDelete) return;
        setIsDeleting(true);
        try {
            await contactService.delete(contactToDelete.id);
            setContactToDelete(null);
            fetchContacts();
            toast.success('Xóa phản hồi thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể xóa phản hồi lúc này!");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- BỘ LỌC VÀ HIỂN THỊ UI ---
    const filteredContacts = contacts.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    const formatDate = (isoString: string) => {
        if (!isoString) return '—';
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(isoString));
    };

    const getSubjectBadge = (subject: Subject) => {
        if (subject === 'LOST_ITEMS') {
            return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">Báo mất đồ</span>;
        }
        return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">Góp ý / Phản hồi</span>;
    };

    return (
        <div className="flex flex-col gap-6 relative">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Mail className="w-7 h-7 text-blue-600" /> Quản lý Phản hồi
                    </h1>
                    <p className="text-[13px] text-slate-500 mt-1">Tiếp nhận và xử lý ý kiến, báo cáo từ khách hàng.</p>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text" placeholder="Tìm theo tên, email hoặc số điện thoại..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div className="text-[13px] font-medium text-slate-500">
                        Hệ thống ghi nhận: <span className="font-bold text-slate-900">{totalItems}</span> phản hồi
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-1/3">Khách hàng</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chủ đề</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ngày gửi</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && (
                                <tr>
                                    {/* Sửa colSpan thành 5 */}
                                    <td colSpan={5} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                                        <p className="text-[13px] font-medium text-slate-500">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredContacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 px-5">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[14px] font-bold text-slate-800 truncate">{contact.full_name}</span>
                                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                                {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</span>}
                                                {contact.email && <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{contact.email}</span>}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3 px-5">
                                        {getSubjectBadge(contact.subject)}
                                    </td>

                                    <td className="py-3 px-5 text-center">
                                        {contact.status === 'RESOLVED' ? (
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-fit mx-auto">
                                                <CheckCircle2 className="w-3 h-3" /> Đã xử lý
                                            </span>
                                        ) : (
                                            <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-fit mx-auto">
                                                <AlertTriangle className="w-3 h-3" /> Chờ xử lý
                                            </span>
                                        )}
                                    </td>

                                    <td className="py-3 px-5 text-[12px] font-medium text-slate-500">
                                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(contact.created_at)}</div>
                                    </td>

                                    <td className="py-3 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity will-change-opacity">
                                            <button onClick={() => setSelectedContact(contact)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setContactToDelete(contact)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filteredContacts.length === 0 && (
                                <tr>
                                    {/* Sửa colSpan thành 5 */}
                                    <td colSpan={5} className="py-12 text-center text-[13px] text-slate-500">
                                        Không tìm thấy dữ liệu phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {/* ========================================= */}
            {/* MODAL CHI TIẾT & XỬ LÝ PHẢN HỒI           */}
            {/* ========================================= */}
            <Modal isOpen={!!selectedContact} onClose={() => setSelectedContact(null)} title="Chi tiết Phản hồi" maxWidth="3xl">
                {selectedContact && (
                    <div className="flex flex-col">
                        <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar flex flex-col gap-6">

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* CỘT TRÁI: Thông tin khách hàng */}
                                <div className="w-full md:w-1/3 flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 h-fit">
                                    <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Thông tin liên hệ</h3>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] text-slate-500">Họ và tên</span>
                                        <span className="text-[14px] font-semibold text-slate-900 flex items-center gap-2"><UserIcon className="w-4 h-4 text-slate-400" /> {selectedContact.full_name}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] text-slate-500">Số điện thoại</span>
                                        <span className="text-[14px] font-medium text-slate-800 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {selectedContact.phone || 'Không cung cấp'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] text-slate-500">Email</span>
                                        <span className="text-[14px] font-medium text-slate-800 flex items-center gap-2 break-all"><Mail className="w-4 h-4 text-slate-400" /> {selectedContact.email || 'Không cung cấp'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-2 pt-4 border-t border-slate-200">
                                        <span className="text-[11px] text-slate-500">Thời gian gửi</span>
                                        <span className="text-[13px] font-medium text-slate-700 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> {formatDate(selectedContact.created_at)}</span>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: Nội dung tin nhắn & Trạng thái */}
                                <div className="w-full md:w-2/3 flex flex-col gap-5">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                        <span className="text-[14px] font-bold text-slate-800">Chủ đề:</span>
                                        {getSubjectBadge(selectedContact.subject)}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <span className="text-[14px] font-bold text-slate-800">Nội dung tin nhắn:</span>
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-[14px] text-slate-700 leading-relaxed min-h-[120px] whitespace-pre-wrap">
                                            {selectedContact.message}
                                        </div>
                                    </div>

                                    {/* KHU VỰC XỬ LÝ TRẠNG THÁI */}
                                    <div className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${selectedContact.status === 'RESOLVED' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[13px] font-bold text-slate-800">Tiến độ xử lý</span>
                                            {selectedContact.status === 'RESOLVED' ? (
                                                <span className="text-[12px] text-emerald-700">Đã được giải quyết bởi <strong className="font-semibold">{selectedContact.resolved_by_user?.full_name || 'Admin'}</strong></span>
                                            ) : (
                                                <span className="text-[12px] text-amber-700">Phản hồi này đang chờ được xử lý.</span>
                                            )}
                                        </div>

                                        {selectedContact.status === 'PENDING' ? (
                                            <button
                                                onClick={() => handleUpdateStatus('RESOLVED')}
                                                disabled={isUpdatingStatus}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors shadow-sm whitespace-nowrap"
                                            >
                                                {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                Đánh dấu Đã xử lý
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUpdateStatus('PENDING')}
                                                disabled={isUpdatingStatus}
                                                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-300 text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                                            >
                                                {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                                                Mở lại yêu cầu
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50 rounded-b-2xl">
                            <button onClick={() => setSelectedContact(null)} className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                Đóng lại
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ========================================= */}
            {/* MODAL CẢNH BÁO XÓA                        */}
            {/* ========================================= */}
            <Modal isOpen={!!contactToDelete} onClose={() => setContactToDelete(null)} maxWidth="sm" hideHeader={true}>
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
                    <p className="text-[13px] text-slate-500">
                        Bạn có chắc chắn muốn xóa phản hồi của <strong className="text-slate-800">{contactToDelete?.full_name}</strong> không? Hành động này sẽ không thể hoàn tác.
                    </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button onClick={() => setContactToDelete(null)} disabled={isDeleting} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Hủy bỏ</button>
                    <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:bg-red-400 shadow-sm">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Xóa ngay
                    </button>
                </div>
            </Modal>
        </div>
    );
}