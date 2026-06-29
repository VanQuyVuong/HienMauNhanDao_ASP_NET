using HienMauNhanDao_DaNang.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "NVYT,AD")]
    public class ThongKeController : ControllerBase
    {

        private readonly AppDbContext _context;

        public ThongKeController(AppDbContext context)
        {
            _context = context;
        }

        //Api đếm số liệu thống kê
        [HttpGet("tong_quan")]
        public async Task<IActionResult> GetThongKeTongQuan()
        {
            // đếm tổng số lượng người dùng(tnv ) trong hệ thống 
            var tongNguoiDung = await _context.TinhNguyenViens.CountAsync();

            //Trả về dữ liệu đã đóng gói 
            return Ok(new { success = true, data = new { TongNguoiDung = tongNguoiDung } });

        }
    }

    }

