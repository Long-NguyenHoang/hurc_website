'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Upload, Maximize2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { mediaService } from '@/services/media.service';
import Modal from './Modal';
import ImageLightbox from './ImageLightbox';
import Pagination from './Pagination';

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: any) => void;
}

export default function MediaPicker({ isOpen, onClose, onSelect }: MediaPickerProps) {
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // --- STATE HIỂN THỊ LIGHTBOX PHÓNG TO ẢNH ---
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== debouncedSearch) {
                setDebouncedSearch(searchTerm);
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearch]);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen, currentPage, debouncedSearch]);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const response: any = await mediaService.getAll({
                page: currentPage,
                limit: 10,
                search: debouncedSearch
            });
            const dataList = response?.data?.items || response?.data?.data || (Array.isArray(response) ? response : response?.data || []);
            const meta = response?.data?.meta || response?.meta;
            if (meta) {
                setTotalPages(meta.lastPage || Math.ceil(meta.total / meta.limit) || 1);
            }
            // Sắp xếp ảnh mới nhất lên đầu
            const sortedList = dataList.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setMediaList(sortedList);
        } catch (error) {
            toast.error('Không thể tải danh sách hình ảnh');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File quá lớn, vui lòng chọn file dưới 10MB!");
            return;
        }
        setIsUploading(true);
        const loadingToast = toast.loading('Đang tải ảnh lên...');
        try {
            await mediaService.upload(file);
            toast.success('Tải ảnh lên thành công!', { id: loadingToast });
            fetchMedia();
        } catch (error) {
            toast.error('Lỗi khi tải ảnh lên!', { id: loadingToast });
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };



    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Thư viện hình ảnh" maxWidth="4xl">
                {/* Header Controls */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text" placeholder="Tìm kiếm theo tên file..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col items-end">
                        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-900 cursor-pointer transition-colors whitespace-nowrap shadow-sm">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isUploading ? 'Đang tải lên...' : 'Tải ảnh mới'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
                        </label>
                        <p className="text-[11px] text-slate-500 mt-1.5">* Dung lượng tối đa: 500KB</p>
                    </div>
                </div>

                {/* Danh sách lưới hình ảnh */}
                <div className="flex flex-col bg-slate-50/50">
                    <div className="p-5 h-[50vh] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                                <span className="text-[13px] font-medium">Đang tải thư viện...</span>
                            </div>
                        ) : mediaList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <ImageIcon className="w-12 h-12 mb-3 text-slate-300" />
                                <span className="text-[13px] font-medium">Không tìm thấy hình ảnh nào.</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {mediaList.map((media) => (
                                    <div key={media.id} className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-400 hover:shadow-md transition-all">

                                        {/* Khối hiển thị hình ảnh & Các nút thao tác */}
                                        <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                            <img
                                                src={getImageUrl(media.url)}
                                                alt={media.original_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 transform-gpu will-change-transform backface-hidden"
                                                loading="lazy"
                                            />

                                            {/* Lớp phủ đen xuất hiện khi đưa chuột vào (Hover) */}
                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-[1px]">

                                                {/* NÚT XEM PHÓNG TO */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImageUrl(getImageUrl(media.url));
                                                    }}
                                                    className="p-2.5 bg-white/20 text-white rounded-lg hover:bg-white hover:text-slate-900 transition-all shadow-sm"
                                                    title="Xem kích thước đầy đủ"
                                                >
                                                    <Maximize2 className="w-4 h-4" />
                                                </button>

                                                {/* NÚT CHỌN ẢNH */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelect(media);
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white text-[12px] font-bold rounded-lg hover:bg-blue-500 transition-all shadow-sm"
                                                >
                                                    Chọn
                                                </button>
                                            </div>
                                        </div>

                                        {/* Khối thông tin Tên ảnh bên dưới */}
                                        <div className="p-2.5 border-t border-slate-100 flex flex-col bg-white">
                                            <span
                                                className="text-[11px] font-medium text-slate-700 truncate w-full"
                                                title={media.original_name}
                                            >
                                                {media.original_name || 'image.jpg'}
                                            </span>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* KHỐI PHÂN TRANG */}
                    {!isLoading && totalPages > 1 && (
                        <div className="pb-4 pt-2 border-t border-slate-100 bg-white">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/* HIỂN THỊ LIGHTBOX PHÓNG TO ẢNH (Bọc ngoài Modal) */}
            <ImageLightbox
                imageUrl={previewImageUrl}
                onClose={() => setPreviewImageUrl(null)}
                altText="Xem ảnh chi tiết"
            />
        </>
    );
}