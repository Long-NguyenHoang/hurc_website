import axiosClient from './axiosClient';

export type Subject = 'FEEDBACK' | 'LOST_ITEMS';
export type ContactStatus = 'PENDING' | 'RESOLVED';

export interface Contact {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    subject: Subject;
    message: string;
    status: ContactStatus;
    resolved_by_user?: { id: string; full_name: string; email: string } | null;
    created_at: string;
    updated_at: string;
}

export const contactService = {
    getAllAdmin: async (params?: any) => {
        return await axiosClient.get('/contacts/admin/all', { params });
    },

    getById: async (id: string) => {
        return await axiosClient.get(`/contacts/admin/${id}`);
    },

    update: async (id: string, data: { status: ContactStatus }) => {
        return await axiosClient.patch(`/contacts/update/${id}`, data);
    },

    delete: async (id: string) => {
        return await axiosClient.delete(`/contacts/${id}`);
    }
};