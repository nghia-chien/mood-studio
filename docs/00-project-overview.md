# 00 — Project Overview: MOOD Studio

## 1. Tóm tắt

MOOD Studio cần một website giới thiệu dịch vụ chụp ảnh nghệ thuật, tập trung vào trải nghiệm xem concept/portfolio và gửi yêu cầu đặt lịch. Phong cách thương hiệu mong muốn: Feminine, Elegant, Artistic; màu hồng pastel, trắng kem và be; cảm giác nhẹ nhàng, tinh tế.

## 2. Khách hàng mục tiêu

- Nữ giới khoảng 18–35 tuổi.
- Sinh viên và người yêu thích chụp ảnh nghệ thuật.
- Khách muốn lưu giữ kỷ niệm, chụp sinh nhật hoặc thực hiện concept cá nhân.

## 3. Dịch vụ chính

- Chụp ảnh concept cá nhân.
- Chụp ảnh nghệ thuật.
- Chụp ảnh cổ trang.
- Chụp ảnh chân dung.
- Chụp theo chủ đề và phong cách riêng.

USP theo thông tin ban đầu: phong cách hình ảnh riêng, đa dạng concept nữ tính/cổ trang, chú trọng bối cảnh, trang phục, màu sắc và cảm xúc; có portfolio thực tế trên Facebook.

## 4. Mục tiêu MVP

1. Giới thiệu Studio và dịch vụ chuyên nghiệp.
2. Cho khách xem concept, ảnh mẫu và giá gói chụp.
3. Cho khách gửi yêu cầu đặt lịch với thông tin liên hệ, ngày/giờ mong muốn, concept và gói chụp.
4. Cho Admin quản lý nội dung và xử lý yêu cầu đặt lịch.

## 5. Nhóm người dùng

### Khách truy cập

Không cần tài khoản. Có thể xem nội dung công khai, gửi booking request và mở các kênh liên hệ ngoài website.

### Admin

Đăng nhập để tạo/sửa/ẩn concept, gói chụp và ảnh; xem thông tin yêu cầu đặt lịch; liên hệ khách và cập nhật trạng thái xử lý.

## 6. Trang và chức năng trong phạm vi

- Trang chủ.
- Giới thiệu MOOD Studio.
- Danh sách concept.
- Chi tiết concept.
- Các gói chụp và bảng giá.
- Bộ sưu tập/portfolio.
- Form chọn concept/gói và gửi yêu cầu đặt lịch.
- Liên hệ, liên kết Zalo/Messenger và Google Maps.
- Admin: đăng nhập, CRUD nội dung, quản lý booking.

## 7. Ngoài phạm vi MVP

Không triển khai nếu chưa có yêu cầu/task được duyệt riêng:

- Thanh toán online, giỏ hàng hoặc bán sản phẩm vật lý.
- Tài khoản khách hàng, lịch sử booking của khách hoặc tự hủy lịch qua tài khoản.
- Chatbot, live chat tích hợp hoặc chuyển tiếp hội thoại.
- Tự động xác nhận lịch, giữ chỗ theo thời gian thực hoặc lịch trống tự động.
- Email/SMS tự động, chương trình thành viên, voucher, đánh giá có xác thực.
- Nhiều chi nhánh, nhân viên/role phức tạp, báo cáo doanh thu hoặc analytics nâng cao.
- CMS tổng quát cho mọi nội dung nếu cấu hình tĩnh là đủ.

## 8. Quy tắc nghiệp vụ cấp sản phẩm

- Booking request được tạo ở trạng thái `PENDING`.
- Admin phải kiểm tra và xác nhận thủ công; thông báo thành công khi submit không có nghĩa lịch đã được xác nhận.
- Giá và tên gói phải được lưu snapshot ở booking tại thời điểm gửi yêu cầu.
- Gói phải thuộc concept khách chọn.
- Nội dung chưa publish hoặc gói đã inactive không được khách đặt.
- Lưu lịch sử booking; thông thường đổi trạng thái thay vì xóa.

## 9. Thông tin còn thiếu

Cần xác minh trước khi hoàn thiện nghiệp vụ đặt lịch:

- Tech stack và repository thực tế.
- Một gói có thể dùng cho nhiều concept hay chỉ một concept.
- Bảng giá, nội dung từng gói và những gì được bao gồm.
- Giờ làm việc, ngày nghỉ, thời lượng buổi chụp và khả năng nhận nhiều buổi cùng lúc.
- Email có bắt buộc không; có cần thông báo cho Admin khi nhận booking không.
- Nội dung chính thức: giới thiệu, địa chỉ dạng văn bản, giờ mở cửa, ngôn ngữ và chính sách.

Không tự điền dữ liệu kinh doanh còn thiếu bằng thông tin giả.
