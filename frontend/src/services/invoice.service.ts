import axiosClient from './axiosClient';

// Định nghĩa Interface chỉ chứa ĐÚNG những trường bạn cần hiển thị lên UI
export interface InvoiceDetail {
    so_hoa_don: string;
    ngay_tao: string;
    ga_di: string;
    ga_den: string;
    loai_khach: string;
    loai_ve: string;
    don_gia: number;
    so_luong: number;
    tong_tien: number;
    link_xem_hoa_don?: string;
}

export const invoiceService = {
    lookup: async (code: string) => {
        return await axiosClient.post('/invoices/lookup', { code });
    }
};