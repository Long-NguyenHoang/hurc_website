"use client";

import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { User, userService } from "@/services/user.service";
import { AlertTriangle, Edit2, Loader2, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";


export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'EDITOR',
        is_active: true,
    });

    const [errors, setErrors] = useState<{ full_name?: string; email?: string; password?: string }>({});

    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response: any = await userService.getAll({ page: currentPage, limit: 20 });
            const dataList = Array.isArray(response) ? response : response?.data || [];

            const meta = response?.data?.meta || response?.meta;
            if (meta) {
                setTotalPages(meta.lastPage || Math.ceil(meta.total / meta.limit) || 1);
            }

            setUsers(dataList)
        } catch (error) {
            console.error('Lỗi khi tải danh sách user: ', error);
            toast.error('Không thể tải danh sách tài khoản!');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: { full_name?: string; email?: string; password?: string } = {};
        let isValid = true;

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Vui lòng nhập họ và tên';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email đăng nhập';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không đúng định dạng';
            isValid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!editingId && !formData.password.trim()) {
            newErrors.password = 'Vui lòng nhập mật khẩu cho tài khoản mới';
            isValid = false;
        } else if (formData.password && !passwordRegex.test(formData.password)) {
            newErrors.password = 'Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    //  ---Xử lý Modal Thêm/sửa---
    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({
            full_name: '',
            email: '',
            password: '',
            role: 'EDITOR',
            is_active: true
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setEditingId(user.id);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            password: '',
            role: user.role,
            is_active: user.is_active
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại các trường bị lỗi!');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload: any = {
                full_name: formData.full_name,
                email: formData.email,
                role: formData.role,
                is_active: formData.is_active
            };
            if (formData.password) payload.password = formData.password;

            if (editingId) {
                await userService.update(editingId, payload);
                toast.success('Cập nhật tài khoản thành công!');
            } else {
                await userService.create(payload);
                toast.success('Thêm tài khoản mới thành công!');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi lưu dữ liệu!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await userService.delete(userToDelete.id);
            setUserToDelete(null);
            fetchUsers();
            toast.success('Xoá tài khoản thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể xoá tài khoản này!');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 relative">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Tài khoản</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Quản lý nhân sự có quyền truy cập vào hệ thống.</p>
                </div>
                <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    Thêm tài khoản
                </button>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text" placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="text-[13px] font-medium text-slate-500">
                        Tổng: <span className="font-bold text-slate-900">{filteredUsers.length}</span> người
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Họ và tên</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phân quyền</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                                        <p className="text-[13px] font-medium text-slate-500">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                                                {user.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-[13px] font-semibold text-slate-900">{user.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-[13px] font-medium text-slate-500">{user.email}</td>
                                    <td className="py-3 px-5">
                                        {user.role === 'ADMIN' ? (
                                            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">
                                                <ShieldCheck className="w-3 h-3" /> {user.role}
                                            </span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-5">
                                        {user.is_active ? (
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                                                Đã khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEdit(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setUserToDelete(user)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* ========================================= */}
            {/* MODAL THÊM/SỬA TÀI KHOẢN                  */}
            {/* ========================================= */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'} maxWidth="lg">
                {/* LƯU Ý: Đã thêm noValidate vào form để tắt Popup mặc định của HTML5 */}
                <form onSubmit={handleSubmit} noValidate className="flex flex-col">
                    <div className="p-6 flex flex-col gap-5">
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => {
                                    setFormData({ ...formData, full_name: e.target.value });
                                    if (errors.full_name) setErrors({ ...errors, full_name: undefined }); // Tắt lỗi khi user gõ
                                }}
                                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${errors.full_name ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                            />
                            {errors.full_name && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.full_name}</p>}
                        </div>
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email đăng nhập <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (errors.email) setErrors({ ...errors, email: undefined });
                                }}
                                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${errors.email ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                            />
                            {errors.email && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Mật khẩu {editingId && <span className="text-slate-400 font-normal">(Bỏ trống nếu không đổi)</span>} {!editingId && <span className="text-red-500">*</span>}</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: undefined });
                                }}
                                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${errors.password ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                                placeholder={editingId ? "••••••••" : "Nhập mật khẩu..."}
                            />
                            {errors.password && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Phân quyền <span className="text-red-500">*</span></label>
                            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer">
                                <option value="ADMIN">Quản trị viên (ADMIN)</option>
                                <option value="EDITOR">Biên tập viên (EDITOR)</option>
                                <option value="VIEWER">Người xem (VIEWER)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mt-2">
                            <div>
                                <label className="block text-[13px] font-bold text-slate-800">Trạng thái hoạt động</label>
                                <p className="text-[12px] text-slate-500 mt-0.5">Tắt để chặn người dùng này đăng nhập vào hệ thống.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-sm">
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSubmitting ? 'Đang lưu...' : 'Lưu tài khoản'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ========================================= */}
            {/* MODAL CẢNH BÁO XÓA                        */}
            {/* ========================================= */}
            <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} maxWidth="sm" hideHeader={true}>
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa tài khoản</h3>
                    <p className="text-[13px] text-slate-500">
                        Bạn có chắc chắn muốn xóa tài khoản <strong className="text-slate-800">{userToDelete?.full_name}</strong> không?
                    </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button onClick={() => setUserToDelete(null)} disabled={isDeleting} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Hủy bỏ</button>
                    <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:bg-red-400">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {isDeleting ? 'Đang xóa...' : 'Xóa ngay'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}