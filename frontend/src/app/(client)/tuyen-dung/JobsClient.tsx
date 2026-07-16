"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight, MapPin, Clock, Briefcase, ArrowRight } from "lucide-react";
import { jobService, Job, Department, JobType } from "@/services/job.service";
import Link from "next/link";

const DEPARTMENT_LABELS: Record<Department, string> = {
    HCTC: 'Hành chính - Tổ chức',
    KHTC: 'Kế hoạch - Tài chính',
    KDQHCC: 'Kinh doanh - Quan hệ công chúng',
    KTAT: 'Kỹ thuật - An toàn',
    VTTBDV: 'Vật tư - Thiết bị - Dịch vụ',
    XNBD: 'Xí nghiệp Bảo dưỡng',
    XNVH: 'Xí nghiệp Vận hành'
};

const JOB_TYPE_LABELS: Record<JobType, string> = {
    FULL_TIME: 'Toàn thời gian',
    PART_TIME: 'Bán thời gian',
    INTERN: 'Thực tập'
};

export default function JobsClient({
    initialJobs,
    initialTotalPages
}: {
    initialJobs: Job[];
    initialTotalPages: number;
}) {
    const [jobs, setJobs] = useState<Job[]>(initialJobs);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotalPages);

    const isFirstRender = useRef(true);
    const itemsPerPage = 12;

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const fetchJobs = async () => {
            setIsLoading(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            try {
                const response: any = await jobService.getAllPublic({
                    page: currentPage,
                    limit: itemsPerPage
                });

                const list = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
                setJobs(list);

                const meta = response.meta;
                if (meta && meta.lastPage) {
                    setTotalPages(meta.lastPage);
                } else if (meta && meta.total) {
                    setTotalPages(Math.ceil(meta.total / itemsPerPage));
                }
            } catch (error) {
                console.error("Lỗi tải danh sách tuyển dụng:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [currentPage]);

    const getVisiblePages = (current: number, total: number) => {
        if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 3) return [1, 2, 3, 4, '...', total];
        if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    const calculateDaysLeft = (deadline: string) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "Đã hết hạn";
        if (diffDays === 0) return "Hết hạn hôm nay";
        return `Còn ${diffDays} ngày`;
    };

    return (
        <div className="w-full bg-slate-50 min-h-[80vh] py-8 md:py-12 max-w-[120rem] mx-auto px-6 lg:px-[112px]">
            {/* HERO SECTION */}
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <h1 className="text-[28px] md:text-[36px] font-bold text-[#005596] mb-3">
                    Cơ hội nghề nghiệp
                </h1>
                <p className="text-slate-600 text-[15px]">
                    Tham gia cùng chúng tôi để xây dựng và phát triển hệ thống Đường sắt Đô thị hiện đại bậc nhất tại Thành phố Hồ Chí Minh.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[#005596] animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải danh sách vị trí...</p>
                </div>
            ) : jobs.length > 0 ? (
                <>
                    {/* BỐ CỤC GRID 3 CỘT (Phù hợp Job Card) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <Link href={`/tuyen-dung/${job.slug}`} key={job.id} className="group block h-full">
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full flex flex-col relative overflow-hidden">

                                    {/* Line màu trang trí ở trên cùng của thẻ */}
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    {/* BADGES */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider rounded-full">
                                            {DEPARTMENT_LABELS[job.department]}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" />
                                            {JOB_TYPE_LABELS[job.job_type]}
                                        </span>
                                    </div>

                                    {/* TITLE */}
                                    <h3 className="text-[18px] font-bold text-slate-900 leading-snug mb-3 group-hover:text-[#005596] transition-colors line-clamp-2">
                                        {job.title}
                                    </h3>

                                    {/* LOCATION */}
                                    <div className="flex items-center gap-2 text-slate-500 text-[13px] mb-6">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="line-clamp-1">{job.location || 'TP. Hồ Chí Minh'}</span>
                                    </div>

                                    {/* FOOTER BÊN TRONG CARD (Ép xuống dưới cùng) */}
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                                            <Clock className="w-4 h-4" />
                                            {calculateDaysLeft(job.deadline)}
                                        </div>
                                        <span className="text-[#005596] font-semibold text-[13px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Chi tiết <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* PHÂN TRANG (Tương tự Tin tức) */}
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
                                    <span key={`ellipsis-${index}`} className="px-2 text-slate-400 font-medium tracking-widest">...</span>
                                ) : (
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
                <div className="bg-white rounded-2xl border border-slate-200 text-center py-20 px-6">
                    <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa có vị trí tuyển dụng</h3>
                    <p className="text-slate-500 text-[14px]">
                        Hiện tại công ty chưa có đợt tuyển dụng mới. Vui lòng quay lại sau!
                    </p>
                </div>
            )}
        </div>
    );
}