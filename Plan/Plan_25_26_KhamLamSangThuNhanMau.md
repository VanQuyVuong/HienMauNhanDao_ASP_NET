# Kế hoạch phát triển: Khám Lâm Sàng & Thu Nhận Túi Máu (Bài 25 & 26)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Quy trình làm việc của Bác sĩ sàng lọc trước hiến máu. Khám chỉ số sinh tồn (Huyết áp, cân nặng, nhịp tim) cho TNV. Nếu đạt, hệ thống sẽ tự động tạo mã túi máu và in nhãn để chuẩn bị thu nhận máu.
- **Quy trình:** Quét mã/Chọn đơn đăng ký -> Nhập kết quả khám -> Nếu "Đạt" -> Sinh bản ghi `TUIMAU` ở trạng thái `ChoXetNghiem`.

## 2. Thiết kế API Backend (C#)
- **Controller:** `KhamLamSangController.cs`
- **Các API cần thiết:**
  - `GET /api/khamlamsang/queue`: Lấy danh sách TNV đang xếp hàng chờ khám lâm sàng trong ngày.
  - `POST /api/khamlamsang/save`: Lưu phiếu khám lâm sàng. Nếu kết quả khám là `Dat`, tự động tạo bản ghi `TuiMau` mới liên kết với đơn đó.

## 3. Thiết kế Frontend (React)
- **Trang Khám bệnh (`KhamLamSang.jsx`):**
  - Màn hình chia đôi: Bên trái là hàng đợi chờ khám, bên phải là form nhập liệu chỉ số sinh tồn.
  - Khi lưu kết quả "Đạt", tự động hiển thị popup xem trước nhãn túi máu gồm: Mã túi máu, Nhóm máu (nếu có), Ngày hiến để NVYT in dán lên túi máu thực tế.

## 4. Kịch bản kiểm thử (Test Cases)
1. Đơn đăng ký ở trạng thái `ChoKham` -> Kiểm tra xem có hiển thị trong danh sách chờ của Bác sĩ hay không.
2. Bác sĩ nhập chỉ số nhịp tim quá cao (Không đạt) -> Lưu -> Đơn đăng ký chuyển trạng thái thành `KhongDatLamsang` và không sinh túi máu.
3. Bác sĩ nhập chỉ số bình thường (Đạt) -> Lưu -> Xác nhận hệ thống tự sinh mã túi máu mới và chuyển trạng thái đơn sang `DaLayMau`.
