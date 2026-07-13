# Kế hoạch phát triển: Tra Cứu Thông Tin Tình Nguyện Viên Cho NVYT (Bài 30)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Cho phép Nhân viên y tế (NVYT) tìm kiếm nhanh hồ sơ, nhóm máu và lịch sử hiến máu của Tình nguyện viên khi họ đến điểm hiến máu để làm thủ tục tiếp đón.
- **Ràng buộc:** Tìm kiếm hỗ trợ tìm gần đúng theo Tên, CCCD hoặc Số điện thoại.

## 2. Thiết kế API Backend (C#)
- **Controller:** `TinhNguyenVienController.cs`
- **Các API cần thiết:**
  - `GET /api/tinhnguyenvien/danh-sach`: Trả về danh sách toàn bộ TNV kèm thông tin tài khoản, nhóm máu và thông tin cá nhân cơ bản để phục vụ việc hiển thị và lọc kiếm.

## 3. Thiết kế Frontend (React)
- **Trang Tra cứu (`AdminQuanLyTNV.jsx`):**
  - Thanh tìm kiếm thông minh tự động lọc dữ liệu khi người dùng gõ phím.
  - Bảng hiển thị thông tin TNV: Họ tên, Ngày sinh, Điện thoại, CCCD, Nhóm máu, Số lần hiến máu thành công.
  - Nút "Lịch sử" hiển thị chi tiết các lần hiến máu trước đó của TNV này.

## 4. Kịch bản kiểm thử (Test Cases)
1. Gõ CCCD chính xác của một TNV vào ô tìm kiếm -> Xác nhận bảng chỉ hiển thị đúng 1 dòng thông tin của TNV đó.
2. Gõ một tên không tồn tại -> Xác nhận bảng hiển thị thông báo "Không tìm thấy tình nguyện viên nào".
