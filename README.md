# MOOD Studio — MVP

Website giới thiệu dịch vụ chụp ảnh nghệ thuật & hệ thống quản lý yêu cầu đặt lịch (Booking MVP).

## 1. Công nghệ sử dụng

- **Backend:** Node.js, Express.js (ES Modules), MongoDB Atlas (Mongoose), Cloudinary, JWT, bcryptjs.
- **Frontend:** React, Vite, TypeScript, Vanilla CSS.
- **Testing:** Node.js native test runner (`node:test`), Supertest.

## 2. Cài đặt & Khởi chạy

### Cài đặt dependencies

```bash
# Cài đặt backend
cd backend
npm install

# Cài đặt frontend
cd ../frontend
npm install
```

### Cấu hình biến môi trường

Tạo file `.env` hoặc `.env.local` tại thư mục gốc (tham khảo `.env.example`):

```env
NODE_ENV=development
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=<your-mongodb-atlas-uri>
CLOUDINARY_CLOUD_NAME=nuur1lhb
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
JWT_SECRET=<your-jwt-secret>
ADMIN_EMAIL=admin@moodstu.com
ADMIN_PASSWORD=Admin@123456
```

### Khởi tạo dữ liệu Admin & Mẫu

```bash
cd backend
npm run seed:admin
```

### Chạy kiểm thử tự động Backend

```bash
cd backend
npm test
```

### Khởi chạy ứng dụng

```bash
# Terminal 1 - Backend API (chạy tại port 3000)
cd backend
npm run dev

# Terminal 2 - Frontend UI (chạy tại port 5173)
cd frontend
npm run dev
```

## 3. Ranh giới API chính

### Public APIs
- `GET /api/health` — Kiểm tra trạng thái ứng dụng và cơ sở dữ liệu.
- `GET /api/public/concepts` — Lấy danh sách concept đã xuất bản.
- `GET /api/public/concepts/:slug` — Lấy chi tiết concept theo slug.
- `GET /api/public/concepts/:id/packages` — Lấy các gói chụp đang hoạt động của concept.
- `GET /api/public/gallery` — Lấy ảnh bộ sưu tập đã xuất bản.
- `POST /api/public/bookings` — Gửi yêu cầu đặt lịch (tạo booking trạng thái PENDING với snapshot giá từ server).

### Protected Admin APIs (Yêu cầu xác thực Admin)
- `POST /api/admin/auth/login` — Đăng nhập admin (nhận HttpOnly cookie hoặc token).
- `POST /api/admin/auth/logout` — Đăng xuất admin.
- `GET /api/admin/auth/me` — Lấy thông tin phiên admin hiện tại.
- `GET /api/admin/bookings` — Xem danh sách các yêu cầu đặt lịch (lọc theo trạng thái).
- `GET /api/admin/bookings/:id` — Xem chi tiết yêu cầu đặt lịch.
- `PATCH /api/admin/bookings/:id/status` — Cập nhật trạng thái theo quy tắc state machine (PENDING → CONFIRMED/REJECTED, CONFIRMED → COMPLETED/CANCELLED).
- `POST /api/admin/gallery/upload` — Upload ảnh lên Cloudinary và lưu vào cơ sở dữ liệu.
