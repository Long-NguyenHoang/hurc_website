'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { mediaService, Media } from '@/services/media.service';

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: Media) => void;
}

export default function MediaPicker({ isOpen, onClose, onSelect }: MediaPickerProps) {
    const [medias, setMedias] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // STATE UPLOAD ẢNH MỚI
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Chỉ gọi API fetch ảnh khi Modal được mở ra
    useEffect(() => {
        if (isOpen) {
            fetchMedia();
            setSearchTerm(''); // Xóa từ khóa tìm kiếm cũ khi mở lại
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const response: any = await mediaService.getAll();
            const dataList = Array.isArray(response) ? response : response?.data || [];
            // Lọc ra chỉ lấy file ảnh (image/*) và sắp xếp mới nhất lên đầu
            const imageList = dataList
                .filter((m: Media) => m.mime_type?.startsWith('image/'))
                .sort((a: Media, b: Media) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setMedias(imageList);
        } catch (error) {
            console.error('Lỗi khi tải media:', error);
            toast.error('Không thể tải danh sách hình ảnh!');
        } finally {
            setIsLoading(false);
        }
    };

    // HÀM XỬ LÝ KHI NGƯỜI DÙNG BẤM TẢI ẢNH MỚI NGAY TRONG MODAL
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File quá lớn, vui lòng chọn file dưới 5MB!");
            return;
        }

        setIsUploading(true);
        const loadingToast = toast.loading('Đang tải hình ảnh lên...');

        try {
            const response: any = await mediaService.upload(file);
            toast.success('Tải ảnh lên thành công!', { id: loadingToast });

            // Mẹo cực hay: Thử lấy URL của ảnh vừa upload từ kết quả API trả về
            // (Thường API NestJS sẽ trả về object Media vừa được tạo)
            const newMediaData = response?.data || response;

            if (newMediaData && newMediaData.url) {
                // Nếu lấy được URL -> Tự động chèn luôn vào bài viết và đóng Modal
                onSelect(newMediaData);
            } else {
                // Nếu không lấy được URL -> Tải lại danh sách để hiển thị ảnh mới ở đầu lưới
                fetchMedia();
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Tải ảnh thất bại!', { id: loadingToast });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input để có thể chọn lại file đó
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    const filteredMedias = medias.filter(m =>
        m.original_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thư viện hình ảnh" maxWidth="4xl">
            <div className="flex flex-col h-[65vh]">

                {/* THANH CÔNG CỤ (TÌM KIẾM + NÚT UPLOAD) */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">

                    <div className="relative w-full max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm ảnh đã có..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <button
                            type="button" // Ngăn form bên ngoài submit
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isUploading ? 'Đang tải lên...' : 'Tải ảnh mới lên'}
                        </button>
                    </div>

                </div>

                {/* LƯỚI HIỂN THỊ ẢNH */}
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/30">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                            <p className="text-[13px] text-slate-500 font-medium">Đang tải thư viện...</p>
                        </div>
                    ) : filteredMedias.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ImageIcon className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-[14px] font-semibold text-slate-700">Không tìm thấy ảnh nào</p>
                            <p className="text-[13px] text-slate-500 mt-1">Hãy bấm nút "Tải ảnh mới lên" ở góc phải để thêm ảnh.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filteredMedias.map((media) => (
                                <div
                                    key={media.id}
                                    onClick={() => onSelect(media)}
                                    className="group relative aspect-square bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-200 transition-all"
                                >
                                    <img
                                        src={getImageUrl(media.url)}
                                        alt={media.original_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Lớp phủ khi hover báo hiệu có thể click chọn */}
                                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm transform scale-90 group-hover:scale-100 transition-transform">
                                            Chọn ảnh này
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </Modal>
    );
}