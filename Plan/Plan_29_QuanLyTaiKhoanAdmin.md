# Kế hoạch phát triển: Quản Lý Tài Khoản Người Dùng Cho Admin (Bài 29)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Cung cấp công cụ cho Admin quản trị tài khoản của nhân viên nội bộ (Admin, Bác sĩ, Nhân viên y tế, Thủ kho).
- **Ràng buộc:**
  - Mật khẩu tạo mới phải được băm bảo mật bằng thư viện BCrypt ở Backend.
  - Không cho phép xóa tài khoản đang có các giao dịch liên kết dữ liệu quan trọng, thay vào đó cho phép Vô hiệu hóa hoạt động.

## 2. Thiết kế API Backend (C#)
- **Controller:** `TaiKhoanController.cs`
- **Các API cần thiết:**
  - `GET /api/taikhoan/vai-tro`: Lấy danh sách tài khoản lọc theo vai trò (AD, BS, NVYT, QLK).
  - `POST /api/taikhoan/them`: Tạo tài khoản nhân viên mới (băm mật khẩu tự động).
  - `PUT /api/taikhoan/{id}/status`: Bật/Tắt trạng thái hoạt động (`TrangThai` = true/false).
  - `DELETE /api/taikhoan/{id}`: Xóa tài khoản nếu chưa có dữ liệu ràng buộc liên quan.

## 3. Thiết kế Frontend (React)
- **Trang Quản lý (`AdminQuanLyNguoiDung.jsx`):**
  - Bảng danh sách tài khoản nội bộ kèm bộ lọc vai trò nhanh.
  - Modal "Thêm tài khoản" nhập Email, Mật khẩu và chọn Vai trò nội bộ.
  - Nút Switch bật/tắt nhanh trạng thái hoạt động của tài khoản.

## 4. Kịch bản kiểm thử (Test Cases)
1. Đăng nhập Admin -> Tạo tài khoản Bác sĩ mới: `testbs@gmail.com` mật khẩu `Abc123!@#`.
2. Kiểm tra trong DB xem trường mật khẩu của tài khoản mới có được lưu dưới dạng chuỗi hash BCrypt an toàn không.
3. Vô hiệu hóa tài khoản mới tạo -> Thử dùng tài khoản đó đăng nhập -> Xác nhận hệ thống báo lỗi chặn đăng nhập thành công.
