"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { articleService, Article } from "@/services/article.service";

export default function ArticleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchArticleDetail = async () => {
            try {
                const response = await articleService.getBySlug(slug);
                const data = response.data ? response.data : response;
                setArticle(data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết bài viết:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticleDetail();
    }, [slug]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
        });
    };

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const processContent = (content: string) => {
        if (!content) return "";
        let processed = content.replace(/&nbsp;/g, ' ');
        // Thay thế các đường dẫn tuyệt đối (chứa domain localhost hoặc domain cũ) bằng BACKEND_URL
        processed = processed.replace(/(src|href)="https?:\/\/[^\/]+(\/uploads\/[^"]+)"/g, `$1="${BACKEND_URL}$2"`);
        // Thay thế các đường dẫn tương đối /uploads/
        processed = processed.replace(/src="\/uploads\//g, `src="${BACKEND_URL}/uploads/`);
        processed = processed.replace(/href="\/uploads\//g, `href="${BACKEND_URL}/uploads/`);
        return processed;
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-[#005596] animate-spin mb-4" />
                <p className="text-slate-500">Đang tải nội dung bài viết...</p>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-white">
                <p className="text-[20px] text-slate-800 font-bold mb-4">Không tìm thấy bài viết!</p>
                <button onClick={() => router.push('/tin-tuc')} className="text-[#005596] hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tin tức
                </button>
            </div>
        );
    }

    return (
        <div className="w-full bg-white pb-20 pt-8 md:pt-12">
            <div className="max-w-[120rem] mx-auto px-4 lg:px-[56px]">

                {/* Khung nội dung thu hẹp (max-w-4xl) để bài viết dễ đọc, không dàn quá ngang */}
                <div className="max-w-5xl mx-auto">

                    {/* HEADER BÀI VIẾT */}
                    <h1 className="text-[26px] md:text-[34px] lg:text-[40px] font-bold text-slate-900 leading-tight mb-6">
                        {article.title}
                    </h1>

                    {/* NỘI DUNG CHÍNH (HTML TỪ EDITOR) */}
                    <div
                        className="w-full text-[16px] md:text-[17px] text-slate-800 leading-loose text-justify 
                       whitespace-pre-wrap break-words
                       [&>p]:mb-6
                       [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>img]:my-8
                       [&>ul]:list-disc [&>ul]:ml-8 [&>ul>li]:mb-2
                       [&>ol]:list-decimal [&>ol]:ml-8 [&>ol>li]:mb-2
                       [&>h2]:text-[24px] [&>h2]:font-bold [&>h2]:text-[#005596] [&>h2]:mt-10 [&>h2]:mb-4
                       [&>h3]:text-[20px] [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-8 [&>h3]:mb-3
                       [&_a]:text-blue-600 [&_a]:underline"
                        dangerouslySetInnerHTML={{
                            __html: processContent(article.content)
                        }}
                    />

                </div>
            </div>
        </div>
    );
}