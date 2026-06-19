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
    deleted_at?: string;
}

export interface Station {
    id: string;
    name: string;
    code: string;
    content?: string | null;
    display_order: number;
    schedule_image?: Media | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export const stationService = {
    getAllAdmin: async () => {
        return await axiosClient.get('/stations/admin/all');
    },

    getSchedule: async () => {
        return await axiosClient.get('/stations/schedule');
    },

    getContent: async () => {
        return await axiosClient.get('stations/content');
    },

    getById: async (id: string) => {
        return await axiosClient.get(`/stations/detail/${id}`);
    },

    create: async (formData: FormData) => {
        return await axiosClient.post('/stations', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    update: async (id: string, formData: FormData) => {
        return await axiosClient.patch(`/stations/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    delete: async (id: string) => {
        return await axiosClient.delete(`/stations/${id}`);
    }
};