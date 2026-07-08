using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class TaiKhoanController : ControllerBase
    {

        private readonly AppDbContext _context;

        public TaiKhoanController (AppDbContext context)
        {
            _context = context;
        }


        // 1. api get lấy danh sách toàn bộ tài khoản 
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var list = await _context.TaiKhoans
                    .Include(t => t.VaiTro)
                    .ToListAsync();


                var result = list.Select(t => new
                {
                    maTaiKhoan = t.MaTaiKhoan,
                    email = t.Email,
                    maiVaiTro = t.MaVaiTro,
                    tenVaiTro = t.VaiTro?.tenVaiTro ?? t.MaVaiTro,
                    trangThai = t.TrangThai
                }).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { success = false, message = "Lỗi hệ thống !!! :" + ex.Message });

            }
        }

        
    }
}
