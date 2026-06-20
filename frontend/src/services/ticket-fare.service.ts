import axiosClient from './axiosClient';
import { Media } from './media.service';

export interface TicketFare {
    id: string;
    title: string;
    display_order: number;
    is_active: boolean;
    image?: Media | null;
    created_at: string;
    updated_at: string;
}

export const ticketFareService = {
    // API dành cho Admin
    getAllAdmin: async () => {
        return await axiosClient.get('/ticket-fares/admin/all');
    },

    // Vì Controller dùng FileInterceptor, phải gửi bằng FormData
    create: async (data: FormData) => {
        return await axiosClient.post('/ticket-fares', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    update: async (id: string, data: FormData) => {
        return await axiosClient.patch(`/ticket-fares/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    delete: async (id: string) => {
        return await axiosClient.delete(`/ticket-fares/${id}`);
    }
};