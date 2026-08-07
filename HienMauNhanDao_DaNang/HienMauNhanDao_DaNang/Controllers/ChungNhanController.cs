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
    [Authorize]
    public class ChungNhanController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChungNhanController(AppDbContext context)
        {
            _context = context;
        }

        //API lấy danh sách những người đã hiến máu thành công để thưucj hiện cấp giâsy chứng nhận 
        [HttpGet("candidates")]
        [Authorize(Roles ="NVYT, AD")]

        public async Task<IActionResult> GetCandidates()
        {
            // 1. Lấy danh sách các mã đơn đã khởi tạo túi máu
            var maDonsDaCoTuiMau = await _context.TuiMaus
                .Where(t => t.MaDon != null)
                .Select(t => t.MaDon!)
                .Distinct()
                .ToListAsync();

            // 2. Lấy tất cả các đơn hiến máu đã có túi máu HOẶC đã hoàn thành / đã hiến
            var dons = await _context.DonDangKys
                 .Include(d => d.TinhNguyenVien)
                 .Include(d => d.ChienDich)
                     .ThenInclude(c => c.DiaDiem)
                 .Where(d => d.TrangThai == TrangThaiDonDangKy.DaHoanThanh 
                          || d.TrangThai == TrangThaiDonDangKy.DaHien 
                          || maDonsDaCoTuiMau.Contains(d.MaDon))
                 .OrderByDescending(d => d.ThoiGianDangKy)
                 .ToListAsync();

            // 3. Lấy danh sách các mã đơn đã được cấp chứng nhận để đo khớp nhanh 
            var chungNhans = await _context.ChungNhans
                .ToDictionaryAsync(cn => cn.MaDon, cn => cn.MaChungNhan);

            // 4. Chuyển đổi sang định dạng json để gửi react dễ hiển thị 
            var result = dons.Select(don =>
            {
                string? maChungNhan = null;
                bool isIssued = false;
                if (don.MaDon != null)
                {
                    isIssued = chungNhans.TryGetValue(don.MaDon, out maChungNhan);
                }
                return new
                {
                    maDon = don.MaDon,
                    hoVaTen = don.TinhNguyenVien?.HoTen ?? "N/A",
                    soCCCD = don.TinhNguyenVien?.Cccd ?? "N/A",
                    ngaySinh = don.TinhNguyenVien?.NgaySinh?.ToString("dd/MM/yyyy") ?? "N/A",
                    nhomMau = don.TinhNguyenVien?.NhomMau?.ToString().Replace("_positive", "+").Replace("_negative", "-") ?? "Chưa xác định",
                    theTich = (don.TheTich ?? 250) + "ml",
                    tenChienDich = don.ChienDich?.TenChienDich ?? "N/A",
                    ngayHien = don.ThoiGianDangKy?.ToString("dd/MM/yyyy") ?? "N/A",
                    trangThaiCap = isIssued ? "issued" : "pending", // "issued" là đã cấp, "pending" là đang chờ
                    maChungNhan = maChungNhan
                };
            });
            return Ok(result);
        }



    }
}
