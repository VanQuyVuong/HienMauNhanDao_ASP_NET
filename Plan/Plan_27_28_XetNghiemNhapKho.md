# Kế hoạch phát triển: Kết Quả Xét Nghiệm & Nhập Kho Túi Máu (Bài 27 & 28)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Quản lý quy trình kiểm nghiệm an toàn truyền máu (kiểm tra các bệnh truyền nhiễm HIV, HBV, HCV, Giang mai...) và làm thủ tục nhập kho cho các túi máu đạt chuẩn an toàn.
- **Quy trình:** Nhập kết quả xét nghiệm cho túi máu -> Nếu kết quả là "An toàn" -> Thủ kho duyệt phiếu nhập -> Tăng số lượng ml máu tương ứng trong `KhoMau`.

## 2. Thiết kế API Backend (C#)
- **Controller:** `KetQuaXetNghiemController.cs` và `PhieuNhapXuatController.cs`
- **Các API cần thiết:**
  - `POST /api/ketquaxetnghiem`: Lưu kết quả xét nghiệm của túi máu. Nếu phát hiện nhiễm bệnh, tự động đánh dấu túi máu là `DaHuy`.
  - `POST /api/phieunhapxuat/nhap-kho`: Thủ kho tạo phiếu nhập kho cho túi máu an toàn -> Tự động cập nhật cộng dồn thể tích máu vào bảng `KHOMAU` theo nhóm máu tương ứng.

## 3. Thiết kế Frontend (React)
- **Trang Xét nghiệm (`KetQuaXetNghiem.jsx`):**
  - Giao diện nhập kết quả test nhanh các virus truyền nhiễm cho từng mã túi máu.
- **Trang Nhập kho (`QuanLyNhapKho.jsx`):**
  - Giao diện dành cho Thủ kho để kiểm tra danh sách túi máu an toàn và click xác nhận "Duyệt Nhập Kho" để chính thức cho vào kho lưu trữ.

## 4. Kịch bản kiểm thử (Test Cases)
1. Nhập kết quả xét nghiệm một túi máu dương tính với HBV -> Kiểm tra xem túi máu đó có tự động chuyển sang trạng thái `DaHuy` hay không.
2. Nhập kết quả xét nghiệm âm tính (An toàn) -> Thủ kho vào duyệt nhập kho -> Xác nhận trữ lượng máu của nhóm máu đó trong bảng `KHOMAU` tăng lên chính xác bằng thể tích túi máu vừa nhập.
