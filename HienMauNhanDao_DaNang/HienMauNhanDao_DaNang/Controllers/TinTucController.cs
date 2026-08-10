using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HienMauNhanDao_DaNang.Models;
using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Common;
using HienMauNhanDao_DaNang.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TinTucController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TinTucController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/TinTuc (Public)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveNews()
        {
            var news = await _context.TinTucs
                .OrderByDescending(t => t.NgayDang)
                .Select(t => new
                {
                    t.MaTinTuc,
                    t.TieuDe,
                    t.NoiDung,
                    t.HinhAnh,
                    t.LoaiTin,
                    t.ChuKyLap,
                    t.NgayDang
                })
                .ToListAsync();

            return Ok(news);
        }

        // GET: api/TinTuc/{id} (Public)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetNewsById(string id)
        {
            var news = await _context.TinTucs
                .Where(t => t.MaTinTuc == id)
                .Select(t => new
                {
                    t.MaTinTuc,
                    t.TieuDe,
                    t.NoiDung,
                    t.HinhAnh,
                    t.LoaiTin,
                    t.NgayDang,
                    NguoiDang = t.NguoiDang != null ? t.NguoiDang.HoTen : "Ban Quản Trị"
                })
                .FirstOrDefaultAsync();

            if (news == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy bài viết."));
            }

            return Ok(news);
        }

        // POST: api/TinTuc (Auth - Admin/BV)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateNews([FromBody] NewsDto dto)
        {
            var userEmail = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userEmail)) return Unauthorized();

            var nhanVien = await _context.NhanViens
                .Include(n => n.TaiKhoan)
                .FirstOrDefaultAsync(n => n.TaiKhoan != null && n.TaiKhoan.Email == userEmail);
            string maNhanVien = nhanVien?.MaNhanVien ?? "NV00001";

            // Generate MaTinTuc
            int count = await _context.TinTucs.CountAsync();
            string newMa = $"TT{(count + 1):D5}"; // TT00001
            while (await _context.TinTucs.AnyAsync(t => t.MaTinTuc == newMa))
            {
                count++;
                newMa = $"TT{(count + 1):D5}";
            }

            var tinTuc = new TinTuc
            {
                MaTinTuc = newMa,
                MaNhanVien = maNhanVien,
                TieuDe = dto.TieuDe,
                NoiDung = dto.NoiDung,
                HinhAnh = dto.HinhAnh,
                LoaiTin = dto.LoaiTin,
                ChuKyLap = dto.ChuKyLap,
                NgayDang = DateTime.Now
            };

            _context.TinTucs.Add(tinTuc);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<TinTuc>.Ok(tinTuc, "Đăng bài viết thành công"));
        }

        public class NewsDto
        {
            public string TieuDe { get; set; }
            public string NoiDung { get; set; }
            public string? HinhAnh { get; set; }
            public string LoaiTin { get; set; }
            public string ChuKyLap { get; set; }
        }
    }
}
