using HienMauNhanDao_DaNang.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NhanVienController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NhanVienController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy hồ sơ nhân viên theo maTaiKhoan hoặc Email
        [HttpGet("tai-khoan/{maTaiKhoanOrEmail}")]
        public async Task<IActionResult> GetByMaTaiKhoan(string maTaiKhoanOrEmail)
        {
            var nv = await _context.NhanViens
                .Include(n => n.TaiKhoan)
                .FirstOrDefaultAsync(n => n.MaTaiKhoan == maTaiKhoanOrEmail || (n.TaiKhoan != null && n.TaiKhoan.Email == maTaiKhoanOrEmail));
            
            if (nv == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy nhân viên y tế!" });
            }

            return Ok(new { success = true, data = nv });
        }
    }
}
