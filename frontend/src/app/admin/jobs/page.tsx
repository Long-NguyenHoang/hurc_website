'use client';

import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import RichTextEditor from "@/components/RichTextEditor";
import { Department, Job, jobService, JobStatus, JobType } from "@/services/job.service";
import { AlertTriangle, Briefcase, Calendar, Edit2, Loader2, MapPin, Plus, Save, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { clearCacheByPath } from "@/actions/revalidate";

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
    INTERN: 'Thực tập sinh'
}

export default function JobSPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        department: 'HCTC' as Department,
        location: '',
        job_type: 'FULL_TIME' as JobType,
        description: '',
        requirements: '',
        benefits: '',
        deadline: '',
        status: 'OPEN' as JobStatus,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== debouncedSearch) {
                setDebouncedSearch(searchTerm);
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearch]);

    useEffect(() => {
        fetchJobs();
    }, [searchTerm, debouncedSearch]);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const response: any = await jobService.getAllAdmin({ page: currentPage, limit: 20, search: debouncedSearch });
            const dataList = response?.data || [];
            const meta = response?.meta;
            if (meta) {
                setTotalPages(meta.lastPage || Math.ceil(meta.total / meta.limit) || 1);
            }
            setJobs(dataList);
        } catch (error) {
            console.error('Lỗi tải danh sách: ', error);
            toast.error('Không thể tải danh sách Tin tuyển dụng');
        } finally {
            setIsLoading(false);
        }
    }

    const validateForm = () => {
        const newErrors: Partial<Record<keyof typeof formData, string>> = {};
        let isValid = true;

        if (!formData.title.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề tuyển dụng';
            isValid = false;
        }
        if (!formData.deadline) {
            newErrors.deadline = 'Vui lòng chọn hạn nộp hồ sơ';
            isValid = false;
        }

        const stripHTML = (html: string) => html.replace(/(<([^>]+)>)/gi, "").trim();

        if (!stripHTML(formData.description)) {
            newErrors.description = 'Vui lòng nhập mô tả công việc';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({
            title: '',
            department: 'HCTC',
            location: '',
            job_type: 'FULL_TIME',
            description: '',
            requirements: '',
            benefits: '',
            deadline: '',
            status: 'OPEN'
        });
        setErrors({});
        setIsModalOpen(true);
    }

    const handleOpenEdit = (job: Job) => {
        setEditingId(job.id);
        setFormData({
            title: job.title,
            department: job.department,
            location: job.location,
            job_type: job.job_type,
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits || '',
            deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
            status: job.status
        });
        setErrors({});
        setIsModalOpen(true);
    }

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin bị lỗi!');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                await jobService.update(editingId, formData);
                toast.success('Cập nhật tin tuyển dụng thành công!');
            } else {
                await jobService.create(formData);
                toast.success('Thêm tin tuyển dụng mới thành công!');
            }

            // Gọi Server Action để xoá Cache của toàn bộ trang Tuyển dụng (gồm cả danh sách và chi tiết)
            await clearCacheByPath('/tuyen-dung', 'layout');

            setIsModalOpen(false);
            fetchJobs();
        } catch (error: any) {
            console.error('Lỗi khi lưu: ' + error);
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi lưu dữ liệu!");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDeleteConfirm = async () => {
        if (!jobToDelete) return;
        setIsDeleting(true);
        try {
            await jobService.delete(jobToDelete.id);
            setJobToDelete(null);
            
            // Xoá Cache ngay lập tức
            await clearCacheByPath('/tuyen-dung', 'layout');
            
            fetchJobs();
            toast.success('Xoá tin tuyển dụng thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể xóa bài viết lúc này!");
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '-';
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoString));
    }

    return (
        <div className="flex flex-col gap-6 relative">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Tuyển dụng</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Đăng tải, cập nhật các cơ hội việc làm tại HURC1.</p>
                </div>
                <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    Đăng tin mới
                </button>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text" placeholder="Tìm kiếm vị trí tuyển dụng..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div className="text-[13px] font-medium text-slate-500">
                        Tổng cộng: <span className="font-bold text-slate-900">{jobs.length}</span> vị trí
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vị trí ứng tuyển</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phòng ban / Loại hình</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="py-3 px-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hạn nộp</th>
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
                            {!isLoading && jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 px-5">
                                        <span className="text-[14px] font-bold text-slate-900 block mb-1">{job.title}</span>
                                        <span className="text-[12px] text-slate-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {job.location || 'Chưa cập nhật'}
                                        </span>
                                    </td>

                                    <td className="py-3 px-5">
                                        <span className="text-[13px] font-medium text-slate-800 block mb-1">{DEPARTMENT_LABELS[job.department]}</span>
                                        <span className="text-[12px] text-slate-500 flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" /> {JOB_TYPE_LABELS[job.job_type]}
                                        </span>
                                    </td>

                                    <td className="py-3 px-5 text-center">
                                        {job.status === 'OPEN' ? (
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center justify-center w-max mx-auto">Đang Mở</span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center justify-center w-max mx-auto">Đã Đóng</span>
                                        )}
                                    </td>

                                    <td className="py-3 px-5">
                                        <span className="text-[13px] font-medium text-slate-700 flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {formatDate(job.deadline)}
                                        </span>
                                    </td>

                                    <td className="py-3 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity will-change-opacity">
                                            <button onClick={() => handleOpenEdit(job)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setJobToDelete(job)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {/* ========================================= */}
            {/* MODAL THÊM/SỬA TUYỂN DỤNG                 */}
            {/* ========================================= */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Cập nhật Tin tuyển dụng' : 'Thêm Tin tuyển dụng mới'} maxWidth="5xl">
                <form onSubmit={handleSubmit} noValidate className="flex flex-col">
                    <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[75vh] custom-scrollbar">

                        {/* Thông tin cơ bản (Grid 2 cột) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                            <div className="md:col-span-2">
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Vị trí ứng tuyển <span className="text-red-500">*</span></label>
                                <input
                                    type="text" value={formData.title}
                                    onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setErrors({ ...errors, title: undefined }); }}
                                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-[13px] outline-none transition-all ${errors.title ? 'border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-100'}`}
                                    placeholder="VD: Chuyên viên Kỹ thuật An toàn..."
                                />
                                {errors.title && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Phòng ban</label>
                                <select
                                    value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                                >
                                    {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Hình thức làm việc</label>
                                <select
                                    value={formData.job_type} onChange={(e) => setFormData({ ...formData, job_type: e.target.value as JobType })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                                >
                                    {Object.entries(JOB_TYPE_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Địa điểm làm việc</label>
                                <input
                                    type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="VD: Depot Long Bình..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Hạn nộp hồ sơ <span className="text-red-500">*</span></label>
                                    <input
                                        type="date" value={formData.deadline}
                                        onChange={(e) => { setFormData({ ...formData, deadline: e.target.value }); setErrors({ ...errors, deadline: undefined }); }}
                                        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-[13px] outline-none transition-all ${errors.deadline ? 'border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-100'}`}
                                    />
                                    {errors.deadline && <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.deadline}</p>}
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Trạng thái</label>
                                    <select
                                        value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                                    >
                                        <option value="OPEN">Đang mở tuyển</option>
                                        <option value="CLOSED">Đã đóng</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Các trường Rich Text Editor */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <label className="block text-[14px] font-bold text-slate-800 mb-2">1. Mô tả công việc <span className="text-red-500">*</span></label>
                                <div className={`rounded-xl transition-all ${errors.description ? 'border border-red-500 ring-2 ring-red-100' : ''}`}>
                                    <RichTextEditor value={formData.description} onChange={(val) => { setFormData({ ...formData, description: val }); setErrors({ ...errors, description: undefined }); }} placeholder="Nhập mô tả chi tiết công việc..." />
                                </div>
                                {errors.description && <p className="text-[11px] font-medium text-red-500 mt-1"><AlertTriangle className="w-3 h-3 inline mr-1" /> {errors.description}</p>}
                            </div>

                            <div>
                                <label className="block text-[14px] font-bold text-slate-800 mb-2">2. Yêu cầu ứng viên <span className="text-red-500">*</span></label>
                                <div className={`rounded-xl transition-all ${errors.requirements ? 'border border-red-500 ring-2 ring-red-100' : ''}`}>
                                    <RichTextEditor value={formData.requirements} onChange={(val) => { setFormData({ ...formData, requirements: val }); setErrors({ ...errors, requirements: undefined }); }} placeholder="Nhập các yêu cầu về bằng cấp, kinh nghiệm..." />
                                </div>
                                {errors.requirements && <p className="text-[11px] font-medium text-red-500 mt-1"><AlertTriangle className="w-3 h-3 inline mr-1" /> {errors.requirements}</p>}
                            </div>

                            <div>
                                <label className="block text-[14px] font-bold text-slate-800 mb-2">3. Quyền lợi được hưởng</label>
                                <RichTextEditor value={formData.benefits} onChange={(val) => setFormData({ ...formData, benefits: val })} placeholder="Chế độ bảo hiểm, lương thưởng..." />
                            </div>
                        </div>

                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                        <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-sm">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSubmitting ? 'Đang lưu...' : 'Lưu tin tuyển dụng'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ========================================= */}
            {/* MODAL CẢNH BÁO XÓA                        */}
            {/* ========================================= */}
            <Modal isOpen={!!jobToDelete} onClose={() => setJobToDelete(null)} maxWidth="sm" hideHeader={true}>
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Xóa tin tuyển dụng</h3>
                    <p className="text-[13px] text-slate-500">
                        Bạn có chắc chắn muốn xóa tin tuyển dụng <strong className="text-slate-800">{jobToDelete?.title}</strong> không?
                    </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                    <button onClick={() => setJobToDelete(null)} disabled={isDeleting} className="px-5 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Hủy bỏ</button>
                    <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:bg-red-400">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Xóa ngay
                    </button>
                </div>
            </Modal>
        </div>
    );
}