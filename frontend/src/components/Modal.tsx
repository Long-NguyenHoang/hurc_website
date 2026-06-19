import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;            // Trạng thái mở/đóng
    onClose: () => void;        // Hàm gọi khi bấm nút X hoặc bấm ra ngoài
    title?: string;             // Tiêu đề của Modal (Có thể không truyền nếu là modal cảnh báo)
    children: ReactNode;        // Phần lõi nội dung bên trong
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'; // Chỉnh độ rộng
    hideHeader?: boolean;       // Ẩn thanh header nếu muốn tự custom (ví dụ: Modal cảnh báo xóa)
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'lg',
    hideHeader = false
}: ModalProps) {
    if (!isOpen) return null;

    // Map độ rộng từ prop sang class của Tailwind
    const maxWidthClass = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
            {/* Background overlay click để đóng */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Khung Modal */}
            <div className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidthClass} flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10`}>

                {/* Header (Chỉ hiện khi hideHeader = false) */}
                {!hideHeader && (
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Nội dung bên trong (Children) */}
                {children}

            </div>
        </div>
    );
}