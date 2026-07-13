# Kế hoạch phát triển: Hệ thống Khai Báo Y Tế & Hồ Sơ Sức Khỏe (Bài 21)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Cho phép TNV khai báo thông tin y tế (triệu chứng lâm sàng, dịch tễ, tiền sử bệnh) ngay sau khi đăng ký hiến máu để làm cơ sở cho Bác sĩ khám sàng lọc.
- **Quy trình:** TNV đăng ký chiến dịch thành công -> Backend sinh `maDon` -> Frontend tự động điều hướng sang trang khai báo y tế kèm theo `maDon` -> TNV khai báo và lưu thông tin vào bảng `HOSOSUCKHOE`.

## 2. Thiết kế API Backend (C#)
- **Controller:** `HoSoSucKhoeController.cs`
- **Các API cần thiết:**
  - `POST /api/hososuckhoe`: Lưu thông tin khai báo y tế mới (nhận vào DTO chứa các câu hỏi y tế và `maDon`).
  - `GET /api/hososuckhoe/don/{maDon}`: Lấy thông tin khai báo y tế theo mã đơn để hiển thị cho Bác sĩ kiểm tra.

## 3. Thiết kế Frontend (React)
- **Trang Khai báo (`KhaiBaoYTe.jsx`):**
  - Giao diện form khảo sát y tế (các câu hỏi Yes/No, nhập chiều cao, cân nặng, tiền sử bệnh).
  - Tự động lấy `maDon` từ đường dẫn url `/khai-bao-y-te/:maDon` để gắn vào payload gửi đi.
- **Điều phối luồng (`CampaignDetail.jsx`):**
  - Sửa logic đăng ký hiến máu thành công để chuyển hướng tới `/khai-bao-y-te/:maDon` thay vì chuyển về Dashboard.

## 4. Kịch bản kiểm thử (Test Cases)
1. TNV bấm đăng ký một chiến dịch hiến máu -> Kiểm tra xem trang web có tự động chuyển sang trang khai báo y tế hay không.
2. Nhập các chỉ số sức khỏe ảo và submit -> Xác nhận dữ liệu được lưu thành công vào cơ sở dữ liệu.
3. Thử gọi API lấy hồ sơ sức khỏe theo mã đơn để chắc chắn Bác sĩ sẽ đọc được thông tin này.
