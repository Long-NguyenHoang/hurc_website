'use client'

import { Station, stationService } from "@/services/station.service"
import { Edit2, Image as ImageIcon, Loader2, MapPin, Plus, Search, Trash2, X, Save, Upload, Maximize2, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react"
import RichTextEditor from '@/components/RichTextEditor';
import Modal from '@/components/Modal';
import ImageLightbox from '@/components/ImageLightbox';
import toast from 'react-hot-toast';

export default function StationPage() {
    const [stations, setStations] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        content: '',
        display_order: 0,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    const [stationToDelete, setStationToDelete] = useState<Station | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load data
    useEffect(() => {
        fetchStations();
    }, []);

    // Lấy danh sách nhà ga
    const fetchStations = async () => {
        setIsLoading(true);
        try {
            const response: any = await stationService.getAllAdmin();
            const dataList = Array.isArray(response) ? response : response?.data || [];
            const sortedList = dataList.sort((a: Station, b: Station) => a.display_order - b.display_order);
            setStations(sortedList);
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhà ga: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ---Các hàm xử lý Modal---
    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ name: '', code: '', content: '', display_order: stations.length + 1 });
        setSelectedFile(null);
        setIsModalOpen(true);
    }

    const handleOpenEdit = (station: Station) => {
        setEditingId(station.id);
        setFormData({
            name: station.name,
            code: station.code,
            content: station.content || '',
            display_order: station.display_order
        });
        setSelectedFile(null);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Đóng gói dữ liệu thành FormData
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('code', formData.code);
            submitData.append('display_order', formData.display_order.toString());
            if (formData.content) {
                submitData.append('content', formData.content);
            }
            if (selectedFile) {
                submitData.append('file', selectedFile);
            }

            if (editingId) {
                await stationService.update(editingId, submitData);
                toast.success('Cập nhật nhà ga thành công!');
            } else {
                await stationService.create(submitData);
                toast.success('Thêm nhà ga mới thành công!');
            }

            setIsModalOpen(false);
            fetchStations();
        } catch (error: any) {
            console.error('Lỗi khi lưu nhà ga: ', error);
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi lưu dữ liệu!");
        } finally {
            setIsSubmitting(false);
        }

    };

    const handleDeleteConfirm = async () => {
        if (!stationToDelete) return;
        setIsDeleting(true);
        try {
            await stationService.delete(stationToDelete.id);
            setStationToDelete(null);
            fetchStations();
            toast.success('Xóa nhà ga thành công!');
        } catch (error: any) {
            console.error("Lỗi khi xóa nhà ga:", error);
            toast.error(error.response?.data?.message || "Không thể xóa nhà ga lúc này!");
        } finally {
            setIsDeleting(false);
        }
    };

    // Hàm search theo tên, code
    const filteredStations = stations.filter(
        (station) =>
            station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            station.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hàm format ngày giờ
    const formatDate = (isoString: string) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* HEADER CỦA TRANG */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Nhà ga</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Danh sách tất cả các nhà ga trên toàn tuyến.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm" onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4" />
                    Thêm nhà ga
                </button>
            </div>

            {/* BOX CHỨA BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">

                {/* THANH CÔNG CỤ (TOOLBAR) */}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tên hoặc mã ga..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="text-[13px] font-medium text-slate-500">
                        Tổng cộng: <span className="font-bold text-slate-900">{filteredStations.length}</span> ga
                    </div>
                </div>

                {/* BẢNG DỮ LIỆU (TABLE) */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-16">Thứ tự</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tên Nhà Ga</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mã Ga</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Lịch Trình</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ngày Tạo</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">

                            {/* TRẠNG THÁI ĐANG TẢI DỮ LIỆU */}
                            {isLoading && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                                        <p className="text-[13px] font-medium text-slate-500">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            )}

                            {/* TRẠNG THÁI KHÔNG TÌM THẤY DỮ LIỆU */}
                            {!isLoading && filteredStations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MapPin className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-[14px] font-semibold text-slate-700">Chưa có dữ liệu nhà ga</p>
                                        <p className="text-[13px] text-slate-500 mt-1">Hãy bấm "Thêm nhà ga" để bắt đầu.</p>
                                    </td>
                                </tr>
                            )}

                            {/* HIỂN THỊ DỮ LIỆU */}
                            {!isLoading && filteredStations.map((station) => (
                                <tr key={station.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 px-5 text-[13px] font-bold text-slate-500 text-center">
                                        {station.display_order}
                                    </td>
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-[13px] font-semibold text-slate-900 block">{station.name}</span>
                                                {/* Nếu có description/content ngắn có thể hiện ở đây, tạm thời ẩn */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-[13px] font-bold text-slate-600">
                                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] tracking-wider uppercase">
                                            {station.code}
                                        </span>
                                    </td>
                                    <td className="py-2 px-5 text-center">
                                        {station.schedule_image?.url ? (
                                            <div
                                                className="relative w-16 h-10 mx-auto rounded border border-slate-200 overflow-hidden cursor-pointer group/img"
                                                onClick={() => setPreviewImageUrl(getImageUrl(station.schedule_image!.url))}
                                            >
                                                <img
                                                    src={getImageUrl(station.schedule_image.url)}
                                                    alt={`Lịch trình ${station.name}`}
                                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                                                />
                                                {/* Lớp phủ đen mờ hiện lên khi hover */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Maximize2 className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] font-medium text-slate-400">Chưa có</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-5 text-[12px] font-medium text-slate-500">
                                        {formatDate(station.created_at)}
                                    </td>
                                    <td className="py-3 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa" onClick={() => handleOpenEdit(station)}>
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa" onClick={() => setStationToDelete(station)}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* ========================================= */}
            {/* GIAO DIỆN MODAL (POPUP) THÊM/SỬA NHÀ GA   */}
            {/* ========================================= */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? 'Cập nhật Nhà ga' : 'Thêm Nhà ga mới'}
                maxWidth="4xl"
            >
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* PHẦN RUỘT CHỨA CÁC Ô INPUT ĐÃ ĐƯỢC ĐƯA VÀO ĐẦY ĐỦ */}
                    <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh] custom-scrollbar">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tên Nhà ga <span className="text-red-500">*</span></label>
                                <input
                                    type="text" required value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                    placeholder="VD: Bến Thành"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Mã Ga <span className="text-red-500">*</span></label>
                                <input
                                    type="text" required value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] uppercase focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                                    placeholder="VD: BT"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Thứ tự hiển thị (Trên bản đồ)</label>
                            <input
                                type="number" min="0" required value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>

                        {/* Trình soạn thảo văn bản RichTextEditor */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Thông tin / Mô tả chi tiết</label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                            />
                        </div>

                        {/* Input File Upload */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Hình ảnh lịch trình (File)</label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 border-dashed text-slate-600 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-[13px] font-medium">Chọn File</span>
                                    <input
                                        type="file" accept="image/*" className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                                        }}
                                    />
                                </label>
                                {selectedFile && <span className="text-[12px] text-blue-600 font-medium truncate max-w-[200px]">{selectedFile.name}</span>}
                                {editingId && !selectedFile && <span className="text-[11px] text-slate-400">Bỏ trống để giữ nguyên ảnh cũ</span>}
                            </div>
                        </div>

                    </div>

                    {/* NÚT LƯU & HỦY Ở DƯỚI CÙNG */}
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                        <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSubmitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
                        </button>
                    </div>
                </form>
            </Modal>
            {/* ========================================= */}
            {/* MODAL (POPUP) PHÓNG TO ẢNH (LIGHTBOX)     */}
            {/* ========================================= */}
            <ImageLightbox
                imageUrl={previewImageUrl}
                onClose={() => setPreviewImageUrl(null)}
                altText="Lịch trình nhà ga"
            />

            {/* ========================================= */}
            {/* MODAL CẢNH BÁO XÓA NHÀ GA                 */}
            {/* ========================================= */}
            <Modal
                isOpen={!!stationToDelete} // Ép kiểu object thành boolean
                onClose={() => setStationToDelete(null)}
                maxWidth="sm"
                hideHeader={true} // Ẩn header mặc định để tự thiết kế cái icon tam giác cảnh báo
            >
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa nhà ga</h3>
                    <p className="text-[13px] text-slate-500">
                        Bạn có chắc chắn muốn xóa ga <strong className="text-slate-800">{stationToDelete?.name}</strong> không? Hành động này sẽ không thể hoàn tác.
                    </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button onClick={() => setStationToDelete(null)} disabled={isDeleting} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Hủy bỏ</button>
                    <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:bg-red-400">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {isDeleting ? 'Đang xóa...' : 'Xóa ngay'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}