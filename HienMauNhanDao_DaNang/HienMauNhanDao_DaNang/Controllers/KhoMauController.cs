using HienMauNhanDao_DaNang.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "NVYT, QLK, AD")]
    public class KhoMauController : ControllerBase
    {
        private readonly AppDbContext _context;

        public KhoMauController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDanhSachKhoMau()
        {
            // Api quét toàn bộ kho máu để báo cáo 
            var danhSach = await _context.KhoMaus.ToListAsync();

            // Bá đầu dịch chữ và đánh giá cảnh báo dữ liệu
            var ketQua = danhSach.Select(kho => new
            {
                maKho = kho.MaKho,
                tenKho = kho.TenKho,

                // dịch từ csdl sang ngôn ngữ người dùng VD :A_positive => A+
                nhomMauString = kho.NhomMau != null ? kho.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-")
                : "Chưa có",
                soLuongTon = kho.SoLuongTon ?? 0,
                nguongAnToan = kho.NguongAnToan ?? 50,

                // nếu số lượng ít hơn ngưỡng an toàn , gắn cờ "cạn kiệt"
                tinhTrang = (kho.SoLuongTon ?? 0) <= (kho.NguongAnToan ?? 50) ? "CanKiet" : "AnToan"
            });

            return Ok(new { success = true, data = ketQua });
        }

        [HttpGet("charts/pie")]
        public async Task<IActionResult> GetPieChart()
        {
            var danhSach = await _context.KhoMaus.ToListAsync();
            var result = danhSach.Select(k => new
            {
                bloodType = k.NhomMau != null ? k.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ",
                quantity = k.SoLuongTon ?? 0
            });
            return Ok(result);
        }
    }
}
