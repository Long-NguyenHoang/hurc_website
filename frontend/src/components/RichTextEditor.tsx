'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useRef, useCallback } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import MediaPicker from './MediaPicker';

const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        const QuillComponent = ({ forwardedRef, ...props }: any) => (
            <RQ ref={forwardedRef} {...props} />
        );
        QuillComponent.displayName = 'ReactQuill';
        return QuillComponent;
    },
    { ssr: false }
);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const reactQuillRef = useRef<any>(null);
    const cursorPosition = useRef<number>(0); // STATE: Lưu vị trí con trỏ chuột
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

    // 1. Chặn nút Image mặc định, lưu vị trí con trỏ rồi mới mở Modal
    const imageHandler = useCallback(() => {
        const editor = reactQuillRef.current?.getEditor();
        if (editor) {
            const range = editor.getSelection();
            // Nếu không tìm thấy con trỏ, mặc định chèn ở cuối bài viết
            cursorPosition.current = range ? range.index : editor.getLength();
        }
        setIsMediaPickerOpen(true);
    }, []);

    // 2. Nhận URL ảnh từ MediaPicker và chèn vào đúng vị trí đã lưu
    const handleSelectMedia = (imageUrl: string) => {
        const editor = reactQuillRef.current?.getEditor();
        if (editor && imageUrl) {
            // Chèn ảnh vào vị trí cursorPosition
            editor.insertEmbed(cursorPosition.current, 'image', imageUrl);

            // Đẩy con trỏ sang bên phải ảnh để người dùng có thể gõ chữ tiếp
            // editor.setSelection(cursorPosition.current + 1);
            editor.setSelection(cursorPosition.current + imageUrl.length);
        }
        setIsMediaPickerOpen(false); // Đóng modal
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler // Trỏ nút Image về hàm tùy chỉnh của chúng ta
            }
        }
    }), [imageHandler]);

    return (
        <>
            <div className="bg-white rounded-xl border border-slate-200 relative z-0">
                <ReactQuill
                    ref={reactQuillRef}
                    theme="snow"
                    value={value || ''}
                    onChange={onChange}
                    modules={modules}
                    placeholder={placeholder || 'Nhập nội dung chi tiết...'}
                    className="h-[250px] mb-12"
                />
            </div>

            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleSelectMedia}
            />
        </>
    );
}