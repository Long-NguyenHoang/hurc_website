import { articleService } from "@/services/article.service";
import NewsClient from "./NewClient";

export default async function NewsPage() {
    try {
        // Fetch trực tiếp trên Server: Lấy Trang 1, giới hạn 8 bài viết
        const response: any = await articleService.getAllPublic({ page: 1, limit: 8 });

        // Trích xuất danh sách bài viết
        const list = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);

        // Trích xuất tổng số trang
        let totalPages = 1;
        const meta = response.meta;
        if (meta && meta.lastPage) {
            totalPages = meta.lastPage;
        } else if (meta && meta.totalPages) {
            totalPages = meta.totalPages;
        } else if (meta && meta.total) {
            totalPages = Math.ceil(meta.total / 8);
        }

        // Truyền dữ liệu chín sẵn xuống cho Component giao diện
        return <NewsClient initialArticles={list} initialTotalPages={totalPages} />;

    } catch (error) {
        console.error("Lỗi SSR trang Tin tức:", error);
        // Trả về dữ liệu rỗng nếu lỗi để web không sập
        return <NewsClient initialArticles={[]} initialTotalPages={1} />;
    }
}