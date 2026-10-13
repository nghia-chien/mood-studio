# 09 — Testing Strategy

## 1. Mục tiêu

Kiểm thử tập trung vào các quy tắc nghiệp vụ và lỗi có thể gây lộ dữ liệu hoặc booking sai. Không yêu cầu dựng hạ tầng test phức tạp hơn quy mô MVP; ưu tiên công cụ đã có trong repository.

## 2. Các lớp test

### Unit test

Kiểm tra service/logic độc lập, đặc biệt:

- Chuyển trạng thái booking hợp lệ/không hợp lệ.
- Tính và snapshot giá từ package ở thời điểm tạo booking.
- Kiểm tra package có thuộc concept hay không.
- Validation ngày giờ, tên, số điện thoại, ghi chú và giá.

### API/integration test

Kiểm tra endpoint cùng middleware và persistence:

- Public list/detail chỉ trả concept đã publish.
- Public gallery chỉ trả ảnh đã publish.
- Không nhận booking với concept unpublished hoặc package inactive.
- Không nhận package không thuộc concept đã chọn.
- Giá client gửi lên (nếu có) không thể ghi đè giá server.
- Booking mới luôn ở `PENDING`.
- API admin trả `401/403` khi chưa xác thực/không đủ quyền.
- API public không cho xem danh sách/chi tiết booking.
- Không thể chuyển booking qua trạng thái trái quy tắc.
- Không xóa dữ liệu nội dung theo cách làm hỏng booking tham chiếu.

### Frontend/component test

- Form thể hiện lỗi trường bắt buộc và lỗi API.
- Người dùng có thể chọn concept/gói hợp lệ và gửi yêu cầu.
- Hiển thị trạng thái đang gửi, lỗi và thành công.
- Concept/gói không còn hoạt động không thể được submit thành công chỉ bằng cách sửa request phía client.
- Admin page phân biệt loading, empty, error và dữ liệu có kết quả.

### Smoke/E2E (nếu repository đã có công cụ)

Một luồng chính: Admin đăng nhập → tạo/publish concept và package → khách xem concept → gửi booking → Admin xem booking → xác nhận booking.

## 3. Acceptance criteria cho booking

1. Request hợp lệ tạo đúng một booking `PENDING`.
2. Request thiếu tên/số điện thoại/concept/package/ngày hoặc giờ bị từ chối với lỗi validation rõ ràng.
3. Giá và tên gói lấy từ database, được lưu snapshot.
4. Booking không tạo được nếu concept/package không tồn tại hoặc không còn khả dụng.
5. Package phải thuộc concept được chọn.
6. Admin có thể đọc booking sau xác thực; public không thể đọc dữ liệu khách hàng.
7. Chỉ các chuyển trạng thái được quy định trong architecture được phép.
8. Ghi chú nội bộ không xuất hiện trong response public.

## 4. Test data và cách chạy

- Dùng dữ liệu giả, ổn định và có thể tái tạo.
- Không dùng số điện thoại, email hoặc thông tin khách thật trong fixture.
- Xác định command từ `package.json`/CI hiện có; không tự đoán command.
- Nếu chưa có test tooling, đề xuất lựa chọn phù hợp nhưng tránh cài nhiều công cụ cùng mục đích.

## 5. Điều kiện báo cáo test

Agent phải ghi rõ:

- Lệnh đã chạy.
- Kết quả pass/fail.
- Test nào chưa chạy và nguyên nhân.
- Rủi ro chưa được kiểm chứng.

Không được tuyên bố test/build thành công khi chưa thực thi lệnh tương ứng.
