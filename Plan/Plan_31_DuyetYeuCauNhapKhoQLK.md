# Kế hoạch phát triển: Thống Kê & Duyệt Yêu Cầu Nhập Kho Theo Chiến Dịch (Bài 31)

## 1. Phân tích nghiệp vụ
- **Mục tiêu:** Phân hệ chuyên biệt dành cho Thủ kho (QLK) quản lý lượng túi máu thu được cụ thể theo từng chiến dịch hiến máu và thực hiện duyệt nhập kho hàng loạt.
- **Ràng buộc:** Chỉ tính các túi máu có kết quả xét nghiệm an toàn thuộc chiến dịch đó.

## 2. Thiết kế API Backend (C#)
- **Controller:** `TuiMauController.cs` (nâng cấp)
- **Các API cần thiết:**
  - `GET /api/tuimau/blood-units`: Trả về số lượng túi máu và tổng thể tích máu thu hoạch được phân tích theo từng chiến dịch (truyền tham số `maChienDich`).

## 3. Thiết kế Frontend (React)
- **Giao diện thủ kho:**
  - Trang duyệt yêu cầu nhập kho (`DuyetYeuCauNhapKho.jsx`): Hiển thị các yêu cầu nhập kho chờ duyệt.
  - Trang thống kê nhập kho theo sự kiện (`ThongKeNhapKhoChienDich.jsx`): Hiển thị biểu đồ và danh sách tổng lượng máu thu được của từng chiến dịch cụ thể.

## 4. Kịch bản kiểm thử (Test Cases)
1. Chọn chiến dịch "Giọt máu hồng Đà Nẵng" -> Xem thống kê -> Xác nhận số túi máu và thể tích hiển thị đúng.
2. Thực hiện duyệt nhập kho 1 túi máu -> Xem lại thống kê của chiến dịch đó -> Xác nhận thể tích máu tăng lên tương ứng.
