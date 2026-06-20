'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Trash2, Loader2, Image as ImageIcon, Maximize2, AlertTriangle, File as FileIcon, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import ImageLightbox from '@/components/ImageLightbox';
import { mediaService, Media } from '@/services/media.service';

export default function MediaPage() {
    const [medias, setMedias] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // STATE UPLOAD
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // STATE ĐỔI TÊN
    const [editingMedia, setEditingMedia] = useState<Media | null>(null);
    const [newName, setNewName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    // STATE XÓA & XEM ẢNH
    const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const response: any = await mediaService.getAll();
            const dataList = Array.isArray(response) ? response : response?.data || [];
            // Sắp xếp mới nhất lên đầu
            const sortedList = dataList.sort((a: Media, b: Media) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setMedias(sortedList);
        } catch (error) {
            console.error('Lỗi khi tải media:', error);
            toast.error('Không thể tải danh sách hình ảnh!');
        } finally {
            setIsLoading(false);
        }
    };

    // --- XỬ LÝ UPLOAD FILE ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate dung lượng (VD: max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File quá lớn, vui lòng chọn file dưới 5MB!");
            return;
        }

        setIsUploading(true);
        const loadingToast = toast.loading('Đang tải hình ảnh lên...');

        try {
            await mediaService.upload(file);
            toast.success('Tải ảnh lên thành công!', { id: loadingToast });
            fetchMedia(); // Tải lại danh sách
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Tải ảnh thất bại!', { id: loadingToast });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    // --- XỬ LÝ ĐỔI TÊN ---
    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMedia || !newName.trim()) return;

        setIsSavingName(true);
        try {
            await mediaService.update(editingMedia.id, { original_name: newName });
            toast.success('Đổi tên file thành công!');
            setEditingMedia(null);
            fetchMedia();
        } catch (error) {
            toast.error('Đổi tên thất bại!');
        } finally {
            setIsSavingName(false);
        }
    };

    // --- XỬ LÝ XÓA ---
    const handleDeleteConfirm = async () => {
        if (!mediaToDelete) return;
        setIsDeleting(true);
        try {
            await mediaService.delete(mediaToDelete.id);
            setMediaToDelete(null);
            fetchMedia();
            toast.success('Xóa file thành công!');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Không thể xóa file lúc này!");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- HÀM PHỤ TRỢ ---
    const filteredMedias = medias.filter(m => m.original_name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (isoString: string) => {
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoString));
    };

    return (
        <div className="flex flex-col gap-6 relative">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thư viện Media</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Quản lý toàn bộ hình ảnh và tài liệu tải lên hệ thống.</p>
                </div>

                {/* NÚT UPLOAD FILE ẨN */}
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploading ? 'Đang tải lên...' : 'Tải lên hình ảnh'}
                    </button>
                </div>
            </div>

            {/* BOX MAIN */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                {/* TOOLBAR TÌM KIẾM */}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text" placeholder="Tìm kiếm theo tên file..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                    <div className="text-[13px] font-medium text-slate-500">
                        Tổng: <span className="font-bold text-slate-900">{filteredMedias.length}</span> files
                    </div>
                </div>

                {/* GRID HIỂN THỊ HÌNH ẢNH */}
                <div className="p-5 flex-1 bg-slate-50/30">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                            <p className="text-[13px] text-slate-500 font-medium">Đang tải thư viện...</p>
                        </div>
                    ) : filteredMedias.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-[14px] font-semibold text-slate-700">Chưa có hình ảnh nào</h3>
                            <p className="text-[13px] text-slate-500 mt-1 mb-4">Bạn có thể tải ảnh lên để sử dụng cho bài viết hoặc nhà ga.</p>
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[13px] font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                Tải lên ngay
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredMedias.map((media) => (
                                <div key={media.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all flex flex-col">

                                    {/* Khu vực Thumbnail */}
                                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                        {media.mime_type?.startsWith('image/') ? (
                                            <img
                                                src={getImageUrl(media.url)}
                                                alt={media.original_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <FileIcon className="w-10 h-10" />
                                            </div>
                                        )}

                                        {/* Overlay Đen chứa Nút Xem/Sửa/Xóa (Hiện khi hover) */}
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                            {media.mime_type?.startsWith('image/') && (
                                                <button onClick={() => setPreviewImageUrl(getImageUrl(media.url))} className="w-8 h-8 bg-white/90 hover:bg-white text-slate-800 rounded-full flex items-center justify-center transition-colors" title="Phóng to">
                                                    <Maximize2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => { setEditingMedia(media); setNewName(media.original_name); }} className="w-8 h-8 bg-blue-500/90 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors" title="Đổi tên">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setMediaToDelete(media)} className="w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors" title="Xóa">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Thông tin File */}
                                    <div className="p-3 border-t border-slate-100">
                                        <p className="text-[12px] font-semibold text-slate-800 truncate" title={media.original_name}>
                                            {media.original_name}
                                        </p>
                                        <div className="flex items-center justify-between mt-1 text-[11px] font-medium text-slate-500">
                                            <span>{formatSize(media.size)}</span>
                                            <span>{formatDate(media.created_at)}</span>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================= */}
            {/* MODAL ĐỔI TÊN FILE                        */}
            {/* ========================================= */}
            <Modal isOpen={!!editingMedia} onClose={() => setEditingMedia(null)} title="Đổi tên file" maxWidth="sm">
                <form onSubmit={handleSaveName}>
                    <div className="p-6">
                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tên hiển thị mới <span className="text-red-500">*</span></label>
                        <input
                            type="text" required autoFocus
                            value={newName} onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                        <button type="button" onClick={() => setEditingMedia(null)} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={isSavingName || !newName.trim()} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400">
                            {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu tên
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ========================================= */}
            {/* MODAL CẢNH BÁO XÓA                        */}
            {/* ========================================= */}
            <Modal isOpen={!!mediaToDelete} onClose={() => setMediaToDelete(null)} maxWidth="sm" hideHeader={true}>
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa File</h3>
                    <p className="text-[13px] text-slate-500">
                        Bạn có chắc muốn xóa file <strong className="text-slate-800">{mediaToDelete?.original_name}</strong>?
                    </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button onClick={() => setMediaToDelete(null)} disabled={isDeleting} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Hủy bỏ</button>
                    <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:bg-red-400">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Xóa vĩnh viễn
                    </button>
                </div>
            </Modal>

            {/* ========================================= */}
            {/* MODAL PHÓNG TO ẢNH (LIGHTBOX)             */}
            {/* ========================================= */}
            <ImageLightbox imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} altText="Phóng to Media" />

        </div>
    );
}