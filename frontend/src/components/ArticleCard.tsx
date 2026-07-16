import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Article } from "@/services/article.service";

interface ArticleCardProps {
    article: Article;
    showSummary?: boolean; // Thêm prop để bật/tắt phần tóm tắt
    showDate?: boolean;    // Thêm prop để bật/tắt phần ngày đăng
}



export default function ArticleCard({
    article,
    showSummary = false, // Mặc định tắt để giữ nguyên giao diện tối giản ở trang chủ
    showDate = false     // Mặc định tắt
}: ArticleCardProps) {

    // Xử lý đường dẫn ảnh đại diện
    const getThumbnailUrl = () => {
        if (!article.thumbnail) return '/hero-metro.png';
        const imgPath = article.thumbnail.url || (article.thumbnail as any).path;
        if (!imgPath) return '/hero-metro.png';
        if (imgPath.startsWith('http')) return imgPath;
        return `${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    };

    // Định dạng ngày đăng bài viết
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <Link
            href={`/tin-tuc/${article.slug}`}
            className="group flex flex-col w-full space-y-3 cursor-pointer h-full"
        >
            {/* 1. KHUNG ẢNH THUMBNAIL */}
            <div className="w-full aspect-[16/10] overflow-hidden rounded-xl bg-slate-50 shrink-0">
                <img
                    src={getThumbnailUrl()}
                    alt={article.title}
                    className="w-full h-full object-cover transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-metro.png';
                    }}
                />
            </div>

            {/* KHUNG NỘI DUNG CHỮ */}
            <div className="flex flex-col space-y-2 flex-grow">

                {/* 2. NGÀY ĐĂNG (Chỉ hiển thị khi có yêu cầu) */}
                {showDate && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-[13px]">
                        <CalendarDays className="w-4 h-4 shrink-0" />
                        <span>{formatDate(article.published_at || article.created_at)}</span>
                    </div>
                )}

                {/* 3. TIÊU ĐỀ */}
                <h3 className="text-slate-900 font-bold text-[14px] md:text-[15px] leading-snug group-hover:text-[#005596] transition-colors line-clamp-2">
                    {article.title}
                </h3>

                {/* 4. TÓM TẮT SUMMARY (Chỉ hiển thị khi ở trang tin tức) */}
                {showSummary && article.summary && (
                    <p className="text-slate-500 text-[13px] md:text-[14px] leading-relaxed line-clamp-3 text-justify flex-grow">
                        {article.summary}
                    </p>
                )}
            </div>
        </Link>
    );
}