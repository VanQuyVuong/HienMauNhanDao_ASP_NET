using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HoSoSucKhoeController : ControllerBase
    {

        private readonly AppDbContext _context;

        public HoSoSucKhoeController(AppDbContext context)
        {
            _context = context;
        }

        public class HoSoRequest
        {
            public string MaDon { get; set; } = string.Empty;
            public bool KhangSinh { get; set; }
            public bool TruyenNhiem { get; set; }
            public bool DauHong { get; set; }
            public bool CoThai { get; set; }
            public string? MoTaKhac { get; set; }
        }


        //Api 1 tạo hồ sơ khai báo sức khoẻ mới 
        public async Task<IActionResult> CreateHoSo([FromBody] HoSoRequest request)
        {
            //kiểm tra đơn hiến máu có tồn tại không
            var don = await _context.DonDangKys.FindAsync(request.MaDon);
            if(don == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đơn đăng ký hiến máu" });
            }

            //kiểm tra xem đưuojc này đã được khai báo y tế chưa 
            var daCo = await _context.HoSoSucKhoes.AnyAsync(h => h.MaDon == request.MaDon);
            if (daCo)
            {
                return BadRequest(new { success = false, message = "Đơn đăng ký này đã được khai báo y tế trước đo rồi !" });
            }

            //Tạo mã hồ sơ tăng dạng HS00001, HS00002,...
            var count = await _context.HoSoSucKhoes.CountAsync();
            var maHoSo = $"HS{(count+1):DS}";

            var hoSo = new HoSoSucKhoe
            {
                MaHoSo = maHoSo,
                MaDon = request.MaDon,
                KhangSinh = request.KhangSinh,
                TruyenNhiem = request.TruyenNhiem,
                DauHong = request.DauHong,
                CoThai = request.CoThai,
                MoTaKhac = request.MoTaKhac
            };

            _context.HoSoSucKhoes.Add(hoSo);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Lưu hồ sơ khai báo y tế thành công !", data = hoSo });
        }

        //API 2 . LẤY THÔNG TIN HÒ SƠ SỨC KHOẺ Y TẾ CỦA MỘT ĐƠN ĐĂNG KÝ HIẾN MÁU CỤ THỂ 
        [HttpGet("don/{maDon}")]
        public async Task<IActionResult>  GetHoSoByMaDon(string maDon)
        {
            var hoSo = await _context.HoSoSucKhoes.FirstOrDefaultAsync(h => h.MaDon == maDon);


        if(hoSo == null)
            {
                return NotFound(new { success = false, message = "Đơn đăng ký này chưa được khai báo y tế" });
            }
            return Ok(new { succcess = true, data = hoSo });
        }


        //API 3 .Lấy toàn bộ danh sách hồ sơ sức khoẻ chỉ dành cho NVYT và AD
        [HttpGet("tat-ca")]
        [Authorize(Roles ="NVYT,AD")]
        public async Task<IActionResult> GetTatCaHoSo()
        {
            var danhSach =await _context.HoSoSucKhoes
                .Include(h => h.DonDangKy)
                .ThenInclude(d => d.TinhNguyenVien)
                .OrderByDescending(h => h.MaHoSo)
                .ToListAsync();

            return Ok(new { success = true, data = danhSach });
        }

    }
}
