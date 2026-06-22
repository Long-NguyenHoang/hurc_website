'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, Save, Maximize2, AlertTriangle, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { bannerService, Banner } from '@/services/banner.service';
import Modal from '@/components/Modal';
import ImageLightbox from '@/components/ImageLightbox';
import MediaPicker from '@/components/MediaPicker'; // Đã import MediaPicker

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- STATE MODAL THÊM/SỬA ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Cập nhật formData để dùng id và url từ Media Library
    const [formData, setFormData] = useState({
        title: '',
        redirect_url: '',
        display_order: 0,
        is_active: true,
        image_id: '',
        image_url: ''
    });

    // STATE CHO MEDIAPICKER
    const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
    const [errors, setErrors] = useState<{ title?: string; file?: string }>({});

    // --- STATE MODAL XEM ẢNH & XÓA ---
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setIsLoading(true);
        try {
            const response: any = await bannerService.getAllAdmin();
            const dataList = Array.isArray(response) ? response : response?.data || [];
            const sortedList = dataList.sort((a: Banner, b: Banner) => a.display_order - b.display_order);
            setBanners(sortedList);
        } catch (error) {
            console.error('Lỗi tải danh sách banner:', error);
            toast.error('Không thể tải danh sách Banner!');
        } finally {
            setIsLoading(false);
        }
    };

    // --- VALIDATION ---
    const validateForm = () => {
        const newErrors: { title?: string; file?: string } = {};
        let isValid = true;

        if (!formData.title.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề Banner';
            isValid = false;
        }

        // Bắt lỗi nếu chưa chọn ảnh từ Media Library
        if (!formData.image_url) {
            newErrors.file = 'Vui lòng chọn hình ảnh cho Banner từ thư viện';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({
            title: '', redirect_url: '', display_order: banners.length + 1, is_active: true,
            image_id: '', image_url: ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEdit = (banner: Banner) => {
        setEditingId(banner.id);
        setFormData({
            title: banner.title,
            redirect_url: banner.redirect_url || '',
            display_order: banner.display_order,
            is_active: banner.is_active,
            image_id: banner.image?.id || '',
            image_url: banner.image?.url || ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin bị lỗi!');
            return;
        }

        setIsSubmitting(true);
        try {
            // Khởi tạo FormData để gửi lên NestJS (vì API của bạn đang dùng FileInterceptor)
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('display_order', formData.display_order.toString());
            submitData.append('is_active', formData.is_active ? 'true' : 'false');

            if (formData.redirect_url.trim()) {
                submitData.append('redirect_url', formData.redirect_url.trim());
            }

            // Gửi image_id của hình ảnh đã chọn lên Backend thay vì gửi File
            if (formData.image_id) {
                submitData.append('image_id', formData.image_id);
            }

            if (editingId) {
                await bannerService.update(editingId, submitData);
                toast.success('Cập nhật Banner thành công!');
            } else {
                await bannerService.create(submitData);
                toast.success('Thêm Banner mới thành công!');
            }

            setIsModalOpen(false);
            fetchBanners();
        } catch (error: any) {
            console.error("Lỗi khi lưu Banner:", error);
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi lưu dữ liệu!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!bannerToDelete) return;
        setIsDeleting(true);
        try {
            await bannerService.delete(bannerToDelete.id);
            setBannerToDelete(null);
            fetchBanners();
            toast.success('Xóa Banner thành công!');
        } catch (error: any) {
            console.error("Lỗi khi xóa Banner:", error);
            toast.error(error.response?.data?.message || "Không thể xóa Banner lúc này!");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- HÀM PHỤ TRỢ ---
    const filteredBanners = banners.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Banner</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Danh sách hình ảnh trình chiếu nổi bật trên ứng dụng.</p>
                </div>
                <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    Thêm Banner
                </button>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text" placeholder="Tìm kiếm tiêu đề Banner..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="text-[13px] font-medium text-slate-500">
                        Tổng cộng: <span className="font-bold text-slate-900">{filteredBanners.length}</span> Banner
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center w-16">Thứ tự</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-40 text-center">Hình Ảnh</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề & Link</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                                        <p className="text-[13px] font-medium text-slate-500">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredBanners.map((banner) => (
                                <tr key={banner.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 px-5 text-[13px] font-bold text-slate-500 text-center">{banner.display_order}</td>

                                    {/* THUMBNAIL BANNER */}
                                    <td className="py-3 px-5">
                                        {banner.image?.url ? (
                                            <div
                                                className="relative w-32 h-14 mx-auto rounded-lg border border-slate-200 overflow-hidden cursor-pointer group/img"
                                                onClick={() => setPreviewImageUrl(getImageUrl(banner.image!.url))}
                                            >
                                                <img src={getImageUrl(banner.image.url)} alt={banner.title} className="w-full h-full object-cover transform-gpu will-change-transform backface-hidden group-hover/img:scale-110 transition-transform duration-300" loading="lazy" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Maximize2 className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-14 mx-auto bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                                <ImageIcon className="w-5 h-5" />
                                            </div>
                                        )}
                                    </td>

                                    <td className="py-3 px-5">
                                        <span className="text-[14px] font-bold text-slate-900 block mb-1">{banner.title}</span>
                                        {banner.redirect_url ? (
                                            <a href={banner.redirect_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-700 hover:underline">
                                                <LinkIcon className="w-3 h-3" /> {banner.redirect_url}
                                            </a>
                                        ) : (
                                            <span className="text-[12px] text-slate-400">Không có đường dẫn</span>
                                        )}
                                    </td>

                                    <td className="py-3 px-5 text-center">
                                        {banner.is_active ? (
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">Hiển thị</span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">Đang ẩn</span>
                                        )}
                                    </td>

                                    <td className="py-3 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity will-change-opacity">
                                            <button onClick={() => handleOpenEdit(banner)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setBannerToDelete(banner)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
            {/* MODAL THÊM/SỬA BANNER                     */}
            {/* ========================================= */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Cập nhật Banner' : 'Thêm Banner mới'} maxWidth="lg">
                <form onSubmit={handleSubmit} noValidate className="flex flex-col">
                    <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh] custom-scrollbar">

                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tiêu đề Banner <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (errors.title) setErrors({ ...errors, title: undefined });
                                }}
                                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${errors.title ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                                placeholder="VD: Khuyến mãi vé tháng 10"
                            />
                            {errors.title && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Đường dẫn khi click (Tùy chọn)</label>
                            <input
                                type="url"
                                value={formData.redirect_url}
                                onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Thứ tự hiển thị</label>
                            <input
                                type="number" min="0" required
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                        </div>

                        {/* CHỌN HÌNH ẢNH TỪ MEDIA LIBRARY */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Hình ảnh Banner <span className="text-red-500">*</span></label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text" readOnly
                                    value={formData.image_url}
                                    placeholder="Chưa có hình ảnh nào được chọn..."
                                    className={`flex-1 px-3.5 py-2.5 bg-slate-100 border rounded-xl text-[13px] text-slate-500 outline-none ${errors.file ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
                                />
                                <button
                                    type="button" onClick={() => setIsCoverPickerOpen(true)}
                                    className="px-4 py-2.5 bg-slate-800 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-900 transition-colors shrink-0"
                                >
                                    Chọn từ Thư viện
                                </button>
                            </div>
                            {errors.file && <p className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1.5"><AlertTriangle className="w-3 h-3" /> {errors.file}</p>}
                        </div>

                        {/* NÚT BẬT/TẮT TRẠNG THÁI */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <div>
                                <label className="block text-[13px] font-bold text-slate-800">Trạng thái hiển thị</label>
                                <p className="text-[12px] text-slate-500 mt-0.5">Tắt để tạm ẩn Banner này khỏi ứng dụng.</p>
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
                        <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSubmitting ? 'Đang lưu...' : 'Lưu Banner'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ========================================= */}
            {/* MODAL CẢNH BÁO XÓA                        */}
            {/* ========================================= */}
            <Modal isOpen={!!bannerToDelete} onClose={() => setBannerToDelete(null)} maxWidth="sm" hideHeader={true}>
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa Banner</h3>
                    <p className="text-[13px] text-slate-500">
                        Bạn có chắc chắn muốn xóa Banner <strong className="text-slate-800">{bannerToDelete?.title}</strong> không?
                    </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button onClick={() => setBannerToDelete(null)} disabled={isDeleting} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Hủy bỏ</button>
                    <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:bg-red-400">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {isDeleting ? 'Đang xóa...' : 'Xóa ngay'}
                    </button>
                </div>
            </Modal>

            {/* ========================================= */}
            {/* MODAL PHÓNG TO ẢNH (LIGHTBOX)             */}
            {/* ========================================= */}
            <ImageLightbox imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} altText="Phóng to Banner" />

            {/* ========================================= */}
            {/* MODAL CHỌN ẢNH TỪ MEDIA LIBRARY           */}
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