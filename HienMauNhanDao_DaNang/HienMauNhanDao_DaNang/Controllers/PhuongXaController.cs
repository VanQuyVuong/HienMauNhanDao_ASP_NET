using Microsoft.AspNetCore.Mvc;
using HienMauNhanDao_DaNang.Data;
using Microsoft.EntityFrameworkCore;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhuongXaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PhuongXaController(AppDbContext context)
        {
            _context = context;
        }

        // API lấy toàn bộ danh sách phường xã
        [HttpGet]
        public async Task<IActionResult> LayTatCa()
        {
            var danhSach = await _context.PhuongXas.ToListAsync();
            return Ok(new { success = true, data = danhSach });
        }
    }
}
