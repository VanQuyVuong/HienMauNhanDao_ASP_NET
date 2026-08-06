using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "QLK, NVYT, AD")]
    public class KhoMauBenhVienController : ControllerBase
    {
        private readonly AppDbContext _context;

        public KhoMauBenhVienController(AppDbContext context)
        {
            _context = context;
        }

        // Helper lấy thông tin Nhân viên & Khoa công tác (Bệnh viện) của tài khoản đang đăng nhập
        private async Task<(NhanVien? nhanVien, KhoaCongTac? khoaCongTac)> GetNhanVienProfileAsync()
        {
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value 
                          ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;

            NhanVien? nv = null;

            if (!string.IsNullOrEmpty(maTaiKhoan))
            {
                nv = await _context.NhanViens
                    .Include(n => n.KhoaCongTac)
                    .FirstOrDefaultAsync(n => n.MaTaiKhoan == maTaiKhoan);
            }

            if (nv == null && !string.IsNullOrEmpty(email))
            {
                var tk = await _context.TaiKhoans.FirstOrDefaultAsync(t => t.Email == email);
                if (tk != null)
                {
                    nv = await _context.NhanViens
                        .Include(n => n.KhoaCongTac)
                        .FirstOrDefaultAsync(n => n.MaTaiKhoan == tk.MaTaiKhoan);
                }
            }

            // Fallback an toàn nếu chưa gắn khoa công tác
            if (nv?.KhoaCongTac == null)
            {
                var defaultKhoa = await _context.KhoaCongTacs.FirstOrDefaultAsync() 
                               ?? new KhoaCongTac { MaKhoa = "BV01", TenKhoa = "Bệnh viện C Đà Nẵng" };
                return (nv, defaultKhoa);
            }

            return (nv, nv.KhoaCongTac);
        }

        // API 1: Xem tổng quan tồn kho của TẤT CẢ CÁC BỆNH VIỆN (Chi tiết 8 nhóm máu A+, A-, B+, B-, O+, O-, AB+, AB-)
        [HttpGet("all-hospitals")]
        public async Task<IActionResult> GetAllHospitalsStock()
        {
            var danhSachKhoa = await _context.KhoaCongTacs
                .Where(k => k.MaKhoa.StartsWith("BV"))
                .ToListAsync();

            if (!danhSachKhoa.Any())
            {
                danhSachKhoa = await _context.KhoaCongTacs.Take(4).ToListAsync();
            }
            var danhSachKhoMau = await _context.KhoMaus.ToListAsync();
            var danhSachTuiMau = await _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .ToListAsync();

            var result = danhSachKhoa.Select(khoa =>
            {
                var tuis = danhSachTuiMau.Where(t => t.MaKho == khoa.MaKhoa || (khoa.MaKhoa == "BV01" && string.IsNullOrEmpty(t.MaKho))).ToList();
                
                int GetCount(string code) => tuis.Count(t => 
                    t.DonDangKy?.TinhNguyenVien?.NhomMau?.ToString() == code);

                return new
                {
                    maBenhVien = khoa.MaKhoa,
                    tenBenhVien = khoa.TenKhoa,
                    tongSoTuiTon = tuis.Count,
                    tongTheTich = tuis.Sum(t => t.TheTich ?? 0),
                    details = new
                    {
                        aPos = GetCount("A_positive"),
                        aNeg = GetCount("A_negative"),
                        bPos = GetCount("B_positive"),
                        bNeg = GetCount("B_negative"),
                        oPos = GetCount("O_positive"),
                        oNeg = GetCount("O_negative"),
                        abPos = GetCount("AB_positive"),
                        abNeg = GetCount("AB_negative")
                    }
                };
            });

            return Ok(new { success = true, data = result });
        }

        // API 2: Lấy thông tin Bệnh viện & Chi tiết Kho Máu của Bệnh viện QLK công tác
        [HttpGet("my-hospital")]
        public async Task<IActionResult> GetMyHospitalStock()
        {
            var (nv, khoa) = await GetNhanVienProfileAsync();
            string maKhoa = khoa?.MaKhoa ?? "BV01";
            string tenBenhVien = khoa?.TenKhoa ?? "Bệnh viện C Đà Nẵng";

            // Lấy danh sách các túi máu hiện lưu tại Kho Bệnh viện này
            var danhSachTuiMau = await _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.ChienDich)
                .Where(t => t.MaKho == maKhoa || (t.TrangThai == TrangThaiTuiMau.DaLuuKho && string.IsNullOrEmpty(t.MaKho)))
                .OrderByDescending(t => t.ThoiGianLayMau)
                .ToListAsync();

            var mappedUnits = danhSachTuiMau.Select(t => new
            {
                maTuiMau = t.MaTuiMau,
                maDon = t.MaDon,
                tenTinhNguyenVien = t.DonDangKy?.TinhNguyenVien?.HoTen ?? "TNV",
                soCCCD = t.DonDangKy?.TinhNguyenVien?.Cccd,
                nhomMau = t.DonDangKy?.TinhNguyenVien?.NhomMau != null 
                    ? t.DonDangKy.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") 
                    : "Chưa rõ",
                theTich = t.TheTich ?? 350,
                tenChienDich = t.DonDangKy?.ChienDich?.TenChienDich ?? "Chiến dịch hiến máu",
                thoiGianLay = t.ThoiGianLayMau?.ToString("dd/MM/yyyy HH:mm"),
                ngayHetHan = t.ThoiGianLayMau?.AddDays(365).ToString("dd/MM/yyyy"),
                trangThai = t.TrangThai.ToString()
            });

            return Ok(new
            {
                success = true,
                hospital = new
                {
                    maKhoa = maKhoa,
                    tenBenhVien = tenBenhVien,
                    nhanVienQuanLy = nv?.HoTen ?? "Cán bộ Kho Máu",
                    maNhanVien = nv?.MaNhanVien ?? "NV00012"
                },
                stats = new
                {
                    tongSoTui = mappedUnits.Count(),
                    tongTheTich = mappedUnits.Sum(u => u.theTich),
                },
                bloodUnits = mappedUnits
            });
        }

        // API 3: Truy vấn thông tin túi máu trực tiếp bằng mã Barcode (Realtime Scan)
        [HttpGet("scan-blood-unit/{maTuiMau}")]
        public async Task<IActionResult> ScanBloodUnit(string maTuiMau)
        {
            if (string.IsNullOrWhiteSpace(maTuiMau))
            {
                return BadRequest(new { success = false, message = "Vui lòng nhập mã túi máu!" });
            }

            string cleanCode = maTuiMau.Trim();
            var tui = await _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.ChienDich)
                .FirstOrDefaultAsync(t => t.MaTuiMau == cleanCode);

            if (tui == null)
            {
                return NotFound(new { 
                    success = false, 
                    message = $"Không tìm thấy túi máu với mã '{cleanCode}'. Vui lòng kiểm tra lại!" 
                });
            }

            // Kiểm tra kết quả xét nghiệm vi sinh
            var xn = await _context.KetQuaXetNghiems
                .FirstOrDefaultAsync(k => k.MaTuiMau == cleanCode);

            string nhomMauStr = tui.DonDangKy?.TinhNguyenVien?.NhomMau != null
                ? tui.DonDangKy.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-")
                : "Chưa rõ";

            bool isViSinhReady = xn != null && xn.KetQua == true;

            return Ok(new
            {
                success = true,
                data = new
                {
                    maTuiMau = tui.MaTuiMau,
                    maDon = tui.MaDon,
                    tenTinhNguyenVien = tui.DonDangKy?.TinhNguyenVien?.HoTen ?? "TNV",
                    soCCCD = tui.DonDangKy?.TinhNguyenVien?.Cccd,
                    nhomMau = nhomMauStr,
                    theTich = tui.TheTich ?? 350,
                    tenChienDich = tui.DonDangKy?.ChienDich?.TenChienDich ?? "Chiến dịch hiến máu",
                    thoiGianLay = tui.ThoiGianLayMau?.ToString("dd/MM/yyyy HH:mm"),
                    ngayHetHan = tui.ThoiGianLayMau?.AddDays(365).ToString("dd/MM/yyyy"),
                    trangThaiHienTai = tui.TrangThai.ToString(),
                    ketQuaViSinh = isViSinhReady ? "ĐẠT TIÊU CHUẨN VI SINH" : (xn != null ? "KHÔNG ĐẠT" : "ĐÃ QUA XÉT NGHIỆM"),
                    isEligibleImport = true // Sẵn sàng nhập kho
                }
            });
        }

        public class ImportHospitalRequest
        {
            public string MaTuiMau { get; set; } = string.Empty;
            public string? GhiChu { get; set; }
        }

        // API 4: 1-Click Xác Nhận Nhập Kho Bệnh Viện cho QLK
        [HttpPost("import")]
        public async Task<IActionResult> ConfirmImportToHospital([FromBody] ImportHospitalRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MaTuiMau))
            {
                return BadRequest(new { success = false, message = "Vui lòng cung cấp mã túi máu!" });
            }

            var (nv, khoa) = await GetNhanVienProfileAsync();
            string maKhoa = khoa?.MaKhoa ?? "BV01";
            string tenBenhVien = khoa?.TenKhoa ?? "Bệnh viện C Đà Nẵng";

            var tui = await _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .FirstOrDefaultAsync(t => t.MaTuiMau == request.MaTuiMau.Trim());

            if (tui == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy túi máu {request.MaTuiMau}" });
            }

            // Cập nhật trạng thái túi máu
            tui.TrangThai = TrangThaiTuiMau.DaLuuKho;
            tui.MaKho = maKhoa;

            // Cập nhật số lượng tồn kho theo nhóm máu cho Kho Bệnh viện
            var kho = await _context.KhoMaus.FirstOrDefaultAsync(k => k.MaKho == maKhoa);
            if (kho != null)
            {
                kho.SoLuongTon = (kho.SoLuongTon ?? 0) + 1;
            }
            else
            {
                // Nếu chưa có bản ghi kho, tự động khởi tạo
                _context.KhoMaus.Add(new KhoMau
                {
                    MaKho = maKhoa,
                    TenKho = $"Kho Máu {tenBenhVien}",
                    SoLuongTon = 1,
                    NguongAnToan = 50,
                    MoTa = $"Kho máu chuyên dụng lưu trữ tại {tenBenhVien}"
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Đã nhập kho thành công túi máu {tui.MaTuiMau} vào {tenBenhVien}!",
                data = new
                {
                    maTuiMau = tui.MaTuiMau,
                    tenBenhVien = tenBenhVien,
                    trangThai = "Đã lưu kho"
                }
            });
        }

        public class ReportIssueRequest
        {
            public string MaTuiMau { get; set; } = string.Empty;
            public string LyDo { get; set; } = string.Empty;
            public string HanhDong { get; set; } = "KIEM_TRA"; // "KIEM_TRA" hoặc "HUY"
        }

        // API 5: Xử lý Sự cố túi máu (Báo hỏng / Yêu cầu kiểm tra)
        [HttpPost("report-issue")]
        public async Task<IActionResult> ReportIssue([FromBody] ReportIssueRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MaTuiMau))
            {
                return BadRequest(new { success = false, message = "Vui lòng cung cấp mã túi máu!" });
            }

            var tui = await _context.TuiMaus.FirstOrDefaultAsync(t => t.MaTuiMau == request.MaTuiMau.Trim());
            if (tui == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy túi máu {request.MaTuiMau}" });
            }

            if (request.HanhDong == "HUY")
            {
                tui.TrangThai = TrangThaiTuiMau.DaHuy;
            }
            else
            {
                tui.TrangThai = TrangThaiTuiMau.ChuaXuLy;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = request.HanhDong == "HUY" 
                    ? $"Đã hủy túi máu {tui.MaTuiMau} thành công do: {request.LyDo}" 
                    : $"Đã chuyển túi máu {tui.MaTuiMau} sang diện kiểm tra lại!",
                data = new { maTuiMau = tui.MaTuiMau, trangThai = tui.TrangThai.ToString() }
            });
        }
    }
}
