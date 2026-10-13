# 02 — Architecture

## 1. Nguyên tắc kiến trúc

Ưu tiên kiến trúc đơn giản, theo module nghiệp vụ (modular monolith) cho MVP. Không tách microservice. Tôn trọng kiến trúc và các ranh giới đã có trong repository nếu dự án đã được khởi tạo.

## 2. Thành phần logic

- **Public Web:** trang giới thiệu, concept, portfolio và form booking.
- **Admin Web:** đăng nhập, quản lý nội dung và booking.
- **Backend API:** xác thực, validation và thực thi quy tắc nghiệp vụ.
- **Database:** lưu concept, package, ảnh metadata, admin và booking.
- **Image storage:** nơi lưu file ảnh; database chỉ lưu URL/metadata. Có thể dùng giải pháp hiện hữu; không tự thêm dịch vụ khi chưa xác định.

## 3. Ranh giới module backend

### Auth

Đăng nhập Admin và middleware bảo vệ endpoint quản trị. MVP chỉ cần một nhóm quyền Admin, trừ khi yêu cầu thay đổi.

### Concepts

Quản lý thông tin concept, slug, ảnh đại diện, trạng thái xuất bản và thứ tự hiển thị.

### Packages

Quản lý gói chụp, giá, nội dung bao gồm và trạng thái hoạt động. Package tham chiếu concept theo mô hình mặc định ở dưới.

### Gallery

Quản lý URL ảnh, caption, concept liên quan (nếu có), trạng thái hiển thị và thứ tự.

### Bookings

Tạo booking request công khai; Admin xem danh sách/chi tiết và cập nhật trạng thái. Đây là module sở hữu state machine và các kiểm tra nghiệp vụ đặt lịch.

### Site Info

Nếu thông tin giới thiệu/liên hệ cần cập nhật qua Admin, có thể thêm module cấu hình nhỏ. Nếu chưa cần, nội dung tĩnh trong frontend hoặc cấu hình hiện hữu là đủ; không xây CMS tổng quát.

## 4. Quy tắc phân tầng

Áp dụng theo cấu trúc hiện có. Với backend mới, phân tách logic theo trách nhiệm:

- **Routes:** khai báo endpoint và middleware.
- **Controller/Handler:** đọc request, gọi service, trả HTTP response.
- **Service:** chứa quy tắc nghiệp vụ và điều phối thao tác dữ liệu.
- **Model/ORM/Data access:** định nghĩa schema và truy vấn dữ liệu.
- **Validation:** kiểm tra shape/range dữ liệu đầu vào.

Không bắt buộc tạo Repository layer riêng nếu nó chỉ chuyển tiếp gọi ORM mà không tạo giá trị. Controller không nên tự chứa toàn bộ nghiệp vụ. Frontend không được là nơi thực thi quy tắc bảo mật hoặc quyết định giá/trạng thái đáng tin cậy.

## 5. Quan hệ dữ liệu dự kiến

```text
Concept 1 ───── * Package
Concept 1 ───── * GalleryImage (GalleryImage cũng có thể không gắn concept)
Concept 1 ───── * Booking
Package 1 ───── * Booking
Admin   1 ───── * (các thao tác quản trị; audit log không bắt buộc trong MVP)
```

Quan hệ Package–Concept hiện là giả định MVP: một package thuộc một concept. Cần xác nhận với khách. Nếu một gói có thể dùng cho nhiều concept, phải điều chỉnh schema và validation trước khi triển khai.

Booking nên lưu `conceptId`, `packageId` cùng snapshot tên gói/giá. Cân nhắc giữ snapshot tên concept nếu cần hiển thị chính xác lịch sử sau khi concept được đổi tên.

## 6. Luồng tạo booking

1. Public client gửi thông tin liên hệ, concept/package, ngày giờ đề xuất và ghi chú.
2. API validate dữ liệu.
3. Backend kiểm tra concept được publish và package đang active, đồng thời package thuộc concept.
4. Backend lấy tên/giá chuẩn từ database; không lấy giá do client cung cấp.
5. Backend tạo booking với trạng thái `PENDING`, snapshot thông tin gói/giá và mã booking nếu quy ước triển khai có mã.
6. Backend trả response không chứa ghi chú nội bộ hoặc dữ liệu nhạy cảm.
7. Admin xử lý thủ công và chuyển trạng thái theo state machine.

## 7. State machine booking

```text
PENDING ──> CONFIRMED ──> COMPLETED
   │             │
   └─> REJECTED  └─> CANCELLED
```

Các chuyển trạng thái hợp lệ mặc định:

- `PENDING` → `CONFIRMED` hoặc `REJECTED`.
- `CONFIRMED` → `COMPLETED` hoặc `CANCELLED`.
- Không cho chuyển ngược trạng thái hoặc chuyển tùy ý qua endpoint update chung.

Việc cho phép Admin sửa một booking đã hoàn tất/hủy phải là quy trình rõ ràng, không tự suy diễn.

## 8. API boundary dự kiến

Public endpoints (ví dụ):

- `GET /api/public/concepts`
- `GET /api/public/concepts/:slug`
- `GET /api/public/concepts/:id/packages`
- `GET /api/public/gallery`
- `POST /api/public/bookings`
- `GET /api/public/site-info` nếu dữ liệu cần được quản lý/lưu backend

Admin endpoints (ví dụ):

- `/api/admin/auth/*`
- `/api/admin/concepts/*`
- `/api/admin/packages/*`
- `/api/admin/gallery/*`
- `/api/admin/bookings/*`

Đây là quy ước đề xuất; giữ tương thích với API hiện có nếu repository đã định nghĩa route khác.

## 9. Lịch và xung đột thời gian

MVP tiếp nhận thời gian khách đề xuất và yêu cầu Admin xác nhận thủ công. Chưa có dữ liệu về giờ hoạt động, thời lượng buổi chụp, buffer, ngày nghỉ hoặc số buổi có thể chạy song song. Do đó không được tuyên bố hỗ trợ kiểm tra lịch trống tự động.

Khi các quy tắc này được xác nhận, tạo task riêng để xác định mô hình lịch và kiểm soát xung đột một cách nhất quán.
