import axiosClient from "./axiosClient"


export const authService = {
    login: async (email: string, password: string) => {
        return await axiosClient.post('/auth/login', { email, password });
    },

    logout: async () => {
        return await axiosClient.post('/auth/logout');
    }
}