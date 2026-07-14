import axiosClient from "./axiosClient"


export const authService = {
    login: async (email: string, password: string) => {
        const response: any = await axiosClient.post('/auth/login', { email, password });
        if (response && response.access_token) {
            localStorage.setItem('access_token', response.access_token);
        }
        return response;
    },

    logout: async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
        }
        return await axiosClient.post('/auth/logout');
    }
}