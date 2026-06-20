import axiosClient from './axiosClient';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLog {
    id: string;
    actor_id: string | null;
    actor_email: string;
    action: AuditAction;
    entity_name: string;
    entity_id: string;
    old_values: any;
    new_values: any;
    created_at: string;
}

export const auditLogService = {
    getAll: async (params?: any) => {
        return await axiosClient.get('/audit-logs', { params });
    },

    getById: async (id: string) => {
        return await axiosClient.get(`/audit-logs/${id}`);
    }
};