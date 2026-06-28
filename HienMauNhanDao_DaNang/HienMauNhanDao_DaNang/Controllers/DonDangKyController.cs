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
    [Authorize] // Ổ KHÓA CHÍNH: Phải có Thẻ (Token) mới được vào các hàm bên dưới!
    public class DonDangKyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DonDangKyController(AppDbContext context)
        {
            _context = context;
        }

        public class DangKyRequest
        {
            public string MaChienDich { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> DangKyHienMau([FromBody] DangKyRequest request)
        {
            // 1. TRÍCH XUẤT THẺ: Nhờ có [Authorize], C# tự động đọc Token và lấy ra Mã Tài Khoản
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;

            // 2. Tự động tìm Hồ sơ Tình nguyện viên của người này
            var tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

            // (Tuyệt chiêu): Nếu họ mới đăng ký tài khoản, chưa có hồ sơ, ta tự động tạo cho họ 1 hồ sơ tạm!
            if (tnv == null)
            {
                tnv = new TinhNguyenVien
                {
                    MaTNV = "TNV" + DateTime.Now.ToString("HHmmss"),
                    MaTaiKhoan = maTaiKhoan,
                    HoTen = "TNV Mới",
                    CCCD = "000000000000",
                    NgaySinh = new DateTime(2000, 1, 1),
                    SoDienThoai = "0000000000"
                };
                _context.TinhNguyenViens.Add(tnv);
                await _context.SaveChangesAsync();
            }

            var chienDich = await _context.ChienDichHienMaus.FindAsync(request.MaChienDich);
            if (chienDich == null) return NotFound(new { success = false, message = "Chiến dịch không tồn tại!" });

            // 3. Nạp đơn với đầy đủ "Danh tính"
            var donMoi = new DonDangKy
            {
                MaDon = "DON" + DateTime.Now.ToString("HHmmss"),
                MaChienDich = request.MaChienDich,
                ThoiGianDangKy = DateTime.Now,
                TrangThai = TrangThaiDonDangKy.ChoDuyet,
                TheTich = 250,
                MaTNV = tnv.MaTNV // Bây giờ C# đã ghi nhận chính xác Ai là người đăng ký!
            };

            _context.DonDangKys.Add(donMoi);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đăng ký hiến máu thành công!" });
        }

        [HttpGet]
        public async Task<IActionResult> LayLichSuDangKy()
        {
            // Trích xuất mã người dùng từ vé Token
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            var tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

            if (tnv == null) return Ok(new { success = true, data = new List<DonDangKy>() });

            // CỰC KỲ QUAN TRỌNG: Lọc (Where) để chỉ lấy đúng những tờ đơn của riêng người này thôi!
            var danhSach = await _context.DonDangKys
                                         .Include(d => d.ChienDich)
                                         .Where(d => d.MaTNV == tnv.MaTNV)
                                         .OrderByDescending(d => d.ThoiGianDangKy)
                                         .ToListAsync();

            return Ok(new { success = true, data = danhSach });
        }
    }
}
