using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HienMauNhanDao_DaNang.Data;
using Microsoft.EntityFrameworkCore;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiaDiemController : ControllerBase
    {

        private readonly AppDbContext _context;

        public DiaDiemController(AppDbContext context)
        {
            _context = context;
        }

        //api lấy toàn bộ danh sách địa điểm tổ chức

        [HttpGet]
        public async Task<IActionResult> LayTatCa()
        {
            var danhSach = await _context.DiaDiems.ToListAsync();
            return Ok(new { success = true, data = danhSach });
        }

    }
}
