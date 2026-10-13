# 08 — Environments and Configuration

## 1. Môi trường

Tối thiểu phân biệt:

- **Local development:** chạy trên máy lập trình viên với dữ liệu test.
- **Test/CI:** môi trường kiểm thử tách biệt, không dùng database production.
- **Production:** môi trường phục vụ khách thật, dùng secrets/config riêng.

Không để dữ liệu cá nhân thật hoặc secrets production trong môi trường local/test.

## 2. Nguyên tắc cấu hình

- Không hardcode database URL, API base URL theo môi trường, secret hoặc thông tin dịch vụ.
- Cung cấp `.env.example` chỉ chứa tên biến và giá trị placeholder, không có secrets.
- `.env`, credential file và key riêng phải được loại khỏi source control bằng `.gitignore`.
- Validate biến môi trường khi ứng dụng khởi động và báo lỗi cấu hình thiếu một cách rõ ràng.
- Không expose biến server-only qua prefix biến môi trường public của frontend (ví dụ `VITE_`).
- Không đưa token/secret vào log, response hoặc commit.

## 3. Biến môi trường tham khảo

Tên biến thực tế phải khớp với stack và code đã được duyệt. Danh sách dưới đây là gợi ý, không yêu cầu khai báo những biến mà dự án không dùng.

| Biến | Dùng ở đâu | Ghi chú |
|---|---|---|
| `NODE_ENV` | Backend | `development`, `test`, `production` nếu dùng Node.js |
| `PORT` | Backend | Port do môi trường triển khai cấp hoặc cấu hình |
| `DATABASE_URL` | Backend | Connection string; chỉ server được đọc |
| `ADMIN_SESSION_SECRET` hoặc biến tương ứng | Backend | Chỉ dùng nếu cơ chế auth cần secret; tên cuối cùng theo implementation |
| `CORS_ORIGINS` | Backend | Danh sách origin được phép, không dùng wildcard tùy tiện khi có credentials |
| `APP_URL` | Backend | URL public của ứng dụng nếu cần tạo URL |
| `VITE_API_BASE_URL` | Frontend Vite | Chỉ dùng nếu frontend thực sự dùng Vite; không chứa secret |
| `IMAGE_STORAGE_*` | Backend | Chỉ khai báo theo dịch vụ lưu ảnh đã chọn; không commit key |

Không sao chép nguyên danh sách vào `.env` nếu biến chưa được dùng.

## 4. CORS, cookie và HTTPS

- Chỉ cho phép origin cần thiết ở production.
- Nếu auth dùng cookie, cấu hình `HttpOnly`, `Secure` ở production và `SameSite` phù hợp với kiến trúc/domain.
- Không lưu credential hoặc secret dài hạn vào frontend bundle.
- Production cần HTTPS.
- Không tự chọn JWT/cookie/session trước khi kiểm tra auth hiện tại và yêu cầu triển khai.

## 5. Database và timezone

- Development/test phải dùng database riêng hoặc schema được tách biệt rõ.
- Không chạy seed/reset/destructive migration trên production ngoài quy trình được duyệt.
- Hiển thị ngày giờ theo múi giờ `Asia/Ho_Chi_Minh`.
- Lưu timestamps kỹ thuật theo UTC nếu database/ORM hỗ trợ; xử lý `requestedDate`/`requestedTime` theo quy tắc rõ ràng để không bị đổi ngày do timezone.

## 6. Deployment checklist tối thiểu

- Secrets cấu hình bằng secret manager/environment của hosting.
- Đã cấu hình URL frontend/backend và CORS chính xác.
- Đã chạy migration cần thiết theo quy trình an toàn.
- Đã kiểm tra kết nối database, storage và health endpoint nếu có.
- Không bật debug/stack trace công khai.
- Đã xác minh quy trình tạo/đặt lại credential Admin.
