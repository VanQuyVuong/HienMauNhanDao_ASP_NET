using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]//Ổ khoá : bắt buộc phải có thẻ token 
    public class TinhNguyenVienController : ControllerBase
    {

        private readonly AppDbContext _context;

        public TinhNguyenVienController(AppDbContext context)
        {
            _context = context;
        }

        //1.API GET , Xem hồ sơ của bản thân
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            if (string.IsNullOrEmpty(maTaiKhoan))
            {
                var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value ?? User.Identity?.Name;
                if (!string.IsNullOrEmpty(email))
                {
                    var tk = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.Email == email);
                    if (tk != null) maTaiKhoan = tk.MaTaiKhoan;
                }
            }

            var tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

            if (tnv == null)
            {
                //trả về dữ liệu rỗng cho React biết là người này chưa điền hồ sơ bao giờ 
                return Ok(new { success = true, data = (TinhNguyenVien)null });

            }
            return Ok(new { success = true, data = tnv });

        }

        //Class nhận dữ liệu từ form react
        public class UpdateProfileRequest
        {

            public string HoTen { get; set; }
            public string Cccd { get; set; }
            public string NgaySinh { get; set; }

            public string SoDienThoai { set; get; }
            public string DiaChi { set; get; }
            public string GioiTinh { set; get; }
            public string NhomMau { set; get; }
            public string? MaPhuongXa { set; get; }
        }
        //2.Api put :cập nhật thông tin hồ sơ
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {

            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            if (string.IsNullOrEmpty(maTaiKhoan))
            {
                var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value ?? User.Identity?.Name;
                if (!string.IsNullOrEmpty(email))
                {
                    var tk = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.Email == email);
                    if (tk != null) maTaiKhoan = tk.MaTaiKhoan;
                }
            }

            var tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

            if (tnv == null)
            {
                tnv = new TinhNguyenVien
                {
                    maTNV = "TN" + DateTime.Now.ToString("HHmmss"),
                    MaTaiKhoan = maTaiKhoan
                };
                _context.TinhNguyenViens.Add(tnv);
            }


            //Ghi đè thong tin mới
            tnv.HoTen = request.HoTen;
            tnv.Cccd = request.Cccd;
            tnv.SoDienThoai = request.SoDienThoai;
            tnv.DiaChi = request.DiaChi;
            tnv.MaPhuongXa = request.MaPhuongXa;

            //Xử lý chuyển đổi chuỗi sang DateOnly 
            if (!string.IsNullOrEmpty(request.NgaySinh))
            {
                if (DateOnly.TryParse(request.NgaySinh, out var parsedDate))
                {
                    tnv.NgaySinh = parsedDate;
                }
                else if (DateTime.TryParse(request.NgaySinh, out var parsedDt))
                {
                    tnv.NgaySinh = DateOnly.FromDateTime(parsedDt);
                }
            }

            //xử lý ép kiểu chuỗi chữ sang Enum chuẩn 
            if (Enum.TryParse<GioiTinh>(request.GioiTinh, out var parsedGioiTinh))
            {
                tnv.GioiTinh = parsedGioiTinh;
            }

            //ép kiểu chuỗi sang enum nhóm máu
            if (Enum.TryParse<NhomMau>(request.NhomMau, out var parsedNhomMau))
            {
                tnv.NhomMau = parsedNhomMau;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã lưu hồ sơ thành công!", data = tnv });

        }







        //API GET Lấy danh sách toàn bộ tình nguyện viên (NVYT, AD)
        [HttpGet]
        [Authorize(Roles = "AD,NVYT")]//Chỉ có NVYT và AD mới được xem danh sách tình nguyện viên
        public async Task<IActionResult> GetAllTinhNguyenVien()
        {
            try
            {
                var list = await _context.TinhNguyenViens.ToListAsync();
                return Ok(new { success = true, data = list });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpGet("cccd/{soCCCD}")]
        [Authorize(Roles = "AD,NVYT")]
        public async Task<IActionResult> GetByCCCD(string soCCCD)
        {
            var tnv = await _context.TinhNguyenViens
                .FirstOrDefaultAsync(t => t.Cccd == soCCCD);
                
            if (tnv == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy tình nguyện viên" });
            }

            // Tính toán lần hiến gần nhất (trạng thái Đã Hoàn Thành)
            var lanHienGanNhat = await _context.DonDangKys
                .Where(d => d.MaTNV == tnv.maTNV && d.TrangThai == TrangThaiDonDangKy.DaHoanThanh)
                .OrderByDescending(d => d.ThoiGianDangKy)
                .FirstOrDefaultAsync();

            bool duDieuKien = true;
            string thongBao = "";

            if (lanHienGanNhat != null && lanHienGanNhat.ThoiGianDangKy.HasValue)
            {
                var khoangCach = (DateTime.Now - lanHienGanNhat.ThoiGianDangKy.Value).TotalDays;
                if (khoangCach < 84)
                {
                    duDieuKien = false;
                    thongBao = $"Lần hiến gần nhất cách đây {Math.Floor(khoangCach)} ngày (chưa đủ 84 ngày).";
                }
            }

            return Ok(new { success = true, data = tnv, duDieuKien, thongBao });
        }

        public class CreateTnvRequest
        {
            public string HoVaTen { get; set; }
            public string NgaySinh { get; set; }
            public string GioiTinh { get; set; }
            public string SoDienThoai { get; set; }
            public string DiaChi { get; set; }
            public string SoCCCD { get; set; }
            public string MaPhuongXa { get; set; }
        }

        [HttpPost]
        [Authorize(Roles = "AD,NVYT")]
        public async Task<IActionResult> CreateTnv([FromBody] CreateTnvRequest request)
        {
            var exists = await _context.TinhNguyenViens.AnyAsync(t => t.Cccd == request.SoCCCD);
            if (exists)
            {
                return BadRequest(new { success = false, message = "CCCD này đã tồn tại trong hệ thống." });
            }

            var tnv = new TinhNguyenVien
            {
                maTNV = "TNV" + DateTime.Now.ToString("HHmmss"),
                MaTaiKhoan = null, // Không có tài khoản
                HoTen = request.HoVaTen,
                Cccd = request.SoCCCD,
                SoDienThoai = request.SoDienThoai,
                DiaChi = request.DiaChi,
                MaPhuongXa = request.MaPhuongXa
            };

            if (DateOnly.TryParse(request.NgaySinh, out var parsedDate))
            {
                tnv.NgaySinh = parsedDate;
            }

            if (Enum.TryParse<GioiTinh>(request.GioiTinh, out var parsedGioiTinh))
            {
                tnv.GioiTinh = parsedGioiTinh;
            }

            _context.TinhNguyenViens.Add(tnv);
            await _context.SaveChangesAsync();

            return Ok(tnv);
        }
    }
}


    

