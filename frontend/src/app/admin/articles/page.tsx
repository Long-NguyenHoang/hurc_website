'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, Save, Maximize2, AlertTriangle, Image as ImageIcon, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { articleService, Article, ArticleStatus } from '@/services/article.service';
import Modal from '@/components/Modal';
import ImageLightbox from '@/components/ImageLightbox';
import MediaPicker from '@/components/MediaPicker';
import RichTextEditor from '@/components/RichTextEditor';
import Pagination from '@/components/Pagination';

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- STATE MODAL THÊM/SỬA ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        status: 'DRAFT' as ArticleStatus,
        thumbnail_id: '',
        thumbnail_url: '',
        published_at: ''
    });

    const [isThumbnailPickerOpen, setIsThumbnailPickerOpen] = useState(false);
    const [errors, setErrors] = useState<{ title?: string; content?: string; thumbnail?: string; published_at?: string }>({});

    // --- STATE MODAL XÓA & LIGHTBOX ---
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchArticles();
    }, [currentPage]);

    const fetchArticles = async () => {
        setIsLoading(true);
        try {
            const response: any = await articleService.getAllAdmin({ page: currentPage, limit: 20 });
            // Xử lý dữ liệu trả về (hỗ trợ cả mảng thường và mảng có phân trang)
            const dataList = response?.data?.items || response?.data?.data || (Array.isArray(response) ? response : response?.data || []);

            const meta = response?.data?.meta || response?.meta;
            if (meta) {
                setTotalPages(meta.lastPage || Math.ceil(meta.total / meta.limit) || 1);
            }

            // Sắp xếp bài mới nhất lên đầu
            const sortedList = dataList.sort((a: Article, b: Article) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setArticles(sortedList);
        } catch (error) {
            console.error('Lỗi tải danh sách bài viết:', error);
            toast.error('Không thể tải danh sách Tin tức!');
        } finally {
            setIsLoading(false);
        }
    };

    const formatForDateTimeInput = (isoString?: string | null) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    // --- VALIDATION ---
    const validateForm = () => {
        const newErrors: { title?: string; content?: string; thumbnail?: string; published_at?: string } = {};
        let isValid = true;

        if (!formData.title.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
            isValid = false;
        }

        const strippedContent = formData.content.replace(/(<([^>]+)>)/gi, "").trim();
        if (!strippedContent) {
            newErrors.content = 'Vui lòng nhập nội dung bài viết';
            isValid = false;
        }

        if (!formData.thumbnail_url) {
            newErrors.thumbnail = 'Vui lòng chọn ảnh đại diện (Thumbnail)';
            isValid = false;
        }

        if (formData.status === 'SCHEDULED' && !formData.published_at) {
            newErrors.published_at = 'Vui lòng chọn thời gian hẹn giờ xuất bản';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({
            title: '', summary: '', content: '', status: 'DRAFT',
            thumbnail_id: '', thumbnail_url: '', published_at: ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEdit = (article: Article) => {
        setEditingId(article.id);
        setFormData({
            title: article.title,
            summary: article.summary || '',
            content: article.content,
            status: article.status,
            thumbnail_id: article.thumbnail?.id || '',
            thumbnail_url: article.thumbnail?.url || '',
            published_at: formatForDateTimeInput(article.published_at)
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
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('summary', formData.summary);
            submitData.append('content', formData.content);
            submitData.append('status', formData.status);

            if (formData.thumbnail_id) {
                submitData.append('thumbnail_id', formData.thumbnail_id);
            }

            if (formData.status === 'SCHEDULED' && formData.published_at) {
                submitData.append('published_at', new Date(formData.published_at).toISOString());
            } else if (formData.status === 'PUBLISHED') {
                // Giữ nguyên giờ cũ nếu có, ngược lại gán giờ hiện tại
                if (formData.published_at) {
                    submitData.append('published_at', new Date(formData.published_at).toISOString());
                } else {
                    submitData.append('published_at', new Date().toISOString());
                }
            }

            if (editingId) {
                await articleService.update(editingId, submitData);
                toast.success('Cập nhật bài viết thành công!');
            } else {
                await articleService.create(submitData);
                toast.success('Thêm bài viết mới thành công!');
            }

            setIsModalOpen(false);
            fetchArticles();
        } catch (error: any) {
            console.error("Lỗi khi lưu bài viết:", error);
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi lưu dữ liệu!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!articleToDelete) return;
        setIsDeleting(true);
        try {
            await articleService.delete(articleToDelete.id);
            setArticleToDelete(null);
            fetchArticles();
            toast.success('Xóa bài viết thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể xóa bài viết lúc này!");
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '—';
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }).format(new Date(isoString));
    };

    return (
        <div className="flex flex-col gap-6 relative">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Tin tức</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Viết bài, cập nhật thông báo và tin tức cho khách hàng.</p>
                </div>
                <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    Viết bài mới
                </button>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text" placeholder="Tìm kiếm tiêu đề bài viết..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div className="text-[13px] font-medium text-slate-500">
                        Tổng cộng: <span className="font-bold text-slate-900">{filteredArticles.length}</span> bài viết
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28 text-center">Ảnh Bìa</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiêu đề bài viết</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ngày tạo</th>
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
                            {!isLoading && filteredArticles.map((article) => (
                                <tr key={article.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 px-5">
                                        {article.thumbnail?.url ? (
                                            <div
                                                className="relative w-20 h-14 mx-auto rounded-lg border border-slate-200 overflow-hidden cursor-pointer group/img"
                                                onClick={() => setPreviewImageUrl(getImageUrl(article.thumbnail!.url))}
                                            >
                                                <img src={getImageUrl(article.thumbnail.url)} alt="Thumbnail" className="w-full h-full object-cover transform-gpu will-change-transform backface-hidden group-hover/img:scale-110 transition-transform duration-300" loading="lazy" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Maximize2 className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-20 h-14 mx-auto bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                                <ImageIcon className="w-5 h-5" />
                                            </div>
                                        )}
                                    </td>

                                    <td className="py-3 px-5">
                                        <span className="text-[14px] font-bold text-slate-900 block mb-1">{article.title}</span>
                                        <span className="text-[12px] text-slate-500 line-clamp-1">{article.summary || 'Không có tóm tắt'}</span>
                                    </td>

                                    <td className="py-3 px-5 text-center">
                                        {article.status === 'PUBLISHED' ? (
                                            <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider  flex items-center justify-center gap-1 w-max mx-auto">Đã Xuất Bản</span>
                                        ) : article.status === 'SCHEDULED' ? (
                                            <span className="bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-max mx-auto">Hẹn Giờ</span>
                                        ) : article.status === 'ARCHIVED' ? (
                                            <span className="bg-grey-50 text-grey-600 border border-grey-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-max mx-auto">Lưu Trữ</span>
                                        ) : (
                                            <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider  flex items-center justify-center gap-1 w-max mx-auto">Bản Nháp</span>
                                        )}
                                    </td>

                                    <td className="py-3 px-5 text-[12px] font-medium text-slate-500">
                                        {formatDate(article.created_at)}
                                    </td>

                                    <td className="py-3 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity will-change-opacity">
                                            <button onClick={() => handleOpenEdit(article)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setArticleToDelete(article)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* ========================================= */}
            {/* MODAL THÊM/SỬA BÀI VIẾT                   */}
            {/* ========================================= */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Cập nhật Bài viết' : 'Thêm Bài viết mới'} maxWidth="4xl">
                <form onSubmit={handleSubmit} noValidate className="flex flex-col">
                    <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh] custom-scrollbar">

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* CỘT TRÁI: Nhập liệu cơ bản (Chiếm 2 phần) */}
                            <div className="lg:col-span-2 flex flex-col gap-5">
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => {
                                            setFormData({ ...formData, title: e.target.value });
                                            if (errors.title) setErrors({ ...errors, title: undefined });
                                        }}
                                        className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${errors.title ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                                        placeholder="Nhập tiêu đề thật hấp dẫn..."
                                    />
                                    {errors.title && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tóm tắt ngắn (Summary)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                                        placeholder="Đoạn văn ngắn hiển thị ở trang chủ..."
                                    />
                                </div>
                            </div>

                            {/* CỘT PHẢI: Trạng thái & Ảnh bìa (Chiếm 1 phần) */}
                            <div className="flex flex-col gap-5">
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Trạng thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                                    >
                                        <option value="PUBLISHED">Xuất bản</option>
                                        <option value="SCHEDULED">Hẹn giờ đăng</option>
                                        <option value="DRAFT">Lưu nháp</option>
                                        <option value="ARCHIVED">Lưu trữ</option>
                                    </select>
                                </div>

                                {formData.status === 'SCHEDULED' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Thời gian đăng bài <span className="text-red-500">*</span></label>
                                        <input
                                            type="datetime-local"
                                            value={formData.published_at}
                                            onChange={(e) => {
                                                setFormData({ ...formData, published_at: e.target.value });
                                                if (errors.published_at) setErrors({ ...errors, published_at: undefined });
                                            }}
                                            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-[13px] outline-none transition-all ${errors.published_at ? 'border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100'}`}
                                        />
                                        {errors.published_at && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.published_at}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Ảnh bìa (Thumbnail) <span className="text-red-500">*</span></label>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text" readOnly
                                            value={formData.thumbnail_url}
                                            placeholder="Chưa có ảnh..."
                                            className={`flex-1 min-w-0 px-3 py-2.5 bg-slate-100 border rounded-xl text-[13px] text-slate-500 outline-none ${errors.thumbnail ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
                                        />
                                        <button
                                            type="button" onClick={() => setIsThumbnailPickerOpen(true)}
                                            className="px-3 py-2.5 bg-slate-800 text-white text-[12px] font-semibold rounded-xl hover:bg-slate-900 transition-colors shrink-0 whitespace-nowrap"
                                        >
                                            Chọn ảnh
                                        </button>
                                    </div>
                                    {errors.thumbnail && <p className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1.5"><AlertTriangle className="w-3 h-3" /> {errors.thumbnail}</p>}
                                </div>
                            </div>
                        </div>

                        {/* TRÌNH SOẠN THẢO CHIẾM TOÀN BỘ CHIỀU RỘNG */}
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Nội dung bài viết <span className="text-red-500">*</span></label>
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

                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                        <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSubmitting ? 'Đang lưu...' : 'Lưu bài viết'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ========================================= */}
            {/* MODAL CẢNH BÁO XÓA                        */}
            {/* ========================================= */}
            <Modal isOpen={!!articleToDelete} onClose={() => setArticleToDelete(null)} maxWidth="sm" hideHeader={true}>
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa Bài viết</h3>
                    <p className="text-[13px] text-slate-500">
                        Bạn có chắc chắn muốn xóa bài viết <strong className="text-slate-800">{articleToDelete?.title}</strong> không?
                    </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button onClick={() => setArticleToDelete(null)} disabled={isDeleting} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Hủy bỏ</button>
                    <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:bg-red-400">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Xóa ngay
                    </button>
                </div>
            </Modal>

            {/* ========================================= */}
            {/* CÁC COMPONENT PHỤ TRỢ                     */}
            {/* ========================================= */}
            <ImageLightbox imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} altText="Thumbnail Bài viết" />

            <MediaPicker
                isOpen={isThumbnailPickerOpen}
                onClose={() => setIsThumbnailPickerOpen(false)}
                onSelect={(media: any) => {
                    setFormData({
                        ...formData,
                        thumbnail_id: media.id,
                        thumbnail_url: media.url
                    });
                    if (errors.thumbnail) setErrors({ ...errors, thumbnail: undefined });
                    setIsThumbnailPickerOpen(false);
                }}
            />
        </div>
    );
}