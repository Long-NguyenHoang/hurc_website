import axiosClient from "./axiosClient";

export interface Media {
    id: string;
    file_name: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
    created_at: string;
    updated_at: string;
}

export const mediaService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        return await axiosClient.get('/media', { params });
    },

    getById: async (id: string) => {
        return await axiosClient.get(`/media/${id}`);
    },

    upload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post('/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    update: async (id: string, data: { original_name: string }) => {
        return await axiosClient.patch(`/media/${id}`, data);
    },

    delete: async (id: string) => {
        return await axiosClient.delete(`/media/${id}`);
    }
};