'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Loader2, Save, Maximize2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { stationService, Station } from '@/services/station.service';
import RichTextEditor from '@/components/RichTextEditor';
import Modal from '@/components/Modal';
import ImageLightbox from '@/components/ImageLightbox';
import MediaPicker from '@/components/MediaPicker'; 
import { clearCacheByPath } from '@/actions/revalidate';

export default function StationsPage() {
    const [stations, setStations] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // --- STATE CHO MODAL THÊM/SỬA ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // CẬP NHẬT STATE: Bỏ selectedFile, thêm image_id và image_url
    const [formData, setFormData] = useState({
        name: '', code: '', content: '', display_order: 0,
        image_id: '', image_url: ''
    });

    const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);

    // STATE LƯU TRỮ LỖI VALIDATION
    const [errors, setErrors] = useState<{ name?: string; code?: string; content?: string; file?: string }>({});

    // --- STATE CHO MODAL XEM ẢNH & XÓA ---
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [stationToDelete, setStationToDelete] = useState<Station | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== debouncedSearch) {
                setDebouncedSearch(searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearch]);

    useEffect(() => {
        fetchStations();
    }, [debouncedSearch]);

    const fetchStations = async () => {
        setIsLoading(true);
        try {
            const response: any = await stationService.getAllAdmin({ search: debouncedSearch });
            const dataList = Array.isArray(response) ? response : response?.data || [];
            const sortedList = dataList.sort((a: Station, b: Station) => a.display_order - b.display_order);
            setStations(sortedList);
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhà ga:', error);
            toast.error('Không thể tải danh sách nhà ga!');
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM KIỂM TRA DỮ LIỆU (VALIDATION) ---
    const validateForm = () => {
        const newErrors: { name?: string; code?: string; content?: string; file?: string } = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên nhà ga';
            isValid = false;
        }

        if (!formData.code.trim()) {
            newErrors.code = 'Vui lòng nhập mã ga';
            isValid = false;
        }

        const strippedContent = formData.content.replace(/(<([^>]+)>)/gi, "").trim();
        if (!strippedContent) {
            newErrors.content = 'Vui lòng nhập nội dung mô tả chi tiết';
            isValid = false;
        }

        // Bắt buộc phải có ảnh lịch trình (Vì Edit cũng đã load ảnh cũ vào image_url rồi)
        if (!formData.image_url) {
            newErrors.file = 'Vui lòng chọn hình ảnh lịch trình từ thư viện';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // --- XỬ LÝ MODAL THÊM/SỬA ---
    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({
            name: '', code: '', content: '', display_order: stations.length + 1,
            image_id: '', image_url: ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEdit = (station: Station) => {
        setEditingId(station.id);
        setFormData({
            name: station.name,
            code: station.code,
            content: station.content || '',
            display_order: station.display_order,
            // Gán dữ liệu ảnh cũ của nhà ga
            image_id: station.schedule_image?.id || '',
            image_url: station.schedule_image?.url || ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại các thông tin bị lỗi!');
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('code', formData.code);
            submitData.append('display_order', formData.display_order.toString());
            if (formData.content) submitData.append('content', formData.content);

            // Gửi schedule_image_id lên API
            if (formData.image_id) {
                submitData.append('schedule_image_id', formData.image_id);
            }

            if (editingId) {
                await stationService.update(editingId, submitData);
                toast.success('Cập nhật nhà ga thành công!');
            } else {
                await stationService.create(submitData);
                toast.success('Thêm nhà ga mới thành công!');
            }

            // Xoá cache trang chủ (hiển thị nội dung nhà ga)
            await clearCacheByPath('/', 'page');
            // Xoá cache trang lịch chạy tàu (hiển thị hình ảnh lịch trình)
            await clearCacheByPath('/lich-chay-tau', 'page');

            setIsModalOpen(false);
            fetchStations();
        } catch (error: any) {
            console.error("Lỗi khi lưu nhà ga:", error);
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi lưu dữ liệu!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- XỬ LÝ XÓA NHÀ GA ---
    const handleDeleteConfirm = async () => {
        if (!stationToDelete) return;
        setIsDeleting(true);
        try {
            await stationService.delete(stationToDelete.id);
            setStationToDelete(null);

            await clearCacheByPath('/', 'page');
            await clearCacheByPath('/lich-chay-tau', 'page');

            fetchStations();
            toast.success('Xóa nhà ga thành công!');
        } catch (error: any) {
            console.error("Lỗi khi xóa nhà ga:", error);
            toast.error(error.response?.data?.message || "Không thể xóa nhà ga lúc này!");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- HÀM PHỤ TRỢ ---
    const filteredStations = stations;

    const formatDate = (isoString: string) => {
        if (!isoString) return '—';
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }).format(new Date(isoString));
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    return (
        <div className="flex flex-col gap-6 relative">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Nhà ga</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Danh sách tất cả các nhà ga trên toàn tuyến.</p>
                </div>
                <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    Thêm nhà ga
                </button>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text" placeholder="Tìm kiếm tên hoặc mã ga..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="text-[13px] font-medium text-slate-500">
                        Tổng cộng: <span className="font-bold text-slate-900">{filteredStations.length}</span> ga
                    </div>
                </div>

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
                            {isLoading && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                                        <p className="text-[13px] font-medium text-slate-500">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredStations.map((station) => (
                                <tr key={station.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 px-5 text-[13px] font-bold text-slate-500 text-center">{station.display_order}</td>
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="text-[13px] font-semibold text-slate-900 block">{station.name}</span>
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
                                                <img src={getImageUrl(station.schedule_image.url)} alt={`Lịch trình ${station.name}`} className="w-full h-full object-cover transform-gpu will-change-transform backface-hidden group-hover/img:scale-110 transition-transform duration-300" loading="lazy" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Maximize2 className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] font-medium text-slate-400">Chưa có</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-5 text-[12px] font-medium text-slate-500">{formatDate(station.created_at)}</td>
                                    <td className="py-3 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity will-change-opacity">
                                            <button onClick={() => handleOpenEdit(station)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setStationToDelete(station)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
            {/* MODAL THÊM/SỬA NHÀ GA                     */}
            {/* ========================================= */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Cập nhật Nhà ga' : 'Thêm Nhà ga mới'} maxWidth="4xl">
                <form onSubmit={handleSubmit} noValidate className="flex flex-col">
                    <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh] custom-scrollbar">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tên Nhà ga <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        if (errors.name) setErrors({ ...errors, name: undefined });
                                    }}
                                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${errors.name ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                                    placeholder="VD: Bến Thành"
                                />
                                {errors.name && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Mã Ga <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => {
                                        setFormData({ ...formData, code: e.target.value });
                                        if (errors.code) setErrors({ ...errors, code: undefined });
                                    }}
                                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] uppercase outline-none transition-all ${errors.code ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                                    placeholder="VD: BT"
                                />
                                {errors.code && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.code}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Thứ tự hiển thị (Trên bản đồ)</label>
                            <input
                                type="number" min="0" required value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>

                        {/* Trình soạn thảo văn bản RichTextEditor */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Thông tin / Mô tả chi tiết <span className="text-red-500">*</span></label>
                            <div className={`rounded-xl transition-all ${errors.content ? 'border border-red-500 ring-2 ring-red-100' : ''}`}>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(newContent) => {
                                        setFormData({ ...formData, content: newContent });
                                        if (errors.content) setErrors({ ...errors, content: undefined });
                                    }}
                                />
                            </div>
                            {errors.content && <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.content}</p>}
                        </div>

                        {/* CẬP NHẬT: Chọn ảnh từ MediaPicker */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Hình ảnh lịch trình <span className="text-red-500">*</span></label>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text" readOnly
                                    value={formData.image_url}
                                    placeholder="Chưa có ảnh lịch trình..."
                                    className={`flex-1 min-w-0 px-3 py-2.5 bg-slate-100 border rounded-xl text-[13px] text-slate-500 outline-none ${errors.file ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
                                />
                                <button
                                    type="button" onClick={() => setIsCoverPickerOpen(true)}
                                    className="px-3 py-2.5 bg-slate-800 text-white text-[12px] font-semibold rounded-xl hover:bg-slate-900 transition-colors shrink-0 whitespace-nowrap"
                                >
                                    Chọn ảnh
                                </button>
                            </div>
                            {errors.file && <p className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1.5"><AlertTriangle className="w-3 h-3" /> {errors.file}</p>}
                        </div>

                    </div>

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
            {/* MODAL CẢNH BÁO XÓA                        */}
            {/* ========================================= */}
            <Modal isOpen={!!stationToDelete} onClose={() => setStationToDelete(null)} maxWidth="sm" hideHeader={true}>
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

            {/* ========================================= */}
            {/* MODAL PHÓNG TO ẢNH (LIGHTBOX)             */}
            {/* ========================================= */}
            <ImageLightbox imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} altText="Lịch trình nhà ga" />

            {/* ========================================= */}
            {/* COMPONENT MEDIA PICKER                    */}
            {/* ========================================= */}
            <MediaPicker
                isOpen={isCoverPickerOpen}
                onClose={() => setIsCoverPickerOpen(false)}
                onSelect={(media: any) => {
                    setFormData({
                        ...formData,
                        image_id: media.id,
                        image_url: media.url
                    });
                    if (errors.file) setErrors({ ...errors, file: undefined });
                    setIsCoverPickerOpen(false);
                }}
            />

        </div>
    );
}