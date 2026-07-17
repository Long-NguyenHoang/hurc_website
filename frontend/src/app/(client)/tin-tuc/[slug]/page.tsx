import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { articleService } from "@/services/article.service";

// Hàm xử lý đường dẫn ảnh từ nội dung HTML của Editor
const processContent = (content: string) => {
    if (!content) return "";
    let processed = content.replace(/&nbsp;/g, ' ');
    processed = processed.replace(/(src|href)="https?:\/\/[^\/]+(\/uploads\/[^"]+)"/g, `$1="$2"`);
    // Không cần prepend BACKEND_URL nữa vì Next.js đã có proxy
    return processed;
};

// FIX: Thêm Promise vào kiểu dữ liệu của params để tương thích Next.js 15
export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    try {
        // 1. FIX LỖI NEXT.JS: Bắt buộc phải await params để lấy đúng đường dẫn slug
        const resolvedParams = await params;
        const slug = resolvedParams.slug;

        // 2. Server gọi thẳng xuống Backend để lấy bài viết
        const response: any = await articleService.getBySlug(slug);
        const article = response.data ? response.data : response;

        // Xử lý trường hợp không tìm thấy bài
        if (!article) {
            console.log("-> Kết quả: Backend trả về dữ liệu rỗng!");
            return (
                <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-white">
                    <p className="text-[20px] text-slate-800 font-bold mb-4">Không tìm thấy bài viết (Dữ liệu rỗng)!</p>
                    <Link href="/tin-tuc" className="text-[#005596] hover:underline flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tin tức
                    </Link>
                </div>
            );
        }

        // console.log("-> Kết quả: Đã tìm thấy bài viết:", article.title);

        // 3. Trả về giao diện bài viết
        return (
            <div className="w-full bg-white pb-20 pt-8 md:pt-12">
                <div className="max-w-[120rem] mx-auto px-8 lg:px-[56px]">
                    <div className="max-w-5xl mx-auto">

                        {/* HEADER BÀI VIẾT */}
                        <h2 className="text-[18px] md:text-[22px] lg:text-[26px] font-bold text-[#005596] leading-tight mb-6">
                            {article.title}
                        </h2>

                        {/* NỘI DUNG CHÍNH (HTML TỪ EDITOR) */}
                        <div
                            className="w-full text-[14px] md:text-[16px] text-slate-800 leading-loose text-justify 
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
    } catch (error: any) {
        // IN LỖI RA TERMINAL ĐỂ BẮT ĐÚNG BỆNH NẾU SERVER BỊ SẬP HOẶC TỪ CHỐI KẾT NỐI
        console.error("==== LỖI KẾT NỐI API TRONG SSR ====");
        console.error("Chi tiết lỗi:", error.message);
        if (error.response) {
            console.error("Mã lỗi Backend trả về:", error.response.status, error.response.data);
        }

        return (
            <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-white">
                <p className="text-[20px] text-slate-800 font-bold mb-4">Lỗi mạng hoặc không tìm thấy bài viết này!</p>
                <Link href="/tin-tuc" className="text-[#005596] hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tin tức
                </Link>
            </div>
        );
    }
}