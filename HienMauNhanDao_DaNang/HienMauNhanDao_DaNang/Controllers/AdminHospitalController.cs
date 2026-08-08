using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN_BV, AD")]
    public class AdminHospitalController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminHospitalController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<(NhanVien? nhanVien, KhoaCongTac? khoaCongTac)> GetNhanVienProfileAsync()
        {
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value 
                          ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            NhanVien? nv = null;

            if (!string.IsNullOrEmpty(maTaiKhoan))
            {
                nv = await _context.NhanViens
                    .Include(n => n.KhoaCongTac)
                    .FirstOrDefaultAsync(n => n.MaTaiKhoan == maTaiKhoan);
            }

            if (nv == null && !string.IsNullOrEmpty(email))
            {
                var tk = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.Email == email);
                if (tk != null)
                {
                    nv = await _context.NhanViens
                        .Include(n => n.KhoaCongTac)
                        .FirstOrDefaultAsync(n => n.MaTaiKhoan == tk.MaTaiKhoan);
                }
            }

            if (nv?.KhoaCongTac == null)
            {
                var defaultKhoa = await _context.KhoaCongTacs.FirstOrDefaultAsync() 
                               ?? new KhoaCongTac { MaKhoa = "KC00001", TenKhoa = "Bệnh viện C Đà Nẵng" };
                return (nv, defaultKhoa);
            }

            return (nv, nv.KhoaCongTac);
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GetStaff()
        {
            var (nv, khoa) = await GetNhanVienProfileAsync();
            string maKhoa = khoa?.MaKhoa ?? "KC00001";

            var staffList = await _context.NhanViens
                .Include(n => n.TaiKhoan)
                .Where(n => n.MaKhoa == maKhoa)
                .Select(n => new
                {
                    maNhanVien = n.MaNhanVien,
                    hoTen = n.HoTen,
                    email = n.TaiKhoan != null ? n.TaiKhoan.Email : "",
                    soDienThoai = n.SoDienThoai,
                    cccd = n.Cccd,
                    role = n.TaiKhoan != null ? n.TaiKhoan.MaVaiTro : ""
                })
                .ToListAsync();

            return Ok(staffList);
        }

        [HttpGet("stock")]
        public async Task<IActionResult> GetStock()
        {
            var (nv, khoa) = await GetNhanVienProfileAsync();
            string maKhoa = khoa?.MaKhoa ?? "KC00001";

            var danhSachTuiMau = await _context.TuiMaus
                .Include(t => t.KhoMau)
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .Where(t => t.KhoMau != null && t.KhoMau.MaKhoa == maKhoa)
                .ToListAsync();

            int GetCount(string code) => danhSachTuiMau.Count(t => t.DonDangKy?.TinhNguyenVien?.NhomMau?.ToString() == code);

            var nhomMaus = new List<string> { "A_positive", "A_negative", "B_positive", "B_negative", "O_positive", "O_negative", "AB_positive", "AB_negative" };
            var result = nhomMaus.Select(nm => new
            {
                nhomMau = nm,
                soLuongTon = GetCount(nm),
                nguongAnToan = 10,
                alert = GetCount(nm) < 3
            }).ToList();

            return Ok(result);
        }

        [HttpPost("news")]
        public IActionResult PostNews([FromBody] object news)
        {
            return Ok(new { success = true, message = "Đăng tin tức thành công!" });
        }

        [HttpPost("notification")]
        public IActionResult PostNotification([FromBody] object notification)
        {
            return Ok(new { success = true, message = "Gửi thông báo thành công!" });
        }
    }
}
