# Kế hoạch phát triển: Hệ thống Cấp Giấy Chứng Nhận Hiến Máu (Bài 20)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Cấp giấy chứng nhận điện tử cho tình nguyện viên (TNV) sau khi họ hiến máu thành công (đơn đăng ký có trạng thái `DaHoanThanh`).
- **Ràng buộc:** Chỉ những đơn hiến máu có trạng thái `DaHoanThanh` và chưa từng được cấp chứng nhận (hoặc đã cấp nhưng ở trạng thái hợp lệ) mới hiển thị trong danh sách chờ cấp.

## 2. Thiết kế API Backend (C#)
- **Controller:** `ChungNhanController.cs`
- **Các API cần thiết:**
  - `GET /api/chungnhan/candidates`: Lấy danh sách các đơn đăng ký đã hoàn thành hiến máu nhưng chưa được cấp chứng nhận.
  - `POST /api/chungnhan/issue`: Phát hành giấy chứng nhận mới cho một đơn đăng ký (Tạo bản ghi mới trong bảng `CHUNGNHAN`).
  - `GET /api/chungnhan/my-certificates`: Lấy danh sách chứng nhận của TNV hiện tại (dùng token đăng nhập).

## 3. Thiết kế Frontend (React)
- **Trang Admin (`AdminChungNhan.jsx`):**
  - Hiển thị bảng danh sách các ứng viên chờ cấp chứng nhận.
  - Nút "Cấp chứng nhận" gọi API `POST /api/chungnhan/issue`.
  - Màn hình xem trước chứng nhận trước khi cấp.
- **Trang Lịch sử TNV (`MyDonations.jsx`):**
  - Hiển thị thêm nút "Xem chứng nhận" đối với những lượt hiến máu đã được cấp.
  - Hiển thị chứng nhận dạng modal/popup đẹp mắt để TNV tải về hoặc chụp màn hình.

## 4. Kịch bản kiểm thử (Test Cases)
1. Đăng nhập tài khoản NVYT, truy cập màn hình Cấp chứng nhận, kiểm tra danh sách có đúng hiển thị các đơn `DaHoanThanh` không.
2. Bấm cấp chứng nhận cho 1 đơn -> Kiểm tra đơn đó biến mất khỏi danh sách chờ.
3. Đăng nhập tài khoản TNV của đơn đó -> Vào lịch sử hiến máu -> Xác nhận nút "Xem chứng nhận" hiển thị và click hiển thị đúng thông tin chiến dịch, thể tích máu, ngày hiến.
