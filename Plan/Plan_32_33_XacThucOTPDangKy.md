# Kế hoạch phát triển: Xác Thực OTP Khi Đăng Ký Tài Khoản (Bài 32 & 33)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Xác minh địa chỉ email của người đăng ký là có thật và chính chủ trước khi cho phép tạo tài khoản TNV, chống spam tài khoản ảo.
- **Luồng hoạt động:**
  1. Người dùng nhập Email, Mật khẩu -> Hệ thống gửi mã OTP 6 chữ số về Email -> Chuyển hướng sang trang OTP.
  2. Người dùng nhập OTP -> Backend xác thực khớp và lưu cờ cache.
  3. Gọi API Đăng ký -> Backend kiểm tra cờ cache -> Đăng ký thành công.

## 2. Thiết kế API Backend (C#)
- **Controller:** `AuthController.cs`
- **Các API cần thiết:**
  - `POST /api/auth/send-otp`: Sinh mã OTP ngẫu nhiên, lưu vào `IMemoryCache` trong 5 phút và gửi email qua SMTP.
  - `POST /api/auth/verify-otp`: Kiểm tra mã OTP. Nếu đúng, lưu cờ xác thực `verified_{email}` vào Cache trong 5 phút.
  - `POST /api/auth/register` (nâng cấp): Kiểm tra cờ `verified_{email}` trong Cache. Nếu chưa có cờ này thì chặn đăng ký (lỗi 400).

## 3. Thiết kế Frontend (React)
- **Trang Đăng ký (`Register.jsx`):** Sửa hàm submit để gọi API `send-otp`, lưu state form và chuyển hướng sang `/otp`.
- **Trang Xác thực (`OtpVerification.jsx` & `OtpVerification.css`):**
  - Giao diện nhập mã OTP 6 chữ số.
  - Nút "Gửi lại OTP" tích hợp bộ đếm ngược countdown 60 giây để tránh spam gửi mail liên tục.
  - Gọi API xác thực OTP -> Thành công thì gọi tiếp API đăng ký tài khoản thực sự.

## 4. Kịch bản kiểm thử (Test Cases)
1. Nhập thông tin đăng ký -> Xác nhận email nhận được mã OTP 6 chữ số.
2. Nhập mã OTP sai hoặc quá hạn 5 phút -> Báo lỗi không cho phép đăng ký.
3. Thử gọi API đăng ký bằng Postman trực tiếp mà không qua OTP -> Xác nhận Backend chặn lỗi 400.
4. Nhập mã OTP đúng -> Đăng ký thành công, chuyển hướng về trang Đăng nhập.
