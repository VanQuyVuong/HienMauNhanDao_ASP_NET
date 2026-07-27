using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HienMauNhanDao_DaNang.Data;
using Microsoft.EntityFrameworkCore;

using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Models.Enums;

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

        //api tạo mới địa điểm hiến máu lưu động / di động
        [HttpPost]
        public async Task<IActionResult> TaoMoi([FromBody] DiaDiem model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.MaDiaDiem))
                {
                    model.MaDiaDiem = "DD" + new Random().Next(10000, 99999).ToString();
                }
                if (string.IsNullOrEmpty(model.MaPhuongXa))
                {
                    var px = await _context.PhuongXas.FirstOrDefaultAsync();
                    model.MaPhuongXa = px?.maPhuongXa ?? "PX00001";
                }
                _context.DiaDiems.Add(model);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, data = model });
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new { success = false, message = "Lỗi khi tạo địa điểm: " + msg });
            }
        }

    }
}
