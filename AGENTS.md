# AGENTS.md — Quy tắc làm việc với AI Agent

> Tài liệu entry point cho AI coding agent khi làm việc trên dự án MOOD Studio. Đọc file này trước khi sửa code.

## 1. Nguồn thông tin chuẩn

Đọc các tài liệu liên quan trước khi thực hiện task:

- `docs/00-project-overview.md` — mục tiêu, người dùng và phạm vi MVP.
- `docs/02-architecture.md` — module, layer, dữ liệu và luồng nghiệp vụ.
- `docs/03-tech-stack.md` — công nghệ hiện có hoặc đề xuất đang chờ xác nhận.
- `docs/04-coding-standards.md` — quy ước code và xử lý lỗi.
- `docs/05-folder-structure.md` — vị trí đặt file.
- `docs/08-environments.md` — cấu hình môi trường và secrets.
- `docs/09-testing-strategy.md` — cách kiểm thử và tiêu chí hoàn thành.
- `tasks/TASK-001-booking-request.md` — task mẫu về luồng yêu cầu đặt lịch.

Nếu tài liệu mâu thuẫn với code đang chạy, hãy kiểm tra bằng chứng trong repository và nêu rõ xung đột trước khi thay đổi kiến trúc. Không tự ý viết lại hệ thống chỉ để khớp tài liệu.

## 2. Bối cảnh sản phẩm

MOOD Studio là website giới thiệu dịch vụ chụp ảnh nghệ thuật tại TP. Hồ Chí Minh. Website giúp khách xem concept, gói chụp, giá và portfolio, sau đó gửi yêu cầu đặt lịch. Admin quản lý nội dung và xử lý yêu cầu.

## 3. Phạm vi MVP

Được phép triển khai trong phạm vi đã thống nhất:

- Trang chủ, giới thiệu, danh sách/chi tiết concept, gói chụp và giá, bộ sưu tập ảnh, thông tin liên hệ.
- Form gửi yêu cầu đặt lịch.
- Trang quản trị có đăng nhập để quản lý concept, gói chụp, hình ảnh và booking.
- Liên kết tới Zalo, Messenger và Google Maps.

Không tự thêm nếu chưa có task được duyệt: thanh toán online, giỏ hàng, tài khoản khách hàng, chatbot, tự động xác nhận lịch, lịch trống theo thời gian thực, email/SMS tự động, phân quyền nhiều vai trò, đa chi nhánh, báo cáo doanh thu hoặc CMS tổng quát.

## 4. Quy trình thực hiện task

1. Đọc task và tài liệu được tham chiếu.
2. Kiểm tra cấu trúc repository, package manifests, lockfile, cấu hình và code hiện có trước khi quyết định công nghệ hoặc tạo file.
3. Xác định hành vi hiện tại, yêu cầu cần đạt, rủi ro và các file dự kiến sửa.
4. Với task ảnh hưởng nhiều module hoặc schema/API, trình bày kế hoạch ngắn trước khi triển khai. Không tự mở rộng phạm vi.
5. Thực hiện thay đổi nhỏ nhất để đáp ứng acceptance criteria.
6. Chạy các lệnh test/lint/type-check/build có sẵn và phù hợp. Không nói đã kiểm thử nếu chưa chạy.
7. Báo cáo: thay đổi chính, file đã sửa, kiểm thử đã chạy/kết quả, giả định và vấn đề còn lại.

## 5. Ràng buộc nghiệp vụ bắt buộc

- Chỉ nội dung đã publish/active mới được xuất hiện trên API công khai.
- API quản trị phải yêu cầu xác thực ở backend; ẩn nút trên frontend không phải biện pháp bảo mật.
- Giá được lấy từ dữ liệu phía server, không tin giá do browser gửi lên.
- Khi tạo booking, server tự đặt trạng thái ban đầu là `PENDING`.
- Lưu snapshot tên gói và giá tại thời điểm đặt để lịch sử không thay đổi khi Admin chỉnh sửa gói.
- Kiểm tra package thuộc concept được chọn.
- Kiểm tra chuyển trạng thái booking theo state machine; không cho phép chuyển trạng thái tùy ý.
- Không xóa vật lý booking trong luồng quản trị thông thường. Không xóa concept/package đang được booking tham chiếu nếu việc xóa làm hỏng lịch sử.
- Booking ở MVP là **yêu cầu chờ xác nhận**, không phải chỗ đã giữ hoặc lịch đã được xác nhận.
- Thời gian vận hành của Studio chưa được xác định. Không giả định lịch làm việc hoặc thời lượng buổi chụp để tự động xác nhận giờ trống.
- Không trả `adminNote`, dữ liệu nội bộ hoặc danh sách booking cho API công khai.

## 6. Quy tắc kỹ thuật

- Giữ nguyên stack, package manager, cách tổ chức và quy ước đang có trong repository, trừ khi task được duyệt rõ ràng yêu cầu đổi.
- Không nâng cấp framework, đổi database, tạo lại ứng dụng hoặc thêm thư viện lớn chỉ vì sở thích của agent.
- Không hardcode secrets, URL theo môi trường hoặc dữ liệu khách hàng thật.
- Validate dữ liệu ở server. Frontend validation chỉ hỗ trợ trải nghiệm người dùng.
- Không log mật khẩu, token, secret hoặc thông tin cá nhân không cần thiết.
- Tránh duplicate business logic giữa controller và service.
- Không tạo abstraction/layer chỉ để tăng số lượng file; giữ mức độ phức tạp phù hợp với MVP.
- Giữ thay đổi tập trung vào task; không sửa file không liên quan nếu không cần thiết.

## 7. Khi thiếu thông tin

- Nếu repository đã xác định công nghệ, sử dụng công nghệ đó.
- Nếu repository chưa có code và quyết định ảnh hưởng lớn còn bỏ ngỏ (đặc biệt database, framework, auth hoặc storage), ghi rõ lựa chọn đề xuất và trạng thái chờ xác nhận; không tự tạo scaffold có tính ràng buộc nếu chưa được cho phép.
- Không tự bịa bảng giá, địa chỉ, giờ mở cửa, thời lượng chụp, ảnh hoặc nội dung giới thiệu của doanh nghiệp.
- Dùng dữ liệu giả trong development/test và ghi rõ đó là dữ liệu mẫu.
