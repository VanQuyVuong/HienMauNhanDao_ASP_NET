# Kế hoạch phát triển: Nghiệp Vụ Quản Lý Hạn Dùng & Hủy Túi Máu (Bài 24)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Kiểm soát thời hạn sử dụng của túi máu trong kho (365 ngày kể từ ngày hiến). Cảnh báo túi máu sắp hết hạn và hỗ trợ tiêu hủy các túi máu đã quá hạn để đảm bảo an toàn y tế.
- **Trạng thái túi máu:** Khi bị tiêu hủy, trạng thái túi máu chuyển sang `DaHuy`.

## 2. Thiết kế API Backend (C#)
- **Controller:** `TuiMauController.cs`
- **Các API cần thiết:**
  - `GET /api/tuimau/han-dung`: Lấy danh sách túi máu trong kho kèm thông tin ngày hiến, ngày hết hạn và cờ cảnh báo (Sắp hết hạn trong 30 ngày, Quá hạn).
  - `PUT /api/tuimau/tieu-huy/{maTuiMau}`: Tiêu hủy một túi máu cụ thể.
  - `PUT /api/tuimau/tieu-huy-hang-loat`: Tiêu hủy tất cả các túi máu đã quá hạn 365 ngày hiện có trong kho.

## 3. Thiết kế Frontend (React)
- **Trang Quản lý (`QuanLyHanDung.jsx`):**
  - Bảng danh sách hạn dùng túi máu, tô màu đỏ/vàng cho các túi máu quá hạn/sắp hết hạn.
  - Nút "Hủy túi" cho từng dòng và nút "Hủy tất cả túi quá hạn" ở đầu trang.
  - Chức năng **Xuất báo cáo CSV** danh sách túi máu hết hạn phục vụ báo cáo y tế.

## 4. Kịch bản kiểm thử (Test Cases)
1. Tạo một túi máu giả lập có ngày hiến cách đây 13 tháng -> Truy cập trang Quản lý hạn dùng -> Xác nhận dòng túi máu đó được tô đỏ báo "Quá hạn".
2. Bấm nút "Hủy tất cả túi quá hạn" -> Xác nhận túi máu đó chuyển trạng thái sang `DaHuy` và biến mất khỏi bảng lưu trữ kho máu khả dụng.
