# Kế hoạch phát triển: Trang Quản Lý Hồ Sơ Sức Khỏe Cho NVYT (Bài 22)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Giúp Nhân viên y tế (NVYT) và Admin theo dõi, tìm kiếm và xem toàn bộ hồ sơ khai báo y tế của các tình nguyện viên đã đăng ký trong hệ thống.
- **Ràng buộc:** Chỉ tài khoản có vai trò `NVYT` hoặc `AD` mới được truy cập trang này.

## 2. Thiết kế API Backend (C#)
- **Controller:** `HoSoSucKhoeController.cs` (nâng cấp)
- **Các API cần thiết:**
  - `GET /api/hososuckhoe/tat-ca`: Lấy toàn bộ danh sách hồ sơ sức khỏe y tế đã được khai báo, kèm thông tin cá nhân của TNV và chiến dịch tương ứng.

## 3. Thiết kế Frontend (React)
- **Trang Quản lý (`AdminKhaiBaoYTe.jsx`):**
  - Hiển thị bảng danh sách hồ sơ y tế với các bộ lọc: Tìm kiếm theo họ tên, CCCD, trạng thái sức khỏe.
  - Nút "Xem chi tiết" mở Modal hiển thị toàn bộ nội dung câu hỏi Yes/No mà TNV đã khai báo.
- **Định tuyến & Navbar:**
  - Cập nhật Route `/admin-khai-bao` trong `App.jsx`.
  - Tích hợp hiển thị liên kết "Quản lý khai báo y tế" trên Navbar của NVYT/Admin.

## 4. Kịch bản kiểm thử (Test Cases)
1. Đăng nhập bằng tài khoản TNV -> Thử truy cập thủ công `/admin-khai-bao` -> Kiểm tra xem hệ thống có chặn và chuyển hướng về trang chủ/báo lỗi 403 không.
2. Đăng nhập bằng tài khoản NVYT -> Vào menu Quản lý khai báo y tế -> Kiểm tra danh sách hồ sơ hiển thị đầy đủ và tìm kiếm hoạt động chính xác.
