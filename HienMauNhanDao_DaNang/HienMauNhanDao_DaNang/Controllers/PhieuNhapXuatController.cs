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
    [Authorize(Roles = "QLK,AD")]
    public class PhieuNhapXuatController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PhieuNhapXuatController(AppDbContext context)
        {
            _context = context;
        }
        // API Duyệt nhập kho cho danh sách các túi máu đạt chuẩn
        [HttpPost("import")]
        public async Task<IActionResult> ImportTuiMau([FromBody] ImportRequest request)
        {
            if (request.MaTuiMauList == null || !request.MaTuiMauList.Any())
            {
                return BadRequest(new { success = false, message = "Danh sách túi máu nhập kho trống." });
            }
            // 1. Tự sinh mã Phiếu nhập tăng dần (PN00001, PN00002...)
            var maxPhieu = await _context.PhieuNhapXuats.OrderByDescending(p => p.MaPhieu).FirstOrDefaultAsync();
            int nextPhieuId = 1;
            if (maxPhieu != null && maxPhieu.MaPhieu.StartsWith("PN"))
            {
                int.TryParse(maxPhieu.MaPhieu.Substring(2), out int currentPhieuId);
                nextPhieuId = currentPhieuId + 1;
            }
            string newMaPhieu = "PN" + nextPhieuId.ToString("D5");
            // 2. Tạo đối tượng Phiếu Nhập
            var phieu = new PhieuNhapXuat
            {
                MaPhieu = newMaPhieu,
                MaNhanVien = request.MaNhanVien,
                LoaiPhieu = LoaiPhieuNhapXuat.Nhap,
                NgayNhapXuat = DateOnly.FromDateTime(DateTime.Today)
            };
            _context.PhieuNhapXuats.Add(phieu);
            // 3. Xử lý nhập kho và cộng tồn kho cho từng túi máu
            foreach (var maTuiMau in request.MaTuiMauList)
            {
                var tuiMau = await _context.TuiMaus
                    .Include(t => t.DonDangKy)
                        .ThenInclude(d => d.TinhNguyenVien)
                    .FirstOrDefaultAsync(t => t.MaTuiMau == maTuiMau);
                if (tuiMau == null) continue;
                // Đổi trạng thái túi máu sang Đã lưu kho
                tuiMau.TrangThai = TrangThaiTuiMau.DaLuuKho;
                // Nếu túi máu chưa có kho ➔ Tự động gán kho theo nhóm máu
                if (string.IsNullOrEmpty(tuiMau.MaKho))
                {
                    var nhomMauTui = tuiMau.DonDangKy?.TinhNguyenVien?.NhomMau;
                    if (nhomMauTui != null)
                    {
                        var khoKhopNhom = await _context.KhoMaus.FirstOrDefaultAsync(k => k.NhomMau == nhomMauTui);
                        if (khoKhopNhom != null)
                        {
                            tuiMau.MaKho = khoKhopNhom.MaKho;
                        }
                    }
                }
                // Cộng số lượng tồn kho máu của ngăn đó lên +1
                if (!string.IsNullOrEmpty(tuiMau.MaKho))
                {
                    var kho = await _context.KhoMaus.FirstOrDefaultAsync(k => k.MaKho == tuiMau.MaKho);
                    if (kho != null)
                    {
                        kho.SoLuongTon = (kho.SoLuongTon ?? 0) + 1;
                    }
                }
                // Lưu liên kết chi tiết phiếu nhập
                var chiTiet = new ChiTietNhapXuat
                {
                    MaPhieu = newMaPhieu,
                    MaTuiMau = maTuiMau
                };
                _context.ChiTietNhapXuats.Add(chiTiet);
            }
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã nhập kho thành công và tăng tồn kho." });
        }
    }
    // Lớp DTO nhận yêu cầu từ Frontend
    public class ImportRequest  
    {
        public string MaNhanVien { get; set; } = string.Empty;
        public List<string> MaTuiMauList { get; set; } = new List<string>();
    }
}
