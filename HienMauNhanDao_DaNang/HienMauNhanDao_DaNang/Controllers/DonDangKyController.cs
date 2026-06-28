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
    [Authorize]
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
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;

            var tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

            if (tnv == null)
            {
                tnv = new TinhNguyenVien
                {
                    maTNV = "TNV" + DateTime.Now.ToString("HHmmss"), // Đã sửa maTNV
                    MaTaiKhoan = maTaiKhoan,
                    HoTen = "TNV Mới",
                    Cccd = "000000000000", // Đã sửa Cccd
                    NgaySinh = new DateOnly(2000, 1, 1), // Đã sửa DateOnly
                    SoDienThoai = "0000000000"
                };
                _context.TinhNguyenViens.Add(tnv);
                await _context.SaveChangesAsync();
            }

            var chienDich = await _context.ChienDichHienMaus.FindAsync(request.MaChienDich);
            if (chienDich == null) return NotFound(new { success = false, message = "Chiến dịch không tồn tại!" });

            var donMoi = new DonDangKy
            {
                MaDon = "DON" + DateTime.Now.ToString("HHmmss"),
                MaChienDich = request.MaChienDich,
                ThoiGianDangKy = DateTime.Now,
                TrangThai = TrangThaiDonDangKy.ChoDuyet,
                TheTich = 250,
                MaTNV = tnv.maTNV // Đã sửa maTNV
            };

            _context.DonDangKys.Add(donMoi);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đăng ký hiến máu thành công!" });
        }

        [HttpGet]
        public async Task<IActionResult> LayLichSuDangKy()
        {
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            var tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

            if (tnv == null) return Ok(new { success = true, data = new List<DonDangKy>() });

            var danhSach = await _context.DonDangKys
                                         .Include(d => d.ChienDich)
                                         .Where(d => d.MaTNV == tnv.maTNV) // Đã sửa maTNV
                                         .OrderByDescending(d => d.ThoiGianDangKy)
                                         .ToListAsync();

            return Ok(new { success = true, data = danhSach });
        }
    }
}
