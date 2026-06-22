import axiosClient from "./axiosClient";

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'ADMIN' | 'EDITOR';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export const userService = {
    getProfile: async () => {
        return await axiosClient.get('/users/me');
    },

    updateProfile: async (data: any) => {
        return await axiosClient.patch('/users/me', data);
    },

    getAll: async (params?: { page?: number; limit?: number; search?: string;[key: string]: any }) => {
        return await axiosClient.get('/users', { params });
    },

    getById: async (id: string) => {
        return await axiosClient.get(`/users/${id}`);
    },

    create: async (data: any) => {
        return await axiosClient.post('/users', data);
    },

    update: async (id: string, data: any) => {
        return await axiosClient.patch(`/users/${id}`, data);
    },

    delete: async (id: string) => {
        return await axiosClient.delete(`/users/${id}`);
    }
};