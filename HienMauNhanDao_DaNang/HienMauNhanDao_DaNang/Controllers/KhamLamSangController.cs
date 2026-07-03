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
    [Authorize(Roles = "BS,AD")]
    public class KhamLamSangController : ControllerBase
    {

        private readonly AppDbContext _context;

        public KhamLamSangController(AppDbContext context)
        {
            _context = context;
        }


        //API 1 Lấy ra danh sách các đơn đang chờ khám sàn lọc 
        [HttpGet("cho-kham")]
        public async Task<IActionResult> GetDanhSachChoKham()
        {
            //loc ra nhung don Da duyet, khai bao y te (HoSoYTe != null ), va chua tung duoc kham lam san 
            var choKham = await _context.DonDangKys
                .Include(d => d.TinhNguyenVien)
                .Where(d => d.TrangThai == TrangThaiDonDangKy.DaDuyet)
                .Where(d => _context.HoSoSucKhoes.Any(h => h.MaDon == d.MaDon))
                .Where(d => !_context.KetQuaLamSangs.Any(k => k.MaDon == d.MaDon))
                .Select(d => new
                {
                    maDon = d.MaDon,
                    tenTinhNguyenVien = d.TinhNguyenVien != null ? d.TinhNguyenVien.HoTen : "An danh".
                    ngaySinh = d.TinhNguyenVien != null && d.TinhNguyenVien.ngaySinh != null ? d.TinhNguyenVien.ngaySinh.Value.ToString("dd/MM/yyyy") : "---",
                    gioiTinh = d.TinhNguyenVien != null ? d.TinhNguyenVien.GioiTinh.ToString().Replace("Nu", "Nữ").Replace("Nam", "Nam") : "---",
                    nhomMau = d.TinhNguyenVien != null && d.TinhNguyenVien.NhomMau != null ?
                    d.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ"
                })
                .ToListAsync();
            return Ok(choKham);
        }

    }
}