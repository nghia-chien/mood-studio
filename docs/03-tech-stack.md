# 03 — Tech Stack (Verified MVP Implementation)

## 1. Trạng thái xác nhận

Công nghệ thực tế đã được triển khai, kiểm thử và xác nhận hoạt động:

| Thành phần | Công nghệ đã triển khai | Ghi chú |
|---|---|---|
| **Backend Runtime** | Node.js (v24.x LTS) | JavaScript ES Modules (`type: module`) |
| **Backend Framework** | Express.js 4.x | REST API, centralized error handling, rate limiting |
| **Database** | MongoDB Atlas | Cluster kết nối qua Mongoose 8.x, database `mood_studio` |
| **Image Storage** | Cloudinary | Upload buffer qua stream, lưu `secure_url` và `public_id` |
| **Authentication** | JWT + HttpOnly Cookie / Bearer | Hash mật khẩu bằng `bcryptjs` |
| **Validation & State** | Mongoose Schema + Service State Machine | Enforce enum và status transition PENDING → CONFIRMED/REJECTED |
| **Testing** | Node.js Test Runner (`node:test`) + Supertest | Unit & Integration testing (15 test suites) |
| **Frontend Framework** | React 19 + Vite 8 + TypeScript | SPA nhanh, gọn, type-safe |
| **Styling** | Vanilla CSS | Tông màu pastel hồng, trắng kem, be; responsive |
| **Package Manager** | npm | Giữ lockfile chuẩn |

## 2. Ranh giới API chính

- Public API:
  - `GET /api/health`
  - `GET /api/public/concepts`
  - `GET /api/public/concepts/:slug`
  - `GET /api/public/concepts/:id/packages`
  - `GET /api/public/gallery`
  - `POST /api/public/bookings`
- Admin API:
  - `POST /api/admin/auth/login`
  - `POST /api/admin/auth/logout`
  - `GET /api/admin/auth/me`
  - `GET/POST/PATCH/DELETE /api/admin/concepts`
  - `GET/POST/PATCH/DELETE /api/admin/packages`
  - `GET/POST/PATCH/DELETE /api/admin/gallery` & `/upload`
  - `GET/PATCH /api/admin/bookings` & `/status`
