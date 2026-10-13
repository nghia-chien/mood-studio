# 05 — Folder Structure

## 1. Quy tắc ưu tiên

Repository thực tế là nguồn chuẩn. Agent phải xem cấu trúc, manifest và cách tổ chức hiện hữu trước khi tạo file. Không di chuyển hoặc tái cấu trúc hàng loạt chỉ để khớp sơ đồ đề xuất.

## 2. Cấu trúc tham khảo cho repository mới

```text
mood-studio/
├── AGENTS.md
├── docs/
│   ├── 00-project-overview.md
│   ├── 02-architecture.md
│   ├── 03-tech-stack.md
│   ├── 04-coding-standards.md
│   ├── 05-folder-structure.md
│   ├── 08-environments.md
│   └── 09-testing-strategy.md
├── tasks/
│   └── TASK-001-booking-request.md
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/                 # router, providers, app setup
│       ├── components/          # shared UI, layout
│       ├── features/
│       │   ├── concepts/
│       │   ├── packages/
│       │   ├── gallery/
│       │   └── bookings/
│       ├── lib/                 # API client, helpers
│       ├── pages/               # chỉ dùng nếu phù hợp quy ước router
│       └── styles/
├── backend/
│   └── src/
│       ├── config/
│       ├── middlewares/
│       ├── modules/
│       │   ├── auth/
│       │   ├── concepts/
│       │   ├── packages/
│       │   ├── gallery/
│       │   └── bookings/
│       ├── utils/
│       ├── app.*
│       └── server.*
└── .env.example
```

Đây là cấu trúc minh họa, không bắt buộc dùng mọi folder. Nếu dự án dùng monorepo, Next.js full-stack hoặc layout khác, cập nhật tài liệu sau khi kiến trúc được xác nhận.

## 3. Quy tắc đặt file

- Đặt file gần module sở hữu nghiệp vụ.
- Thành phần dùng chung thực sự mới đưa vào `components/shared` hoặc thư mục tương đương.
- Schema/validation của module không đặt rải rác ở root.
- Test đặt theo quy ước hiện có: cạnh file, trong `tests/`, hoặc `__tests__/`; chỉ chọn một cách nhất quán.
- Không tạo `utils` để chứa các hàm không liên quan; ưu tiên module nghiệp vụ sở hữu hàm.
- Tránh file quá lớn chứa nhiều nghiệp vụ; cũng không chia thành nhiều file chỉ có vài dòng chuyển tiếp vô ích.

## 4. Frontend feature boundary

Mỗi feature có thể chứa API client/hook, component, schema và type riêng nếu stack hiện hữu hỗ trợ. Layout và UI primitive được chia sẻ; quy tắc booking quan trọng vẫn phải được thực thi ở backend.

## 5. Backend module boundary

`concepts`, `packages`, `gallery` và `bookings` sở hữu quy tắc nghiệp vụ của chúng. `bookings` có thể gọi service lấy concept/package để xác thực lựa chọn, nhưng không truy cập trực tiếp các chi tiết nội bộ không cần thiết của module khác.

Không bắt buộc thêm Repository layer cho mọi module. Theo cấu trúc đơn giản nhất đã được repository áp dụng.
