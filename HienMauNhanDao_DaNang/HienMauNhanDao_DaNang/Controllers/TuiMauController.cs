using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "QLK,AD")]
    public class TuiMauController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TuiMauController(AppDbContext context)
        {
            _context = context;
        }

        // 1. API lấy số liệu thống kê hạn dùng
        // Đường dẫn: GET /api/tuimau/thong-ke-han-dung
        [HttpGet("thong-ke-han-dung")]
        public async Task<IActionResult> GetThongKeHanDung()
        {
            var homNay = DateTime.Now;
            // Chỉ lấy các túi máu đã được lưu vào kho 
            var danhSachTui = await _context.TuiMaus
                .Where(t => t.TrangThai == TrangThaiTuiMau.DaLuuKho && t.ThoiGianLayMau != null)
                .ToListAsync();

            int daHetHan = 0;
            int sapHetHan = 0;
            int anToan = 0;
            bool canBaoDong = false;

            foreach (var tui in danhSachTui)
            {
                var ngayHetHan = tui.ThoiGianLayMau!.Value.AddDays(365);
                var soNgayConLai = (ngayHetHan - homNay).Days;

                if (soNgayConLai < 0)
                {
                    daHetHan++;
                    if (soNgayConLai <= -20)
                    {
                        canBaoDong = true;
                    }
                }
                else if (soNgayConLai <= 30)
                {
                    sapHetHan++;
                }
                else
                {
                    anToan++;
                }
            } // ✅ Đã đóng vòng lặp foreach ở đây

            return Ok(new
            {
                soLuongHetHan = daHetHan,
                soLuongSapHetHan = sapHetHan,
                soLuongAnToan = anToan,
                coCanhBaoNguyCap = canBaoDong
            });
        } // ✅ Đã đóng hàm GetThongKeHanDung ở đây

        // 2. API lấy chi tiết các túi máu để hiển thị lên bảng
        // Đường dẫn: GET /api/tuimau/danh-sach-han-dung?viewMode=all
        [HttpGet("danh-sach-han-dung")]
        public async Task<IActionResult> GetDanhSachHanDung([FromQuery] string viewMode = "all", [FromQuery] string? search = null)
        {
            var homNay = DateTime.Now;
            var truyVan = _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.ChienDich)
                .Include(t => t.KhoMau)
                .Where(t => t.TrangThai == TrangThaiTuiMau.DaLuuKho && t.ThoiGianLayMau != null);

            // Tìm kiếm theo mã túi máu nếu người dùng gõ tìm kiếm 
            if (!string.IsNullOrEmpty(search))
            {
                truyVan = truyVan.Where(t => t.MaTuiMau.Contains(search));
            }

            var danhSachTui = await truyVan.ToListAsync();

            // Tính toán và định dạng lại dữ liệu trước khi gửi lên React 
            var ketQua = danhSachTui.Select(tui =>
            {
                var ngayHetHan = tui.ThoiGianLayMau!.Value.AddDays(365);
                var soNgayConLai = (ngayHetHan - homNay).Days;
                string trangThaiHan;

                if (soNgayConLai < -30)
                    trangThaiHan = "ARCHIVED_EXPIRED"; // Hết hạn quá 30 ngày chỉ để lưu trữ hồ sơ
                else if (soNgayConLai <= -20)
                    trangThaiHan = "WARNING_EXPIRED";  // Hết hạn quá 20 ngày cảnh báo tiêu hủy gấp
                else if (soNgayConLai < 0)
                    trangThaiHan = "EXPIRED"; // Đã hết hạn
                else if (soNgayConLai <= 30)
                    trangThaiHan = "NEAR_EXPIRY"; // Sắp hết hạn (dưới 30 ngày)
                else
                    trangThaiHan = "SAFE"; // An toàn

                return new
                {
                    maTuiMau = tui.MaTuiMau,
                    maChienDich = tui.DonDangKy?.ChienDich?.MaChienDich ?? "N/A",
                    nhomMau = tui.KhoMau?.NhomMau != null ? tui.KhoMau.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ",
                    theTich = tui.TheTich ?? 0,
                    thoiGianLayMau = tui.ThoiGianLayMau,
                    ngayHetHan = ngayHetHan,
                    soNgayConLai = soNgayConLai,
                    trangThaiHan = trangThaiHan
                };
            }).ToList();

            // Lọc dữ liệu theo tab được chọn bên Frontend 
            if (viewMode == "expired")
            {
                ketQua = ketQua.Where(d => d.trangThaiHan == "EXPIRED" || d.trangThaiHan == "WARNING_EXPIRED" || d.trangThaiHan == "ARCHIVED_EXPIRED").ToList();
            }
            else if (viewMode == "near")
            {
                ketQua = ketQua.Where(d => d.trangThaiHan == "NEAR_EXPIRY").ToList();
            }
            else if (viewMode == "safe")
            {
                ketQua = ketQua.Where(d => d.trangThaiHan == "SAFE").ToList();
            }

            return Ok(ketQua);
        }

        // 3. API tiêu huỷ hàng loạt các túi máu đã hết hạn 
        // Đường dẫn: DELETE /api/tuimau/tieu-huy-hang-loat
        [HttpDelete("tieu-huy-hang-loat")]
        public async Task<IActionResult> TieuHuyHangLoat()
        {
            var homNay = DateTime.Now;
            var danhSachTui = await _context.TuiMaus
                .Where(t => t.TrangThai == TrangThaiTuiMau.DaLuuKho && t.ThoiGianLayMau != null)
                .ToListAsync();

            // Tìm các túi có hạn sử dụng nhỏ hơn hôm nay
            var tuiQuaHan = danhSachTui
                .Where(t => t.ThoiGianLayMau!.Value.AddDays(365) < homNay)
                .ToList();

            if (tuiQuaHan.Any())
            {
                _context.TuiMaus.RemoveRange(tuiQuaHan); // Xóa khỏi CSDL
                await _context.SaveChangesAsync();      // Lưu lại thay đổi
            }

            return Ok(new { success = true, message = $"Đã tiêu hủy thành công {tuiQuaHan.Count} túi máu hết hạn." });
        }

        // 4. API tiêu huỷ 1 túi máu đơn
        // Đường dẫn: DELETE /api/tuimau/tieu-huy-don-le/{id}
        [HttpDelete("tieu-huy-don-le/{id}")]
        public async Task<IActionResult> TieuHuyDonLe(string id)
        {
            var tuiMau = await _context.TuiMaus.FirstOrDefaultAsync(t => t.MaTuiMau == id);
            if (tuiMau == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy túi máu" });
            }

            _context.TuiMaus.Remove(tuiMau);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã tiêu huỷ máu thành công" });
        }
    }
}
