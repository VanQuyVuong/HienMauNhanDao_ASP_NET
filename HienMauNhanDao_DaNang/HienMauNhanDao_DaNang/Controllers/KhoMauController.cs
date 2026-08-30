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
                nguongAnToan = kho.NguongAnToan ?? 10,

                // nếu số lượng ít hơn ngưỡng an toàn , gắn cờ "cạn kiệt"
                tinhTrang = (kho.SoLuongTon ?? 0) < (kho.NguongAnToan ?? 10) ? "CanKiet" : "AnToan"
            });

            return Ok(new { success = true, data = ketQua });
        }

        [HttpGet("charts/pie")]
        public async Task<IActionResult> GetPieChart()
        {
            var danhSach = await _context.KhoMaus.ToListAsync();

            int totalA = danhSach.Where(k => k.NhomMau != null && k.NhomMau.ToString().StartsWith("A_")).Sum(k => k.SoLuongTon ?? 0);
            int totalB = danhSach.Where(k => k.NhomMau != null && k.NhomMau.ToString().StartsWith("B_")).Sum(k => k.SoLuongTon ?? 0);
            int totalO = danhSach.Where(k => k.NhomMau != null && k.NhomMau.ToString().StartsWith("O_")).Sum(k => k.SoLuongTon ?? 0);
            int totalAB = danhSach.Where(k => k.NhomMau != null && k.NhomMau.ToString().StartsWith("AB_")).Sum(k => k.SoLuongTon ?? 0);

            int grandTotal = totalA + totalB + totalO + totalAB;
            if (grandTotal == 0) grandTotal = 1;

            var result = new List<object>
            {
                new { nhomMau = "Nhóm A", bloodType = "Nhóm A", value = totalA, quantity = totalA, percent = Math.Round((double)totalA * 100 / grandTotal, 1), color = "#991b1b" },
                new { nhomMau = "Nhóm B", bloodType = "Nhóm B", value = totalB, quantity = totalB, percent = Math.Round((double)totalB * 100 / grandTotal, 1), color = "#fca5a5" },
                new { nhomMau = "Nhóm O", bloodType = "Nhóm O", value = totalO, quantity = totalO, percent = Math.Round((double)totalO * 100 / grandTotal, 1), color = "#dc2626" },
                new { nhomMau = "Nhóm AB", bloodType = "Nhóm AB", value = totalAB, quantity = totalAB, percent = Math.Round((double)totalAB * 100 / grandTotal, 1), color = "#7f1d1d" }
            };

            return Ok(new { success = true, data = result });
        }
    }
}
