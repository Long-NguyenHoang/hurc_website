import axiosClient from './axiosClient';
import { Media } from './media.service';

export interface Banner {
    id: string;
    title: string;
    redirect_url: string;
    display_order: number;
    is_active: boolean;
    image?: Media | null;
    created_at: string;
    updated_at: string;
}

export const bannerService = {
    getAllAdmin: async () => {
        return await axiosClient.get('/banners/admin/all');
    },

    create: async (data: FormData) => {
        return await axiosClient.post('/banners', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    update: async (id: string, data: FormData) => {
        return await axiosClient.patch(`/banners/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    delete: async (id: string) => {
        return await axiosClient.delete(`/banners/${id}`);
    }
};