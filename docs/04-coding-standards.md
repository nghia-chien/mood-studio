# 04 — Coding Standards

## 1. Nguyên tắc chung

- Ưu tiên tính dễ đọc, nhất quán và dễ bảo trì hơn abstraction phức tạp.
- Bám theo formatter, linter, naming và style hiện có của repository.
- Dùng tên thể hiện nghiệp vụ: `concept`, `package`, `galleryImage`, `booking`.
- Mỗi thay đổi phải có phạm vi rõ ràng; không trộn refactor không liên quan với feature.
- Không thêm comment chỉ diễn đạt lại code; comment giải thích lý do hoặc quy tắc nghiệp vụ khó thấy.

## 2. Phân chia trách nhiệm

- Route chỉ khai báo endpoint và middleware.
- Controller/handler xử lý HTTP request/response, không chứa toàn bộ business logic.
- Service thực thi quy tắc nghiệp vụ và điều phối data access.
- Model/ORM mô tả schema và thao tác persistence.
- Validation tập trung, tái sử dụng được khi hợp lý.
- Frontend gọi API thông qua lớp/module API hiện có, không rải URL và HTTP handling khắp component.

Không tạo layer chỉ để chuyển tiếp tham số. Chỉ trừu tượng hóa khi cải thiện testability hoặc giảm lặp thực sự.

## 3. Validation và kiểu dữ liệu

- Validate mọi payload public/admin ở backend.
- Trim các chuỗi phù hợp; giới hạn độ dài trường text; kiểm tra định dạng số điện thoại/email nếu có.
- `price` phải là số hợp lệ và không âm; quy tắc tiền tệ/đơn vị phải nhất quán.
- Ngày giờ phải hợp lệ; không chấp nhận giá trị bị parse mơ hồ.
- Không tin các trường `price`, `status`, `adminNote` hoặc `role` do public client gửi.
- Dùng enum/union/constraint cho các trường status thay vì string tự do.

## 4. API và lỗi

- Dùng HTTP status đúng ngữ nghĩa (`2xx`, `400/422`, `401`, `403`, `404`, `409`, `500` theo quy ước dự án).
- Format response phải nhất quán với API hiện có; không tạo envelope mới nếu dự án đã có chuẩn.
- Thông báo lỗi cho client rõ ràng nhưng không lộ stack trace, SQL, secret hoặc thông tin nội bộ.
- Các lỗi nghiệp vụ cần mã/loại lỗi ổn định nếu dự án đã có quy ước.
- Xử lý lỗi tập trung nếu kiến trúc hiện có hỗ trợ.

## 5. Bảo mật và dữ liệu cá nhân

- Mọi endpoint quản trị phải xác thực ở backend.
- Chỉ trả trường cần thiết; không serialize nguyên document nội bộ nếu có trường nhạy cảm.
- Không ghi mật khẩu, cookie, access token, secret hoặc booking payload đầy đủ vào log production.
- Không lưu secret trong source control; dùng environment configuration.
- Kiểm tra quyền trước thao tác đọc/sửa dữ liệu quản trị.
- Hạn chế spam form booking bằng biện pháp rate limiting phù hợp với khả năng hiện hữu; không thêm dịch vụ mới chỉ để thực hiện việc này nếu chưa cần.

## 6. Booking và dữ liệu lịch sử

- Server cấp `PENDING` cho booking mới.
- Server đọc giá từ package và lưu snapshot giá/tên.
- Kiểm tra package thuộc concept được chọn.
- Chuyển trạng thái qua logic nghiệp vụ có kiểm tra trạng thái hiện tại.
- Booking thường được giữ lại; không xóa vật lý để thay thế cho trạng thái `CANCELLED`/`REJECTED`.
- Không tự động coi yêu cầu là `CONFIRMED`.

## 7. Database và thời gian

- Đặt unique constraint/index cho các trường cần duy nhất như `slug` và booking code nếu triển khai.
- Dùng foreign key hoặc cơ chế tham chiếu tương ứng với database hiện hữu.
- Dùng migration/versioning nếu stack hỗ trợ; không sửa schema production thủ công mà không có kế hoạch.
- Lưu timestamps kỹ thuật theo UTC nếu kiến trúc hỗ trợ; quy ước hiển thị thời gian theo `Asia/Ho_Chi_Minh`.
- Ngày và giờ khách đề xuất phải được lưu/parse nhất quán, tránh chuyển ngày do lệch timezone.

## 8. Frontend

- Có trạng thái loading, success, empty và error phù hợp.
- Không chỉ dựa vào validation trình duyệt.
- Không để Admin note hoặc dữ liệu nội bộ trong public page/state.
- Form cần thông báo trường sai có thể hành động; giữ dữ liệu người dùng khi API trả lỗi validation nếu an toàn.
- Không dùng dữ liệu giả như thể là dữ liệu thật của Studio.

## 9. Hoàn thành code

Trước khi báo hoàn tất:

- Xem lại diff và loại bỏ debug code.
- Chạy test/lint/type-check/build phù hợp với repository.
- Bổ sung hoặc cập nhật test cho logic mới và lỗi được sửa.
- Nêu rõ lệnh đã chạy và lệnh nào chưa chạy/không chạy được.
