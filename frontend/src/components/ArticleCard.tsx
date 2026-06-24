import Link from "next/link";
import { Article } from "@/services/article.service";

interface ArticleCardProps {
    article: Article;
}

const BACKEND_URL = "http://localhost:3000";

export default function ArticleCard({ article }: ArticleCardProps) {
    // Xử lý đường dẫn ảnh đại diện
    const getThumbnailUrl = () => {
        if (!article.thumbnail) return '/hero-metro.png';
        const imgPath = article.thumbnail.url || (article.thumbnail as any).path;
        if (!imgPath) return '/hero-metro.png';
        if (imgPath.startsWith('http')) return imgPath;
        return `${BACKEND_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    };

    return (
        <Link
            href={`/tin-tuc/${article.slug}`}
            className="group flex flex-col w-full space-y-3 cursor-pointer"
        >
            {/* 1. KHUNG ẢNH THUMBNAIL (Bo góc tròn mềm mại giống hình mẫu) */}
            <div className="w-full aspect-[16/10] overflow-hidden rounded-xl bg-slate-50">
                <img
                    src={getThumbnailUrl()}
                    alt={article.title}
                    className="w-full h-full object-cover transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-metro.png';
                    }}
                />
            </div>

            {/* 2. TIÊU ĐỀ NẰM NGAY DƯỚI ẢNH */}
            {/* line-clamp-3 cho phép tiêu đề hiển thị tối đa 3 dòng nếu quá dài, tránh phá font layout */}
            <h3 className="text-slate-900 font-bold text-[14px] md:text-[15px] leading-snug group-hover:text-[#005596] transition-colors line-clamp-3">
                {article.title}
            </h3>
        </Link>
    );
}