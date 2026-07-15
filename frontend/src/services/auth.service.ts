import axiosClient from "./axiosClient"


export const authService = {
    login: async (email: string, password: string) => {
        const response: any = await axiosClient.post('/auth/login', { email, password });
        if (response && response.access_token) {
            // Lưu vào localStorage cho axiosClient gửi Bearer Token
            localStorage.setItem('access_token', response.access_token);
            // LƯU Ý QUAN TRỌNG: Lưu thêm vào First-party Cookie để Next.js Middleware trên Vercel đọc được (chống bị văng ra login)
            document.cookie = `access_token=${response.access_token}; path=/; max-age=86400; SameSite=Lax`;
        }
        return response;
    },

    logout: async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        return await axiosClient.post('/auth/logout');
    }
}