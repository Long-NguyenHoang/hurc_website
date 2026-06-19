import { X } from 'lucide-react';

interface ImageLightboxProps {
    imageUrl: string | null;
    onClose: () => void;
    altText?: string;
}

export default function ImageLightbox({ imageUrl, onClose, altText = "Phóng to hình ảnh" }: ImageLightboxProps) {
    // Nếu không có ảnh thì không render gì cả
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm transition-all"
            onClick={onClose} // Bấm vào nền đen mờ sẽ đóng ảnh
        >
            <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">

                {/* Nút đóng (X) */}
                <button
                    onClick={onClose}
                    className="absolute -top-4 -right-4 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-200 transition-colors z-10"
                    title="Đóng"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Ảnh hiển thị */}
                <img
                    src={imageUrl}
                    alt={altText}
                    className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
                    onClick={(e) => e.stopPropagation()} // Chặn sự kiện click xuyên qua ảnh xuống nền đen
                />
            </div>
        </div>
    );
}