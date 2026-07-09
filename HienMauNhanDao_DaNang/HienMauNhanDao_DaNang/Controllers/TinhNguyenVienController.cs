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
        }
        //2.Api put :cập nhật thông tin hồ sơ
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {

            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            var tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

            if (tnv == null)
            {
                tnv = new TinhNguyenVien
                {
                    maTNV = "TNV" + DateTime.Now.ToString("HHmmss"),
                    MaTaiKhoan = maTaiKhoan
                };
                _context.TinhNguyenViens.Add(tnv);
            }


            //Ghi đè thong tin mới
            tnv.HoTen = request.HoTen;
            tnv.Cccd = request.Cccd;
            tnv.SoDienThoai = request.SoDienThoai;
            tnv.DiaChi = request.DiaChi;

            //Xử lý chuyển đổi chuỗi  sáng DateOnly 
            if (DateOnly.TryParse(request.NgaySinh, out var parsedDate))
            {
                tnv.NgaySinh = parsedDate;
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
            return Ok(new { success = true, message = "Đã lưu hồ sơ thành côg !" });

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
    }
}


    

