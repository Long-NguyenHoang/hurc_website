// src/services/axiosClient.ts
import axios from 'axios';

const getBaseURL = () => {
    // Nếu đang chạy trên Production (Vercel), BẮT BUỘC dùng biến môi trường (Render API)
    if (process.env.NODE_ENV === 'production') {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Nếu chạy Local Dev, hỗ trợ tự nhận diện IP LAN (ví dụ 192.168.x.x) để test trên điện thoại
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        }
        return `http://${hostname}:3000`;
    }

    // Trên Server-side (Next.js SSR chạy trong Docker)
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

const axiosClient = axios.create({
    baseURL: getBaseURL(),
    // SIÊU QUAN TRỌNG: Công tắc cho phép trình duyệt gửi HttpOnly Cookie lên Backend
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        // Tự động lấy múi giờ của máy tính người dùng (Ví dụ: 'Asia/Ho_Chi_Minh')
        // Rất hữu ích để Backend ghi Audit Log hoặc hiển thị thời gian chính xác
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        config.headers['X-Timezone'] = timezone;

        // Tự động gắn ngôn ngữ (Dành cho tính năng Đa ngôn ngữ sau này)
        // Giả sử bạn lưu ngôn ngữ người dùng chọn trong localStorage
        // ĐỌC TOKEN TỪ LOCALSTORAGE ĐỂ CHỐNG LỖI CHẶN COOKIE CỦA TRÌNH DUYỆT
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            const language = localStorage.getItem('app_language') || 'vi';
            config.headers['Accept-Language'] = language;
        }

        return config;
    },
    (error) => {
        // Xử lý nếu có lỗi ngay từ lúc khởi tạo Request (hiếm gặp)
        return Promise.reject(error);
    }
);

// XỬ LÝ RESPONSE (Nhận dữ liệu về)
axiosClient.interceptors.response.use(
    (response) => {
        // Nếu API trả về thành công (2xx), chỉ lấy phần data cho gọn
        return response.data;
    },
    (error) => {
        // Nếu API trả về lỗi 401 (Unauthorized) do Token hết hạn hoặc chưa đăng nhập
        if (error.response && error.response.status === 401) {
            // Lưu ý: Không dùng router.push ở đây vì đây là file thuần TS, không phải React Component.
            // Chúng ta sẽ dùng window.location để đá người dùng về thẳng trang đăng nhập.
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
                window.location.href = '/admin/login?expired=true';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;