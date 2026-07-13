# Kế hoạch phát triển: Thống Kê & Biểu Đồ Phân Tích (Dashboard) (Bài 23)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Cung cấp số liệu tổng quan và biểu đồ trực quan cho Ban quản trị về tình hình hiến máu (Tổng thể tích máu, lượng máu theo nhóm, biến động thu thập qua các tháng).
- **Ràng buộc:** Số liệu thể tích chỉ tính trên các túi máu đã nhập kho thành công (`DaLuuKho`).

## 2. Thiết kế API Backend (C#)
- **Controller:** `ThongKeController.cs`
- **Các API cần thiết:**
  - `GET /api/thongke/tong-quan`: Trả về các số liệu:
    - Tổng số TNV đã đăng ký.
    - Tổng thể tích máu đã thu thập (ml).
    - Phân phối cơ cấu nhóm máu hiện có trong kho.
    - Thống kê thể tích máu thu hoạch theo tháng trong 6 tháng gần nhất.

## 3. Thiết kế Frontend (React)
- **Trang Tổng quan (`AdminDashboard.jsx`):**
  - Hiển thị các thẻ chỉ số (KPI Cards) hiện đại.
  - Vẽ **Biểu đồ cột SVG** (Bar Chart) động mô tả lượng máu thu thập theo từng tháng.
  - Vẽ **Thanh tiến trình** (Progress Bars) so sánh trữ lượng thực tế từng nhóm máu trong kho so với ngưỡng an toàn quy định.

## 4. Kịch bản kiểm thử (Test Cases)
1. Đăng nhập tài khoản Admin, vào trang Dashboard -> Kiểm tra xem các số liệu hiển thị có khớp với dữ liệu thực tế trong DB hay không.
2. Nhập thêm một túi máu mới vào kho -> Load lại Dashboard -> Xác nhận tổng ml máu và biểu đồ cột tự động cập nhật tăng lên tương ứng.
