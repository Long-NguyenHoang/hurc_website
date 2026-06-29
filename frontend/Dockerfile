# --- BƯỚC 1: CÀI ĐẶT THƯ VIỆN ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- BƯỚC 2: BUILD MÃ NGUỒN ---
FROM node:24-alpine AS builder
WORKDIR /app
# Lấy thư viện đã cài ở bước 1 sang
COPY --from=deps /app/node_modules ./node_modules
# Copy toàn bộ code Frontend
COPY . .
# Tạo các trang tĩnh, nén hình ảnh (SSG/ISR)
RUN npm run build

# --- BƯỚC 3: MÔI TRƯỜNG PRODUCTION ---
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Next.js yêu cầu thu thập dữ liệu (bạn có thể tắt đi cho nhẹ)
ENV NEXT_TELEMETRY_DISABLED=1 

# Copy chính xác những file Next.js cần để chạy (bỏ lại toàn bộ code thừa)
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Lệnh khởi động Next.js
CMD ["npm", "run", "start"]