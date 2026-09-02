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

                var nhanViens = await _context.NhanViens.Include(n => n.KhoaCongTac).ToListAsync();
                var tnvs = await _context.TinhNguyenViens.ToListAsync();


                var result = list.Select(t =>
                {
                    var nv = nhanViens.FirstOrDefault(n => n.MaTaiKhoan == t.MaTaiKhoan);
                    var tnv = tnvs.FirstOrDefault(m => m.MaTaiKhoan == t.MaTaiKhoan);

                    string hoTen = nv?.HoTen ?? tnv?.HoTen ?? "Chưa cập nhật";
                    string sdt = nv?.SoDienThoai ?? tnv?.SoDienThoai ?? "N/A";
                    string cccd = nv?.Cccd ?? tnv?.Cccd ?? "N/A";
                    string khoa = nv?.KhoaCongTac?.TenKhoa ?? "Sở Y Tế TP. Đà Nẵng";

                    return new
                    {
                        maTaiKhoan = t.MaTaiKhoan,
                        email = t.Email,
                        maVaiTro = t.MaVaiTro,
                        tenVaiTro = t.VaiTro?.tenVaiTro ?? t.MaVaiTro,
                        trangThai = t.TrangThai,
                        hoTen = hoTen,
                        soDienThoai = sdt,
                        cccd = cccd,
                        tenKhoa = khoa
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // 2. api get lấy danh sách các vai trò
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
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // 2b. api get lấy danh sách các Khoa / Đơn vị công tác từ CSDL
        [HttpGet("khoa-cong-tac")]
        public async Task<IActionResult> GetKhoaCongTacs()
        {
            try
            {
                var list = await _context.KhoaCongTacs.ToListAsync();
                if (!list.Any())
                {
                    list = new List<KhoaCongTac>
                    {
                        new KhoaCongTac { MaKhoa = "KC00001", TenKhoa = "Bệnh viện C Đà Nẵng" },
                        new KhoaCongTac { MaKhoa = "KC00002", TenKhoa = "Bệnh viện Đà Nẵng" },
                        new KhoaCongTac { MaKhoa = "KC00003", TenKhoa = "Bệnh viện Phụ Sản - Nhi Đà Nẵng" },
                        new KhoaCongTac { MaKhoa = "KC00004", TenKhoa = "Bệnh viện Quân y 17" },
                        new KhoaCongTac { MaKhoa = "KC00005", TenKhoa = "Bệnh viện 199 - Bộ Công An" },
                        new KhoaCongTac { MaKhoa = "KC00006", TenKhoa = "Bệnh viện Đa khoa Nam Liên Chiểu" },
                        new KhoaCongTac { MaKhoa = "KC00007", TenKhoa = "Trung tâm Y tế Quận Hải Châu" },
                        new KhoaCongTac { MaKhoa = "KC00008", TenKhoa = "Trung tâm Y tế Quận Thanh Khê" },
                        new KhoaCongTac { MaKhoa = "KC00009", TenKhoa = "Trung tâm Y tế Quận Sơn Trà" },
                        new KhoaCongTac { MaKhoa = "KC00010", TenKhoa = "Trung tâm Y tế Quận Ngũ Hành Sơn" },
                        new KhoaCongTac { MaKhoa = "KC00011", TenKhoa = "Trung tâm Y tế Quận Liên Chiểu" },
                        new KhoaCongTac { MaKhoa = "KC00012", TenKhoa = "Trung tâm Y tế Quận Cẩm Lệ" },
                        new KhoaCongTac { MaKhoa = "KC00013", TenKhoa = "Trung tâm Y tế Huyện Hòa Vang" }
                    };
                }
                var result = list.Select(k => new { maKhoa = k.MaKhoa, tenKhoa = k.TenKhoa }).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }


        public class CreateAccountRequest
        {
            public string Email { get; set; } = string.Empty;
            public string MatKhau { get; set; } = string.Empty;
            public string MaVaiTro { get; set; } = string.Empty;
            public string? HoTen { get; set; }
            public string? SoDienThoai { get; set; }
            public string? Cccd { get; set; }
            public string? MaKhoa { get; set; }
            public string? TenKhoa { get; set; }
        }

        // 3. api post tạo tài khoản mới kèm hồ sơ cán bộ
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAccountRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.MatKhau) || string.IsNullOrEmpty(request.MaVaiTro))
                {
                    return BadRequest(new { success = false, message = "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
                }

                var exist = await _context.TaiKhoans.AnyAsync(t => t.Email == request.Email);
                if (exist)
                {
                    return BadRequest(new { success = false, message = "Email này đã được sử dụng." });
                }

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
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhau),
                    MaVaiTro = request.MaVaiTro,
                    TrangThai = true
                };
                _context.TaiKhoans.Add(taiKhoan);

                // Tạo hồ sơ NhanVien kèm theo nếu không phải TNV
                if (request.MaVaiTro != "TNV")
                {
                    var allNVs = await _context.NhanViens.ToListAsync();
                    int nvId = allNVs.Count + 1;
                    while (allNVs.Any(n => n.MaNhanVien == $"NV{nvId:D5}"))
                    {
                        nvId++;
                    }

                    string selectedMaKhoa = string.IsNullOrEmpty(request.MaKhoa) ? "KC00001" : request.MaKhoa;

                    var nhanVien = new NhanVien
                    {
                        MaNhanVien = $"NV{nvId:D5}",
                        MaTaiKhoan = maTaiKhoan,
                        MaKhoa = selectedMaKhoa,
                        HoTen = string.IsNullOrEmpty(request.HoTen) ? "Cán bộ Y tế" : request.HoTen.Trim(),
                        SoDienThoai = string.IsNullOrEmpty(request.SoDienThoai) ? "0900000000" : request.SoDienThoai.Trim(),
                        Cccd = string.IsNullOrEmpty(request.Cccd) ? "048000000000" : request.Cccd.Trim()
                    };
                    _context.NhanViens.Add(nhanVien);
                }

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Tạo tài khoản cán bộ thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        public class UpdateAccountRequest
        {
            public string? HoTen { get; set; }
            public string? SoDienThoai { get; set; }
            public string? Cccd { get; set; }
            public string? MaKhoa { get; set; }
            public string? MaVaiTro { get; set; }
            public bool? TrangThai { get; set; }
        }

        // 4. API PUT Cập nhật thông tin cán bộ (Khi chuyển công tác / đổi thông tin)
        [HttpPut("{maTaiKhoan}")]
        public async Task<IActionResult> UpdateAccount(string maTaiKhoan, [FromBody] UpdateAccountRequest request)
        {
            try
            {
                var taiKhoan = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);
                if (taiKhoan == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy tài khoản." });
                }

                if (!string.IsNullOrEmpty(request.MaVaiTro))
                {
                    taiKhoan.MaVaiTro = request.MaVaiTro;
                }
                if (request.TrangThai.HasValue)
                {
                    taiKhoan.TrangThai = request.TrangThai.Value;
                }

                var nhanVien = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaTaiKhoan == maTaiKhoan);
                if (nhanVien != null)
                {
                    if (!string.IsNullOrEmpty(request.HoTen)) nhanVien.HoTen = request.HoTen.Trim();
                    if (!string.IsNullOrEmpty(request.SoDienThoai)) nhanVien.SoDienThoai = request.SoDienThoai.Trim();
                    if (!string.IsNullOrEmpty(request.Cccd)) nhanVien.Cccd = request.Cccd.Trim();
                    if (!string.IsNullOrEmpty(request.MaKhoa)) nhanVien.MaKhoa = request.MaKhoa.Trim();
                }
                else if (taiKhoan.MaVaiTro != "TNV")
                {
                    var allNVs = await _context.NhanViens.ToListAsync();
                    int nvId = allNVs.Count + 1;
                    var nvNew = new NhanVien
                    {
                        MaNhanVien = $"NV{nvId:D5}",
                        MaTaiKhoan = maTaiKhoan,
                        MaKhoa = string.IsNullOrEmpty(request.MaKhoa) ? "KC00001" : request.MaKhoa,
                        HoTen = request.HoTen ?? "Cán bộ Y tế",
                        SoDienThoai = request.SoDienThoai ?? "0900000000",
                        Cccd = request.Cccd ?? "048000000000"
                    };
                    _context.NhanViens.Add(nvNew);
                }

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Cập nhật thông tin tài khoản thành công!" });
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

        // 5. API patch cập nhật trạng thái tài khoản
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
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // 6. API delete xoá tài khoản
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

                return Ok(new { success = true, message = "Xóa tài khoản thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}

