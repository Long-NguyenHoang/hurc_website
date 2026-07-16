import axiosClient from "./axiosClient";

export type JobStatus = 'OPEN' | 'CLOSED';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERN';
export type Department = 'HCTC' | 'KHTC' | 'KDQHCC' | 'KTAT' | 'VTTBDV' | 'XNBD' | 'XNVH';

export interface Job {
    id: string;
    title: string;
    slug: string;
    department: Department;
    location: string;
    job_type: JobType;
    description: string;
    requirements: string;
    benefits: string;
    deadline: string;
    status: JobStatus;
    created_at: string;
    updated_at: string;
}

export const jobService = {
    getAllPublic: async (params?: { page?: number; limit?: number, search?: string }) => {
        return await axiosClient.get('jobs', { params });
    },

    getBySlug: async (slug: string) => {
        return await axiosClient.get(`/jobs/details/${slug}`);
    },

    getAllAdmin: async (params?: any) => {
        return await axiosClient.get('/jobs/admin/all', { params });
    },

    getById: async (id: string) => {
        return await axiosClient.get(`/jobs/admin/${id}`);
    },

    create: async (data: Partial<Job>) => {
        return await axiosClient.post('/jobs', data);
    },

    update: async (id: string, data: Partial<Job>) => {
        return await axiosClient.patch(`/jobs/${id}`, data);
    },

    delete: async (id: string) => {
        return await axiosClient.delete(`/jobs/${id}`);
    }
}