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

        // 1. API Lấy ra danh sách các đơn đang chờ khám sàng lọc 
        // GET /api/khamlamsang/cho-kham
        [HttpGet("cho-kham")]
        public async Task<IActionResult> GetDanhSachChoKham()
        {
            // Lọc ra những đơn Đã duyệt, đã khai báo y tế và chưa từng được khám lâm sàng 
            var choKham = await _context.DonDangKys
                .Include(d => d.TinhNguyenVien)
                .Where(d => d.TrangThai == TrangThaiDonDangKy.DaDuyet)
                .Where(d => _context.HoSoSucKhoes.Any(h => h.MaDon == d.MaDon))
                .Where(d => !_context.KetQuaLamSangs.Any(k => k.MaDon == d.MaDon))
                .Select(d => new
                {
                    maDon = d.MaDon,
                    tenTinhNguyenVien = d.TinhNguyenVien != null ? d.TinhNguyenVien.HoTen : "Ẩn danh",
                    ngaySinh = d.TinhNguyenVien != null && d.TinhNguyenVien.NgaySinh != null ? d.TinhNguyenVien.NgaySinh.Value.ToString("dd/MM/yyyy") : "---",
                    gioiTinh = d.TinhNguyenVien != null ? d.TinhNguyenVien.GioiTinh.ToString().Replace("Nu", "Nữ").Replace("Nam", "Nam") : "---",
                    nhomMau = d.TinhNguyenVien != null && d.TinhNguyenVien.NhomMau != null ?
                        d.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ"
                })
                .ToListAsync();

            return Ok(choKham);
        }

        // 2. API lấy danh sách lịch sử tất cả các ca khám sàng lọc đã thực hiện
        // GET /api/khamlamsang/danh-sach
        [HttpGet("danh-sach")]
        public async Task<IActionResult> GetDanhSachDaKham()
        {
            var danhSach = await _context.KetQuaLamSangs
                .Include(k => k.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .Include(k => k.DonDangKy)
                    .ThenInclude(d => d.ChienDich)
                .Include(k => k.BacSiKham)
                .OrderByDescending(k => k.MaKQ)
                .Select(k => new
                {
                    maKQ = k.MaKQ,
                    maDon = k.MaDon,
                    tenTinhNguyenVien = k.DonDangKy != null && k.DonDangKy.TinhNguyenVien != null ? k.DonDangKy.TinhNguyenVien.HoTen : "Ẩn danh",
                    tenChienDich = k.DonDangKy != null && k.DonDangKy.ChienDich != null ? k.DonDangKy.ChienDich.TenChienDich : "N/A",
                    huyetAp = k.HuyetAp,
                    nhipTim = k.NhipTim,
                    canNang = k.CanNang,
                    nhietDo = k.NhietDo,
                    ketQua = k.KetQua,
                    tenBacSi = k.BacSiKham != null ? k.BacSiKham.hoTen : "Hệ thống",
                    maBacSi = k.MaNhanVien,
                    lyDoTuChoi = k.LyDoTuChoi
                })
                .ToListAsync();

            return Ok(danhSach);
        }

        // 3. API lấy số liệu thống kê khám sàng lọc (Tổng số, Đạt, Không đạt)
        // GET /api/khamlamsang/thong-ke
        [HttpGet("thong-ke")]
        public async Task<IActionResult> GetThongKeKham()
        {
            var tongSo = await _context.KetQuaLamSangs.CountAsync();
            var datYeuCau = await _context.KetQuaLamSangs.CountAsync(k => k.KetQua == true);
            var khongDat = await _context.KetQuaLamSangs.CountAsync(k => k.KetQua == false);

            return Ok(new
            {
                tongSo,
                datYeuCau,
                khongDat
            });
        }

        // 4. API lưu kết quả khám lâm sàng & TỰ ĐỘNG sinh túi máu nếu kết quả ĐẠT
        // POST /api/khamlamsang/luu
        [HttpPost("luu")]
        public async Task<IActionResult> LuuKetQua([FromBody] KhamLamSangRequest request)
        {
            var don = await _context.DonDangKys.FirstOrDefaultAsync(d => d.MaDon == request.MaDon);
            if (don == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đơn đăng ký này." });
            }

            // A. Sinh mã khám sàng lọc tự động (Dạng: KS00001)
            var maxKQ = await _context.KetQuaLamSangs.OrderByDescending(k => k.MaKQ).FirstOrDefaultAsync();
            int nextKQId = 1;
            if (maxKQ != null && maxKQ.MaKQ.StartsWith("KS"))
            {
                int.TryParse(maxKQ.MaKQ.Substring(2), out int currentKQId);
                nextKQId = currentKQId + 1;
            }
            string newMaKQ = "KS" + nextKQId.ToString("D5");

            // B. Tạo thực thể kết quả khám sàng lọc 
            var kqls = new KetQuaLamSang
            {
                MaKQ = newMaKQ,
                MaDon = request.MaDon,
                MaNhanVien = request.MaNhanVien,
                HuyetAp = request.HuyetAp,
                NhipTim = request.NhipTim,
                CanNang = request.CanNang,
                NhietDo = request.NhietDo,
                KetQua = request.KetQua,
                LyDoTuChoi = request.KetQua ? "" : request.LyDoTuChoi
            };
            _context.KetQuaLamSangs.Add(kqls);

            // C. Xử lý logic Đạt/Không đạt và tự động tạo túi máu 
            if (request.KetQua)
            {
                don.TrangThai = TrangThaiDonDangKy.DaHoanThanh;
                don.TheTich = request.TheTichHien;

                var maxTM = await _context.TuiMaus.OrderByDescending(t => t.MaTuiMau).FirstOrDefaultAsync();
                int nextTMId = 1;
                if (maxTM != null && maxTM.MaTuiMau.StartsWith("TM"))
                {
                    int.TryParse(maxTM.MaTuiMau.Substring(2), out int currentTMId);
                    nextTMId = currentTMId + 1;
                }
                string newMaTM = "TM" + nextTMId.ToString("D5");

                var tuiMau = new TuiMau
                {
                    MaTuiMau = newMaTM,
                    MaDon = request.MaDon,
                    MaNhanVien = request.MaNhanVien,
                    TheTich = request.TheTichHien,
                    ThoiGianLayMau = DateTime.Now,
                    TrangThai = TrangThaiTuiMau.ChuaXuLy,
                    NhietDoVanChuyen = 4.0
                };
                _context.TuiMaus.Add(tuiMau);
            }
            else
            {
                don.TrangThai = TrangThaiDonDangKy.DaTuChoi;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Lưu kết quả khám và xử lý túi máu thành công." });
        }

        // 5. API xóa ca khám sàng lọc (Để sửa sai)
        // DELETE /api/khamlamsang/xoa/{id}
        [HttpDelete("xoa/{id}")]
        public async Task<IActionResult> XoaCaKham(string id)
        {
            var caKham = await _context.KetQuaLamSangs.FirstOrDefaultAsync(k => k.MaKQ == id);
            if (caKham == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy ca khám" });
            }

            var tuiMau = await _context.TuiMaus.FirstOrDefaultAsync(t => t.MaDon == caKham.MaDon);
            if (tuiMau != null)
            {
                _context.TuiMaus.Remove(tuiMau);
            }

            var don = await _context.DonDangKys.FirstOrDefaultAsync(d => d.MaDon == caKham.MaDon);
            if (don != null)
            {
                don.TrangThai = TrangThaiDonDangKy.DaDuyet;
                don.TheTich = null;
            }

            _context.KetQuaLamSangs.Remove(caKham);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã xóa ca khám và khôi phục đơn đăng ký." });
        }
    }

    // Lớp DTO hứng dữ liệu gửi lên từ React
    public class KhamLamSangRequest
    {
        public string MaDon { get; set; } = string.Empty;
        public string MaNhanVien { get; set; } = string.Empty;
        public string HuyetAp { get; set; } = string.Empty;
        public int NhipTim { get; set; }
        public double CanNang { get; set; }
        public double NhietDo { get; set; }
        public bool KetQua { get; set; }
        public string? LyDoTuChoi { get; set; }
        public int TheTichHien { get; set; }
    }
}
