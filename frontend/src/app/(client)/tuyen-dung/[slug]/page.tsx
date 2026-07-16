import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, Calendar, Clock, Send } from "lucide-react";
import { jobService } from "@/services/job.service";

// Làm mới cache bài viết mỗi 60 giây
export const revalidate = 60;

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Label Helpers
const DEPARTMENT_LABELS: Record<string, string> = {
    HCTC: 'Hành chính - Tổ chức',
    KHTC: 'Kế hoạch - Tài chính',
    KDQHCC: 'Kinh doanh - Quan hệ công chúng',
    KTAT: 'Kỹ thuật - An toàn',
    VTTBDV: 'Vật tư - Thiết bị - Dịch vụ',
    XNBD: 'Xí nghiệp Bảo dưỡng',
    XNVH: 'Xí nghiệp Vận hành'
};

const JOB_TYPE_LABELS: Record<string, string> = {
    FULL_TIME: 'Toàn thời gian',
    PART_TIME: 'Bán thời gian',
    INTERN: 'Thực tập sinh'
};

// Hàm xử lý đường dẫn ảnh từ nội dung HTML của Editor
const processContent = (content?: string) => {
    if (!content) return "";
    let processed = content.replace(/&nbsp;/g, ' ');
    processed = processed.replace(/(src|href)="https?:\/\/[^\/]+(\/uploads\/[^"]+)"/g, `$1="${BACKEND_URL}$2"`);
    processed = processed.replace(/src="\/uploads\//g, `src="${BACKEND_URL}/uploads/`);
    processed = processed.replace(/href="\/uploads\//g, `href="${BACKEND_URL}/uploads/`);
    return processed;
};

const calculateDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Đã hết hạn nộp";
    if (diffDays === 0) return "Hết hạn nộp hồ sơ hôm nay";
    return `Còn ${diffDays} ngày để ứng tuyển`;
};

