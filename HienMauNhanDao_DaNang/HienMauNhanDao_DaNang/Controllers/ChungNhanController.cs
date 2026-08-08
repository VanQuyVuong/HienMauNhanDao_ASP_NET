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

        // 1. API lấy danh sách những người đủ điều kiện để cấp giấy chứng nhận
        [HttpGet("candidates")]
        [Authorize(Roles = "NVYT, AD, QLK")]
        public async Task<IActionResult> GetCandidates()
        {
            // Lấy tất cả mã đơn đã có trong bảng TÚI MÁU
            var maDonsDaCoTuiMau = await _context.TuiMaus
                .Where(t => t.MaDon != null)
                .Select(t => t.MaDon!)
                .Distinct()
                .ToListAsync();

            // Lấy tất cả các đơn đăng ký đã có túi máu HOẶC có trạng thái DaHoanThanh, DaHien, DaDuyet
            var dons = await _context.DonDangKys
                 .Include(d => d.TinhNguyenVien)
                 .Include(d => d.ChienDich)
                     .ThenInclude(c => c.DiaDiem)
                 .Where(d => d.TrangThai == TrangThaiDonDangKy.DaHoanThanh 
                          || d.TrangThai == TrangThaiDonDangKy.DaHien 
                          || d.TrangThai == TrangThaiDonDangKy.DaDuyet
                          || maDonsDaCoTuiMau.Contains(d.MaDon))
                 .OrderByDescending(d => d.ThoiGianDangKy)
                 .ToListAsync();

            // Lấy danh sách chứng nhận đã cấp
            var chungNhans = await _context.ChungNhans
                .Where(cn => cn.MaDon != null)
                .ToDictionaryAsync(cn => cn.MaDon!, cn => cn.MaChungNhan);

            var result = dons.Select(don =>
            {
                string? maChungNhan = null;
                bool isIssued = don.MaDon != null && chungNhans.TryGetValue(don.MaDon, out maChungNhan);

                string loaiHienMau = "ChienDich";
                if (don.ChienDich != null)
                {
                    var tenCD = don.ChienDich.TenChienDich?.ToLower() ?? "";
                    var hinhThuc = don.ChienDich.DiaDiem?.HinhThuc?.ToLower() ?? "";
                    var loaiDD = don.ChienDich.DiaDiem?.LoaiDiaDiem?.ToString().ToLower() ?? "";

                    if (tenCD.Contains("thường xuyên") || tenCD.Contains("định kỳ"))
                    {
                        loaiHienMau = "ThuongXuyen";
                    }
                    else if (hinhThuc == "codinh" || loaiDD == "benhvien")
                    {
                        loaiHienMau = "CoDinh";
                    }
                    else
                    {
                        loaiHienMau = "ChienDich";
                    }
                }

                return new
                {
                    maDon = don.MaDon,
                    hoVaTen = don.TinhNguyenVien?.HoTen ?? "Tình nguyện viên",
                    soCCCD = don.TinhNguyenVien?.Cccd ?? "N/A",
                    ngaySinh = don.TinhNguyenVien?.NgaySinh?.ToString("dd/MM/yyyy") ?? "N/A",
                    nhomMau = don.TinhNguyenVien?.NhomMau?.ToString().Replace("_positive", "+").Replace("_negative", "-") ?? "Chưa xác định",
                    theTich = (don.TheTich ?? 250) + " ml",
                    tenChienDich = don.ChienDich?.TenChienDich ?? "Hiến máu nhân đạo",
                    loaiHienMau = loaiHienMau,
                    ngayHien = don.ThoiGianDangKy?.ToString("dd/MM/yyyy") ?? "N/A",
                    trangThaiCap = isIssued ? "issued" : "pending",
                    maChungNhan = maChungNhan
                };
            });

            return Ok(new { success = true, data = result });
        }

        // 2. API cấp giấy chứng nhận cho 1 đơn cụ thể
        [HttpPost("issue/{maDon}")]
        [Authorize(Roles = "NVYT, AD")]
        public async Task<IActionResult> IssueCertificate(string maDon)
        {
            var don = await _context.DonDangKys
                .Include(d => d.TinhNguyenVien)
                .FirstOrDefaultAsync(d => d.MaDon == maDon);

            if (don == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đơn đăng ký" });
            }

            var existing = await _context.ChungNhans.FirstOrDefaultAsync(cn => cn.MaDon == maDon);
            if (existing != null)
            {
                return Ok(new { success = true, message = "Giấy chứng nhận đã được cấp trước đó", data = existing });
            }

            // Sinh mã chứng nhận mới dạng CN00001 -> CN99999
            var count = await _context.ChungNhans.CountAsync();
            string newMaCN = $"CN{(count + 1):D5}";

            var chungNhan = new ChungNhan
            {
                MaChungNhan = newMaCN,
                MaDon = maDon,
                NgayCap = DateOnly.FromDateTime(DateTime.Now),
                FilePDF = $"/pdf/{newMaCN}.pdf"
            };

            _context.ChungNhans.Add(chungNhan);

            // Cập nhật trạng thái đơn thành DaHoanThanh
            don.TrangThai = TrangThaiDonDangKy.DaHoanThanh;

            await _context.SaveChangesAsync();

            return Ok(new { 
                success = true, 
                message = "Phát hành giấy chứng nhận điện tử thành công!",
                data = new {
                    maChungNhan = newMaCN,
                    maDon = don.MaDon,
                    hoVaTen = don.TinhNguyenVien?.HoTen,
                    ngayCap = chungNhan.NgayCap?.ToString("dd/MM/yyyy"),
                    trangThaiCap = "issued"
                }
            });
        }

        // 3. API cấp tất cả giấy chứng nhận đang chờ
        [HttpPost("issue-all")]
        [Authorize(Roles = "NVYT, AD")]
        public async Task<IActionResult> IssueAllCertificates()
        {
            var maDonsDaCoTuiMau = await _context.TuiMaus
                .Where(t => t.MaDon != null)
                .Select(t => t.MaDon!)
                .Distinct()
                .ToListAsync();

            var pendingDons = await _context.DonDangKys
                .Where(d => d.TrangThai == TrangThaiDonDangKy.DaHoanThanh 
                         || d.TrangThai == TrangThaiDonDangKy.DaHien 
                         || d.TrangThai == TrangThaiDonDangKy.DaDuyet
                         || maDonsDaCoTuiMau.Contains(d.MaDon))
                .ToListAsync();

            var existingMaDons = await _context.ChungNhans
                .Where(cn => cn.MaDon != null)
                .Select(cn => cn.MaDon!)
                .ToListAsync();

            var toIssueDons = pendingDons.Where(d => !existingMaDons.Contains(d.MaDon)).ToList();

            if (!toIssueDons.Any())
            {
                return Ok(new { success = true, data = 0, message = "Không có đơn nào đang chờ cấp chứng nhận" });
            }

            int count = await _context.ChungNhans.CountAsync();
            foreach (var don in toIssueDons)
            {
                count++;
                string newMaCN = $"CN{count:D5}";
                _context.ChungNhans.Add(new ChungNhan
                {
                    MaChungNhan = newMaCN,
                    MaDon = don.MaDon,
                    NgayCap = DateOnly.FromDateTime(DateTime.Now),
                    FilePDF = $"/pdf/{newMaCN}.pdf"
                });
                don.TrangThai = TrangThaiDonDangKy.DaHoanThanh;
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = toIssueDons.Count, message = $"Đã phát hành thành công {toIssueDons.Count} giấy chứng nhận!" });
        }
    }
}
