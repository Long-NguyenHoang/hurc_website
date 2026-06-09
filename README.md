# HURC.VN - Corporate News & Recruitment Portal

> Hệ thống cổng thông tin điện tử, cập nhật tin tức nội bộ và quản lý tuyển dụng cho công ty.

![NodeJS](https://img.shields.io/badge/Node.js-v24.14.1-339933?style=flat-square&logo=node.js)
![NextJS](https://img.shields.io/badge/Next.js-Frontend-000000?style=flat-square&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-Backend-E0234E?style=flat-square&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v18-4169E1?style=flat-square&logo=postgresql)

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [System Requirements](#-system-requirements)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Git Workflow & Convention](#-git-workflow--convention)
- [Maintainer](#-maintainer)

---

## 🎯 Project Overview

Dự án **hurc.vn** là nền tảng web phục vụ việc cung cấp thông tin chính thức, truyền thông nội bộ và thu hút nhân sự. 

**Core Features (Admin / CMS):**
- **Content Management:** Thêm, xóa, sửa (CRUD) Banners và các bài viết Tin tức.
- **Recruitment Management:** Đăng tải và quản lý các vị trí tuyển dụng.
- **Customer Relations:** Tiếp nhận và quản lý các liên hệ, góp ý từ hành khách/khách hàng.
- **Static Pages:** Quản lý nội dung các trang thông tin giới thiệu công ty.

---

## 💻 System Requirements

Để chạy được dự án trên môi trường local, máy tính cần cài đặt sẵn:
- **Node.js**: `v24.14.1`
- **Package Manager**: `npm`
- **Database**: `PostgreSQL v18`

---

## 🏗 Project Structure

Dự án được tổ chức theo mô hình **Polyrepo** (2 thư mục độc lập nằm trong 1 root folder) để phân tách rõ ràng môi trường giữa Frontend và Backend:

```text
hurc.vn/
├── frontend/       # Next.js (App Router, TailwindCSS, TypeScript)
├── backend/        # NestJS (TypeORM, TypeScript)
├── .gitignore
└── README.md
```

## 🚀 Getting Started
1. Database Setup
Tạo một database trống trên PostgreSQL local của bạn:
CREATE DATABASE hurc_db;

2. Backend Setup (NestJS)
Mở terminal, di chuyển vào thư mục backend:
cd backend

# Cài đặt dependencies
npm install

# Sao chép file cấu hình môi trường (nếu có template) hoặc tự tạo file .env
# Chạy server ở chế độ Development
npm run start:dev
API sẽ khởi chạy tại: http://localhost:3000

3. Frontend Setup (Next.js)
Mở một tab terminal mới, di chuyển vào thư mục frontend:
cd frontend

# Cài đặt dependencies
npm install

# Chạy server ở chế độ Development
npm run dev
Website sẽ khởi chạy tại: http://localhost:3001 (hoặc 3000 tùy port rảnh)

⚙️ Environment Variables
Để chạy backend, hãy tạo file backend/.env với các cấu hình cơ bản sau:
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_DATABASE=hurc_db

🌿 Git Workflow & Convention
Dự án áp dụng quy chuẩn Conventional Commits để quản lý lịch sử source code thống nhất và chuyên nghiệp.

Commit Format:
<type>[optional scope]: <description>
Các <type> được phép sử dụng:
feat: Thêm tính năng mới (vd: feat: add job posting module)
fix: Sửa lỗi (vd: fix: resolve banner display issue on mobile)
chore: Cập nhật cấu hình, thư viện không ảnh hưởng code (vd: chore: update npm packages)
refactor: Tối ưu hoá code hiện tại, không thay đổi logic chức năng
docs: Thêm/sửa tài liệu (vd: docs: update README with new env vars)
(Lưu ý: Luôn tạo nhánh mới (branch) từ main khi làm tính năng mới và gộp code thông qua Pull Request).

## 👨‍💻 Maintainer
Developer: Nguyen Hoang Long
Role: Senior Full-stack Developer