"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { articleService, Article } from "@/services/article.service";
import ArticleCard from "@/components/ArticleCard";

export default function NewsPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Quản lý phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Tự động cuộn lên khi chuyển trang

            try {
                const response: any = await articleService.getAllPublic({
                    page: currentPage,
                    limit: itemsPerPage
                });

                // Axios interceptor trả về payload: { data: Article[], meta: ... }
                // response.data ở đây là danh sách bài viết, response.meta là thông tin phân trang
                const list = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
                setArticles(list);

                // Khớp cấu trúc phân trang từ Backend NestJS
                const meta = response.meta;
                if (meta && meta.lastPage) {
                    setTotalPages(meta.lastPage);
                } else if (meta && meta.totalPages) {
                    setTotalPages(meta.totalPages);
                } else if (meta && meta.total) {
                    setTotalPages(Math.ceil(meta.total / (meta.limit || itemsPerPage)));
                } else {
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Lỗi tải danh sách tin tức:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, [currentPage]);

    const getVisiblePages = (current: number, total: number) => {
        // Nếu có 5 trang trở xuống, hiện tất cả không cần dấu ...
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        // Nếu đang ở những trang đầu (1, 2, 3)
        if (current <= 3) {
            return [1, 2, 3, 4, '...', total];
        }
        // Nếu đang ở những trang cuối
        if (current >= total - 2) {
            return [1, '...', total - 3, total - 2, total - 1, total];
        }
        // Nếu đang ở giữa
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    return (
        <div className="w-full bg-white min-h-[80vh] py-4 md:py-8">
            <div className="max-w-[120rem] mx-auto px-4 lg:px-[56px]">

                {/* TIÊU ĐỀ KHỐI TIN TỨC */}
                <div className="mb-6 pb-2">
                    <h1 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-[#005596] uppercase tracking-wide">
                        Tin tức - Sự kiện
                    </h1>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-[#005596] animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Đang tải danh mục tin tức...</p>
                    </div>
                ) : articles.length > 0 ? (
                    <>
                        {/* LƯỚI DANH SÁCH TIN TỨC TRANG CHÍNH */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                            {articles.map((article) => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    showSummary={true} // Kích hoạt hiển thị tóm tắt văn bản
                                    showDate={true}    // Kích hoạt hiển thị ngày tháng
                                />
                            ))}
                        </div>

                        {/* HỆ THỐNG PHÂN TRANG (PAGINATION) */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-16">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-md border border-slate-300 text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {getVisiblePages(currentPage, totalPages).map((page, index) => (
                                    page === '...' ? (
                                        // Hiển thị dấu ba chấm
                                        <span key={`ellipsis-${index}`} className="px-2 text-slate-400 font-medium tracking-widest">
                                            ...
                                        </span>
                                    ) : (
                                        // Hiển thị nút bấm số
                                        <button
                                            key={`page-${page}`}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-md font-medium transition-colors ${currentPage === page
                                                    ? 'bg-[#005596] text-white border border-[#005596] shadow-sm'
                                                    : 'border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-[#005596]'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center rounded-md border border-slate-300 text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-left text-slate-500 py-12">
                        Hiện tại chưa có tin tức hệ thống nào được cập nhật.
                    </div>
                )}

            </div>
        </div>
    );
}