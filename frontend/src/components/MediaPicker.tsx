'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Upload, Maximize2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { mediaService } from '@/services/media.service';
import Modal from './Modal';
import ImageLightbox from './ImageLightbox'; // Bổ sung import Component ImageLightbox

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: any) => void;
}

export default function MediaPicker({ isOpen, onClose, onSelect }: MediaPickerProps) {
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // --- STATE HIỂN THỊ LIGHTBOX PHÓNG TO ẢNH ---
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
            setSearchTerm(''); // Reset thanh tìm kiếm mỗi lần mở
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const response: any = await mediaService.getAll();
            const dataList = response?.data?.items || response?.data?.data || (Array.isArray(response) ? response : response?.data || []);
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
        setIsUploading(true);
        try {
            await mediaService.upload(file);
            toast.success('Tải ảnh lên thành công!');
            fetchMedia();
        } catch (error) {
            toast.error('Lỗi khi tải ảnh lên!');
        } finally {
            setIsUploading(false);
        }
    };

    // Lọc hình ảnh theo tên
    const filteredMedia = mediaList.filter(m =>
        (m.original_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Thư viện hình ảnh" maxWidth="4xl">
                {/* Header Controls */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên ảnh..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-[13px] border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all"
                        />
                    </div>

                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-900 cursor-pointer transition-colors whitespace-nowrap shrink-0 shadow-sm">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploading ? 'Đang tải lên...' : 'Tải ảnh mới'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
                    </label>
                </div>

                {/* Danh sách lưới hình ảnh */}
                <div className="p-5 h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                            <span className="text-[13px] font-medium">Đang tải thư viện...</span>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <ImageIcon className="w-12 h-12 mb-3 text-slate-300" />
                            <span className="text-[13px] font-medium">Không tìm thấy hình ảnh nào.</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredMedia.map((media) => (
                                <div key={media.id} className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-400 hover:shadow-md transition-all">

                                    {/* Khối hiển thị hình ảnh & Các nút thao tác */}
                                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                        <img
                                            src={getImageUrl(media.url)}
                                            alt={media.original_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />

                                        {/* Lớp phủ đen xuất hiện khi đưa chuột vào (Hover) */}
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-[1px]">

                                            {/* NÚT XEM PHÓNG TO */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Ngăn sự kiện click bị lọt ra ngoài
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
                                                    onSelect(media); // Gọi hàm trả về ảnh đã chọn
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