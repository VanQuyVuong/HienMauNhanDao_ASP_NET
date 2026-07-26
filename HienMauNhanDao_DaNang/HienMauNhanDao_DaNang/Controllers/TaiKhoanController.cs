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
    [Authorize(Roles = "AD,Admin")]
    public class TaiKhoanController : ControllerBase
    {

        private readonly AppDbContext _context;

        public TaiKhoanController(AppDbContext context)
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
                    maVaiTro = t.MaVaiTro,
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

        //2. api get lấy danh sách các vai trò 
        [HttpGet("vaitro")]
        public async Task<IActionResult> GetRoles()
        {
            try
            {
                var roles = await _context.VaiTros.ToListAsync();
                var result = roles.Select(r => new
                {
                    maVaiTro = r.maVaiTro,
                    tenVaiTro = r.tenVaiTro
                }).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống !!! :" + ex.Message });
            }
        }


        public class CreateAccountRequest
        {
            public string Email { get; set; } = string.Empty;
            public string MatKhau { get; set; } = string.Empty;
            public string MaVaiTro { get; set; } = string.Empty;
        }


        //3 api post tạo tài khoản mới 
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAccountRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.MatKhau) || string.IsNullOrEmpty(request.MaVaiTro))
                {
                    return BadRequest(new { success = false, message = "Vui lòng nhập đầy đủ thông tin !" });
                }

                //kiểm tra email trùng hợp
                var exist = await _context.TaiKhoans.AnyAsync(t => t.Email == request.Email);
                if (exist)
                {
                    return BadRequest(new { success = false, message = " Email này đã được sử dụng." });
                }

                var vaiTro = await _context.VaiTros.FirstOrDefaultAsync(v => v.maVaiTro == request.MaVaiTro);
                if (vaiTro == null)
                {
                    return BadRequest(new { success = false, message = "Vai trò không hợp lệ." });
                }

                //Tự động sinh mã tài khoản 
                var allTKs = await _context.TaiKhoans.ToListAsync();
                int nextId = allTKs.Count + 1;
                while (allTKs.Any(t => t.MaTaiKhoan == $"TK{nextId:D5}"))
                {
                    nextId++;
                }

                var maTaiKhoan = $"TK{nextId:D5}";

                var taiKhoan = new TaiKhoan
                {
                    MaTaiKhoan = maTaiKhoan,
                    Email = request.Email.Trim(),
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhau), // Băm mật khẩu bằng BCrypt
                    MaVaiTro = request.MaVaiTro,
                    TrangThai = true
                };
                _context.TaiKhoans.Add(taiKhoan);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Tạo tài khoản thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }


        public class UpdateStatusRequest
        {
            public bool TrangThai { get; set; }
        }

        //4 API patch cập nhật trạng thái tài khoản 
        [HttpPatch("{maTaiKhoan}/trang-thai")]
        public async Task<IActionResult> UpdateStatus(string maTaiKhoan, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var taiKhoan = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);
                if (taiKhoan == null)
                {
                    return NotFound(new { success = false, message = "Không tìm tài khoản" });
                }

                taiKhoan.TrangThai = request.TrangThai;
                await _context.SaveChangesAsync();

                string msg = request.TrangThai ? "Kích hoạt tài khoản thành công!" : "Vô hiệu tài khoản thành công!";
                return Ok(new { success = true, message = msg });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống :" + ex.Message });

            }
        }

        //5. api delete xoá tài khoản
        [HttpDelete("{maTaiKhoan}")]
        public async Task<IActionResult> Delete(string maTaiKhoan)
        {
            try
            {
                var taiKhoan = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

                if (taiKhoan == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy tài khoản." });

                }

                _context.TaiKhoans.Remove(taiKhoan);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Xoá tài khảon thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });

            }
        }
    }
}
