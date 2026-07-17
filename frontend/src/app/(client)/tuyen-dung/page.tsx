import { jobService } from "@/services/job.service";
import JobsClient from "./JobsClient";

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
    try {
        // Lấy dữ liệu Trang 1 trực tiếp trên Server (12 bài/trang cho layout 3 cột)
        const response: any = await jobService.getAllPublic({ page: 1, limit: 6 });

        const list = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);

        let totalPages = 1;
        const meta = response.meta;
        if (meta && meta.lastPage) {
            totalPages = meta.lastPage;
        } else if (meta && meta.totalPages) {
            totalPages = meta.totalPages;
        } else if (meta && meta.total) {
            totalPages = Math.ceil(meta.total / 12);
        }

        return <JobsClient initialJobs={list} initialTotalPages={totalPages} />;

    } catch (error) {
        console.error("Lỗi SSR trang Tuyển dụng:", error);
        return <JobsClient initialJobs={[]} initialTotalPages={1} />;
    }
}