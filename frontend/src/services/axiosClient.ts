// src/services/axiosClient.ts
import axios from 'axios';

export const getBaseURL = () => {
    // Ưu tiên sử dụng biến môi trường từ .env.local (chạy được cả client & server)
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Dùng 127.0.0.1 thay vì localhost để né lỗi HSTS (trình duyệt tự ép HTTP thành HTTPS)
        if (hostname === 'localhost') {
            return 'http://127.0.0.1:3000';
        }
        // Nếu truy cập qua IP LAN hoặc WAN
        return `http://${hostname}:3000`;
    }
    
    return 'http://127.0.0.1:3000';
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
        if (typeof window !== 'undefined') {
            const language = localStorage.getItem('app_language') || 'vi';
            config.headers['Accept-Language'] = language;
        }

        // Lưu ý: Chúng ta KHÔNG cần đính kèm Token (Authorization: Bearer...) ở đây nữa,
        // vì tùy chọn withCredentials = true ở trên đã lo việc ngầm gửi Cookie rồi!

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