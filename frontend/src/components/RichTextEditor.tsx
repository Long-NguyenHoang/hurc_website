'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

// SIÊU QUAN TRỌNG: Tắt tính năng SSR của Next.js cho component này
// Nếu không có dòng này, Next.js sẽ báo lỗi 'document is not defined'
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    // Cấu hình các công cụ trên thanh Toolbar
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'], // Định dạng chữ
            [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Danh sách
            [{ 'align': [] }], // Căn lề
            ['link', 'image'], // Chèn Link, Ảnh, Video
            ['clean'] // Nút xóa format
        ],
    }), []);

    return (
        <div className="bg-white rounded-xl border border-slate-200">
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder || 'Nhập nội dung chi tiết...'}
                className="h-[200px] mb-10" // Cố định chiều cao và chừa khoảng trống cho toolbar
            />
        </div>
    );
}