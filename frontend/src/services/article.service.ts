import axiosClient from './axiosClient';
import { Media } from './media.service';

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';

export interface Article {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
    published_at: string;
    thumbnail?: Media | null;
    created_at: string;
    updated_at: string;
}

export const articleService = {
    getAllPublic: async (params?: { page?: number; limit?: number, search?: string }) => {
        return await axiosClient.get('/articles', { params });
    },

    getBySlug: async (slug: string) => {
        return await axiosClient.get(`/articles/detail/${slug}`);
    },

    // API dành cho Admin
    getAllAdmin: async (params?: any) => {
        return await axiosClient.get('/articles/admin/all', { params });
    },

    getById: async (id: string) => {
        return await axiosClient.get(`/articles/admin/${id}`);
    },

    create: async (data: FormData) => {
        return await axiosClient.post('/articles', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    update: async (id: string, data: FormData) => {
        return await axiosClient.patch(`/articles/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    delete: async (id: string) => {
        return await axiosClient.delete(`/articles/${id}`);
    }
};