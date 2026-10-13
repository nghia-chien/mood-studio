# TASK-001 — Luồng yêu cầu đặt lịch

## Trạng thái

`READY FOR REVIEW` — xác nhận stack/repository trước khi triển khai.

## 1. Mục tiêu

Triển khai luồng MVP cho phép khách gửi yêu cầu đặt lịch chụp theo concept và gói đã chọn; Admin xem yêu cầu và xử lý trạng thái. Đây là **booking request**, không phải hệ thống tự chọn lịch trống hoặc xác nhận chỗ tức thời.

## 2. Tài liệu liên quan

- `AGENTS.md`
- `docs/00-project-overview.md`
- `docs/02-architecture.md`
- `docs/03-tech-stack.md`
- `docs/04-coding-standards.md`
- `docs/08-environments.md`
- `docs/09-testing-strategy.md`

## 3. Phạm vi

### Bao gồm

- Form public gửi yêu cầu với tên, số điện thoại, concept, gói chụp, ngày/giờ mong muốn và ghi chú tùy chọn; email tùy chọn nếu không có yêu cầu mới.
- Backend validation và tạo booking ở trạng thái `PENDING`.
- Backend kiểm tra concept/package tồn tại và đang khả dụng; package thuộc concept.
- Backend lấy giá/tên gói từ database và lưu snapshot.
- Admin xem danh sách booking, xem chi tiết và cập nhật trạng thái theo state machine.
- Loading, success, validation error và API error cho form.
- Test logic và API theo `docs/09-testing-strategy.md`.

### Không bao gồm

- Tài khoản khách hàng, thanh toán, voucher, email/SMS notification.
- Tự động dò lịch trống, giữ chỗ, chống trùng theo thời lượng hoặc tự động xác nhận.
- Lịch dạng calendar, phân công nhân viên, nhiều chi nhánh.
- Xóa vật lý booking từ giao diện Admin.

## 4. Quy tắc nghiệp vụ

1. Server luôn gán `PENDING` khi tạo booking; bỏ qua hoặc từ chối trường status do client gửi.
2. Không tin `price`/`packageName` từ client; lấy thông tin từ database.
3. Lưu tối thiểu `packageNameSnapshot` và `priceSnapshot`.
4. Không nhận booking cho concept chưa publish hoặc package inactive.
5. Không nhận package không thuộc concept gửi kèm.
6. Admin API được bảo vệ tại backend.
7. Public API không cung cấp danh sách/chi tiết booking.
8. Chuyển trạng thái tuân theo:
   - `PENDING` → `CONFIRMED` hoặc `REJECTED`.
   - `CONFIRMED` → `COMPLETED` hoặc `CANCELLED`.
9. Không tự coi booking là đã xác nhận khi form trả thành công.
10. Xử lý ngày/giờ theo `Asia/Ho_Chi_Minh`; không phát minh giờ hoạt động hoặc thời lượng buổi chụp.

## 5. Acceptance criteria

- [ ] Khách có thể mở form từ một concept/gói hợp lệ và các lựa chọn được điền phù hợp.
- [ ] Backend từ chối dữ liệu thiếu hoặc sai định dạng với HTTP status và message nhất quán.
- [ ] Booking hợp lệ được lưu một lần với trạng thái `PENDING`.
- [ ] Giá và tên gói trong booking là snapshot lấy từ server.
- [ ] Concept/package không khả dụng hoặc quan hệ không khớp khiến request thất bại.
- [ ] Admin chưa xác thực không thể gọi API quản trị booking.
- [ ] Admin có thể lọc/xem danh sách và xem chi tiết booking mà không lộ dữ liệu nội bộ ra public.
- [ ] Chuyển trạng thái không hợp lệ bị từ chối.
- [ ] Frontend hiển thị loading, thành công và lỗi; không thông báo lịch đã được xác nhận.
- [ ] Có test cho các trường hợp quan trọng ở `docs/09-testing-strategy.md`.
- [ ] Đã chạy các lệnh kiểm thử phù hợp của repository và báo cáo chính xác kết quả.

## 6. Những điều cần kiểm tra trước code

- [ ] Đọc cấu trúc repository và xác định framework/package manager thực tế.
- [ ] Xác minh model/schema hiện có của Concept, Package và Booking để tránh tạo trùng.
- [ ] Xác minh cách đăng nhập Admin hiện tại.
- [ ] Xác minh quan hệ Package–Concept có đúng giả định một package thuộc một concept không.
- [ ] Xác minh định dạng lưu ngày/giờ và quy ước response/error của API hiện tại.

Nếu repository chưa tồn tại hoặc quyết định stack/schema chưa được chốt, ghi lại đề xuất và chờ phê duyệt trước khi scaffold hoặc thêm dependencies lớn.

## 7. Báo cáo sau thực hiện

Báo cáo theo cấu trúc:

1. Tóm tắt thay đổi.
2. File/module đã thêm hoặc sửa.
3. API/schema bị ảnh hưởng.
4. Test/lint/type-check/build đã chạy và kết quả.
5. Giả định, điểm chưa hoàn tất hoặc rủi ro còn lại.