const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoString));
};

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    try {
        const resolvedParams = await params;
        const slug = resolvedParams.slug;

        const response: any = await jobService.getBySlug(slug);
        const job = response.data ? response.data : response;

        if (!job) {
            return (
                <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-slate-50">
                    <p className="text-[20px] text-slate-800 font-bold mb-4">Không tìm thấy vị trí tuyển dụng!</p>
                    <Link href="/jobs" className="text-[#005596] hover:underline flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tuyển dụng
                    </Link>
                </div>
            );
        }

        const isClosed = job.status === 'CLOSED' || calculateDaysLeft(job.deadline).includes("Đã hết hạn");

        return (
            <div className="w-full bg-slate-50 pb-20 pt-8 md:pt-12 min-h-screen">
                <div className="max-w-[120rem] mx-auto px-6 lg:px-[112px]">
                    <div className="max-w-4xl mx-auto">

                        {/* BACK BUTTON */}
                        <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#005596] transition-colors mb-6 text-[14px] font-medium">
                            <ArrowLeft className="w-4 h-4" /> Về trang Tuyển dụng
                        </Link>

                        {/* ================= HEADER KHỐI THÔNG TIN ================= */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

                            <h1 className="text-[24px] md:text-[32px] font-bold text-slate-900 leading-tight mb-4">
                                {job.title}
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2.5 text-slate-600 text-[14px]">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium">Địa điểm:</span> {job.location || 'TP. Hồ Chí Minh'}
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-600 text-[14px]">
                                    <Briefcase className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium">Phòng ban:</span> {DEPARTMENT_LABELS[job.department]}
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-600 text-[14px]">
                                    <Clock className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium">Hình thức:</span> {JOB_TYPE_LABELS[job.job_type]}
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-600 text-[14px]">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                    <span className="font-medium">Hạn nộp:</span> <span className={isClosed ? 'text-red-600 font-bold' : 'text-[#005596] font-bold'}>{formatDate(job.deadline)}</span>
                                </div>
                            </div>

                            {/* CẢNH BÁO HẾT HẠN HOẶC NÚT ỨNG TUYỂN */}
                            {isClosed ? (
                                <div className="bg-slate-100 text-slate-500 px-4 py-3 rounded-xl text-center font-bold text-[14px] border border-slate-200">
                                    Vị trí này đã đóng đăng ký ứng tuyển.
                                </div>
                            ) : (
                                <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl border border-blue-100 flex items-center justify-between">
                                    <span className="text-[14px] font-medium">{calculateDaysLeft(job.deadline)}</span>
                                    <a href="#how-to-apply" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-[14px] font-bold hover:bg-blue-700 transition-colors">
                                        Ứng tuyển ngay <Send className="w-4 h-4" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* ================= NỘI DUNG CHI TIẾT ================= */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-10">

                            {/* 1. MÔ TẢ CÔNG VIỆC */}
                            <section>
                                <h2 className="text-[20px] font-bold text-[#005596] mb-4 pb-2 border-b border-slate-100">
                                    1. Mô tả công việc
                                </h2>
                                <div
                                    className="prose prose-slate max-w-none text-[15px] leading-relaxed [&>ul]:list-disc [&>ul]:ml-5 [&>ul>li]:mb-1.5"
                                    dangerouslySetInnerHTML={{ __html: processContent(job.description) }}
                                />
                            </section>

                            {/* 2. YÊU CẦU ỨNG VIÊN */}
                            <section>
                                <h2 className="text-[20px] font-bold text-[#005596] mb-4 pb-2 border-b border-slate-100">
                                    2. Yêu cầu ứng viên
                                </h2>
                                <div
                                    className="prose prose-slate max-w-none text-[15px] leading-relaxed [&>ul]:list-disc [&>ul]:ml-5 [&>ul>li]:mb-1.5"
                                    dangerouslySetInnerHTML={{ __html: processContent(job.requirements) }}
                                />
                            </section>

                            {/* 3. QUYỀN LỢI */}
                            {job.benefits && (
                                <section>
                                    <h2 className="text-[20px] font-bold text-[#005596] mb-4 pb-2 border-b border-slate-100">
                                        3. Quyền lợi được hưởng
                                    </h2>
                                    <div
                                        className="prose prose-slate max-w-none text-[15px] leading-relaxed [&>ul]:list-disc [&>ul]:ml-5 [&>ul>li]:mb-1.5"
                                        dangerouslySetInnerHTML={{ __html: processContent(job.benefits) }}
                                    />
                                </section>
                            )}

                            {/* 4. CÁCH THỨC ỨNG TUYỂN */}
                            <section id="how-to-apply" className="bg-blue-50 p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm mt-8">
                                <h2 className="text-[20px] font-bold text-[#005596] mb-5 pb-2 border-b border-blue-200/60">
                                    Cách thức ứng tuyển
                                </h2>

                                <div className="space-y-5 text-[14.5px] text-slate-700 leading-relaxed">
                                    {/* Khối Thời gian & Hình thức */}
                                    <div>
                                        <strong className="text-slate-900 block mb-1.5 flex items-center gap-2">
                                            ⏰ Thời gian và hình thức nhận hồ sơ:
                                        </strong>
                                        <ul className="list-disc ml-6 space-y-1.5 marker:text-blue-400">
                                            <li>
                                                Từ ngày ra thông báo đến hết ngày <span className="font-bold text-red-600">{formatDate(job.deadline)}</span>.
                                            </li>
                                            <li>Hình thức: Nộp trực tiếp hoặc gửi qua đường bưu điện.</li>
                                        </ul>
                                    </div>

                                    {/* Khối Địa điểm */}
                                    <div>
                                        <strong className="text-slate-900 block mb-1.5 flex items-center gap-2">
                                            📍 Địa điểm nhận hồ sơ:
                                        </strong>
                                        <div className="ml-6">
                                            <p className="font-semibold text-slate-800">Phòng Hành chính - Tổ chức, Công ty Đường sắt đô thị số 1.</p>
                                            <p>Tòa nhà OCC, số 55 Đường 11, Khu phố Giản Dân, Phường Long Bình, TP. Hồ Chí Minh.</p>
                                        </div>
                                    </div>

                                    {/* Khối Liên hệ */}
                                    <div>
                                        <strong className="text-slate-900 block mb-1.5 flex items-center gap-2">
                                            📞 Liên hệ ứng tuyển:
                                        </strong>
                                        <p className="ml-6">
                                            <a href="tel:0366261154" className="text-[16px] font-bold text-[#005596] hover:underline">
                                                036 626 1154
                                            </a>{' '}
                                            (Anh Tâm - Chuyên viên phòng Hành chính - Tổ chức)
                                        </p>
                                    </div>
                                </div>
                            </section>

                        </div>

                    </div>
                </div>
            </div>
        );
    } catch (error: any) {
        console.error("==== LỖI KẾT NỐI API SSR ====", error.message);
        return (
            <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-slate-50">
                <p className="text-[20px] text-slate-800 font-bold mb-4">Lỗi mạng hoặc không tìm thấy tin tuyển dụng này!</p>
                <Link href="/jobs" className="text-[#005596] hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tuyển dụng
                </Link>
            </div>
        );
    }
}