# --- BƯỚC 1: XÂY DỰNG (BUILD) ---
# Tải hệ điều hành Linux siêu nhẹ (Alpine) có sẵn Node.js 20
FROM node:24-alpine AS builder

# Tạo một thư mục ảo tên là /app trong máy chủ
WORKDIR /app

# Copy 2 file package.json vào trước để cài đặt
COPY package*.json ./
RUN npm ci

# Copy toàn bộ code Backend của bạn vào /app
COPY . .

# Ra lệnh dịch mã từ TypeScript (.ts) sang JavaScript (.js) vào thư mục dist
RUN npm run build


# --- BƯỚC 2: CHẠY THỰC TẾ (PRODUCTION) ---
# Tạo một môi trường Linux mới tinh, sạch sẽ
FROM node:24-alpine AS production
WORKDIR /app

# Khai báo biến môi trường là Production để ứng dụng chạy mượt hơn
ENV NODE_ENV=production

# Copy lại file package.json
COPY package*.json ./

# CÀI ĐẶT THÔNG MINH: Chỉ cài các thư viện thật sự cần để chạy (bỏ qua devDependencies)
# Lệnh này giúp Server tiết kiệm được hàng trăm MB RAM và ổ cứng
RUN npm ci --omit=dev

# Bê nguyên thư mục dist (đã dịch xong ở Bước 1) sang đây
COPY --from=builder /app/dist ./dist

# Mở cửa số 3000 để giao tiếp
EXPOSE 3000

# Lệnh cuối cùng: Nhấn nút khởi động Backend
CMD ["node", "dist/src/main.js"]