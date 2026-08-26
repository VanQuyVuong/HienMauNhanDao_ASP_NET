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
    [Authorize(Roles = "NVYT, NVYT_XN, NVYT-XN, QLK, AD")]
    public class TuiMauController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TuiMauController(AppDbContext context)
        {
            _context = context;
        }

        public class TaoTuiMauRequest
        {
            public string MaDon { get; set; } = string.Empty;
            public int TheTich { get; set; } = 350;
            public string? MaNhanVien { get; set; }
            public DateTime? ThoiGianLayMau { get; set; }
            public double? NhietDoVanChuyen { get; set; } = 4.0;
        }

        // API 0: NVYT Xét nghiệm thu nhận máu & sinh mã túi máu barcode
        // POST /api/tuimau
        [HttpPost]
        public async Task<IActionResult> TaoTuiMau([FromBody] TaoTuiMauRequest request)
        {
            var don = await _context.DonDangKys.FirstOrDefaultAsync(d => d.MaDon == request.MaDon);
            if (don == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đơn đăng ký này." });
            }

            // Sinh mã túi máu chuẩn 9 ký tự (TM + mmssfff) tuân thủ [MaxLength(10)]
            string newMaTM = "TM" + DateTime.Now.ToString("mmssfff");

            // Kiểm tra mã nhân viên hợp lệ
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            var nhanVien = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaTaiKhoan == maTaiKhoan);
            string? validMaNV = nhanVien?.MaNhanVien ?? request.MaNhanVien;
            if (!string.IsNullOrEmpty(validMaNV))
            {
                var existNV = await _context.NhanViens.AnyAsync(n => n.MaNhanVien == validMaNV);
                if (!existNV) validMaNV = null;
            }

            var tuiMau = new TuiMau
            {
                MaTuiMau = newMaTM,
                MaDon = request.MaDon,
                MaNhanVien = validMaNV,
                TheTich = request.TheTich,
                ThoiGianLayMau = request.ThoiGianLayMau ?? DateTime.Now,
                TrangThai = TrangThaiTuiMau.ChuaXuLy,
                NhietDoVanChuyen = request.NhietDoVanChuyen ?? 4.0
            };

            _context.TuiMaus.Add(tuiMau);

            don.TheTich = request.TheTich;
            don.TrangThai = TrangThaiDonDangKy.DaHoanThanh;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Đã thu nhận thành công! Mã túi máu: {newMaTM}",
                data = new
                {
                    maTuiMau = newMaTM,
                    maDon = request.MaDon,
                    theTich = request.TheTich,
                    thoiGianLayMau = tuiMau.ThoiGianLayMau,
                    trangThai = "Chờ xét nghiệm"
                }
            });
        }

        // API lấy số liệu thống kê tổng quát túi máu cho Frontend
        [HttpGet("stats")]
        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetStats()
        {
            var tongSoTui = await _context.TuiMaus.CountAsync();
            var tongTheTich = await _context.TuiMaus.SumAsync(t => t.TheTich ?? 0);
            var newVolunteers = await _context.TinhNguyenViens.CountAsync();
            var activeCampaigns = await _context.ChienDichHienMaus.CountAsync(c => c.TrangThai == TrangThaiChienDich.DangDienRa);

            return Ok(new
            {
                totalBloodUnits = tongSoTui,
                newVolunteers = newVolunteers,
                activeCampaigns = activeCampaigns,
                screeningPassRate = 98.5,
                tongSoTui,
                tongTheTich,
                theoNhomMau = new { },
                theoTheTich = new { }
            });
        }

        [HttpGet("charts/bar")]
        public async Task<IActionResult> GetBarChart([FromQuery] int year = 2026)
        {
            var data = new List<object>();
            for (int month = 1; month <= 12; month++)
            {
                var count = await _context.TuiMaus.CountAsync(t => t.ThoiGianLayMau.HasValue && t.ThoiGianLayMau.Value.Year == year && t.ThoiGianLayMau.Value.Month == month);
                data.Add(new { month = $"T.{month}", totalUnits = count });
            }
            return Ok(data);
        }

        // 1. API lấy số liệu thống kê hạn dùng
        // Đường dẫn: GET /api/tuimau/thong-ke-han-dung
        [HttpGet("thong-ke-han-dung")]
        [HttpGet("expiry-stats")]
        public async Task<IActionResult> GetThongKeHanDung()
        {
            var homNay = DateTime.Now;
            // Chỉ lấy các túi máu đã được lưu vào kho 
            var danhSachTui = await _context.TuiMaus
                .Where(t => t.TrangThai == TrangThaiTuiMau.DaLuuKho && t.ThoiGianLayMau != null)
                .ToListAsync();

            int daHetHan = 0;
            int sapHetHan = 0;
            int anToan = 0;
            bool canBaoDong = false;

            foreach (var tui in danhSachTui)
            {
                var ngayHetHan = tui.ThoiGianLayMau!.Value.AddDays(365);
                var soNgayConLai = (ngayHetHan - homNay).Days;

                if (soNgayConLai < 0)
                {
                    daHetHan++;
                    if (soNgayConLai <= -20)
                    {
                        canBaoDong = true;
                    }
                }
                else if (soNgayConLai <= 30)
                {
                    sapHetHan++;
                }
                else
                {
                    anToan++;
                }
            } // ✅ Đã đóng vòng lặp foreach ở đây

            return Ok(new
            {
                expiredCount = daHetHan,
                nearExpiryCount = sapHetHan,
                safeCount = anToan,
                hasCritical = canBaoDong,
                soLuongHetHan = daHetHan,
                soLuongSapHetHan = sapHetHan,
                soLuongAnToan = anToan,
                coCanhBaoNguyCap = canBaoDong
            });
        } //  Đã đóng hàm GetThongKeHanDung ở đây

        // 2. API lấy chi tiết các túi máu để hiển thị lên bảng
        // Đường dẫn: GET /api/tuimau/danh-sach-han-dung?viewMode=all
        [HttpGet("danh-sach-han-dung")]
        [HttpGet("expiry-management")]
        public async Task<IActionResult> GetDanhSachHanDung([FromQuery] string viewMode = "all", [FromQuery] string? search = null)
        {
            var homNay = DateTime.Now;
            var truyVan = _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.ChienDich)
                .Include(t => t.KhoMau)
                .Where(t => t.TrangThai == TrangThaiTuiMau.DaLuuKho && t.ThoiGianLayMau != null);

            // Tìm kiếm theo mã túi máu nếu người dùng gõ tìm kiếm 
            if (!string.IsNullOrEmpty(search))
            {
                truyVan = truyVan.Where(t => t.MaTuiMau.Contains(search));
            }

            var danhSachTui = await truyVan.ToListAsync();

            // Tính toán và định dạng lại dữ liệu trước khi gửi lên React 
            var ketQua = danhSachTui.Select(tui =>
            {
                var ngayHetHan = tui.ThoiGianLayMau!.Value.AddDays(365);
                var soNgayConLai = (ngayHetHan - homNay).Days;
                string trangThaiHan;

                if (soNgayConLai < -30)
                    trangThaiHan = "ARCHIVED_EXPIRED"; // Hết hạn quá 30 ngày chỉ để lưu trữ hồ sơ
                else if (soNgayConLai <= -20)
                    trangThaiHan = "WARNING_EXPIRED";  // Hết hạn quá 20 ngày cảnh báo tiêu hủy gấp
                else if (soNgayConLai < 0)
                    trangThaiHan = "EXPIRED"; // Đã hết hạn
                else if (soNgayConLai <= 30)
                    trangThaiHan = "NEAR_EXPIRY"; // Sắp hết hạn (dưới 30 ngày)
                else
                    trangThaiHan = "SAFE"; // An toàn

                return new
                {
                    maTuiMau = tui.MaTuiMau,
                    maChienDich = tui.DonDangKy?.ChienDich?.MaChienDich ?? "N/A",
                    nhomMau = tui.KhoMau?.NhomMau != null ? tui.KhoMau.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ",
                    theTich = tui.TheTich ?? 0,
                    thoiGianLayMau = tui.ThoiGianLayMau,
                    ngayHetHan = ngayHetHan,
                    soNgayConLai = soNgayConLai,
                    trangThaiHan = trangThaiHan
                };
            }).ToList();

            // Lọc dữ liệu theo tab được chọn bên Frontend 
            if (viewMode == "expired")
            {
                ketQua = ketQua.Where(d => d.trangThaiHan == "EXPIRED" || d.trangThaiHan == "WARNING_EXPIRED" || d.trangThaiHan == "ARCHIVED_EXPIRED").ToList();
            }
            else if (viewMode == "near")
            {
                ketQua = ketQua.Where(d => d.trangThaiHan == "NEAR_EXPIRY").ToList();
            }
            else if (viewMode == "safe")
            {
                ketQua = ketQua.Where(d => d.trangThaiHan == "SAFE").ToList();
            }

            return Ok(ketQua);
        }

        // 3. API tiêu huỷ hàng loạt các túi máu đã hết hạn 
        // Đường dẫn: DELETE /api/tuimau/tieu-huy-hang-loat
        [HttpDelete("tieu-huy-hang-loat")]
        public async Task<IActionResult> TieuHuyHangLoat()
        {
            var homNay = DateTime.Now;
            var danhSachTui = await _context.TuiMaus
                .Where(t => t.TrangThai == TrangThaiTuiMau.DaLuuKho && t.ThoiGianLayMau != null)
                .ToListAsync();

            // Tìm các túi có hạn sử dụng nhỏ hơn hôm nay
            var tuiQuaHan = danhSachTui
                .Where(t => t.ThoiGianLayMau!.Value.AddDays(365) < homNay)
                .ToList();

            if (tuiQuaHan.Any())
            {
                _context.TuiMaus.RemoveRange(tuiQuaHan); // Xóa khỏi CSDL
                await _context.SaveChangesAsync();      // Lưu lại thay đổi
            }

            return Ok(new { success = true, message = $"Đã tiêu hủy thành công {tuiQuaHan.Count} túi máu hết hạn." });
        }

        // 4. API tiêu huỷ 1 túi máu đơn
        // Đường dẫn: DELETE /api/tuimau/tieu-huy-don-le/{id}
        [HttpDelete("tieu-huy-don-le/{id}")]
        public async Task<IActionResult> TieuHuyDonLe(string id)
        {
            var tuiMau = await _context.TuiMaus.FirstOrDefaultAsync(t => t.MaTuiMau == id);
            if (tuiMau == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy túi máu" });
            }

            _context.TuiMaus.Remove(tuiMau);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã tiêu huỷ máu thành công" });
        }


        // API 5: Lấy danh sách túi máu đã có kết quả xét nghiệm (Phê duyệt, Không đạt, Re-test) cho Tab 2 & QLK (Sắp xếp mới nhất lên đầu)
        [HttpGet]
        public async Task<IActionResult> GetDanhSachTuiMauChoQLK()
        {
            var testedMaTuiMaus = await _context.KetQuaXetNghiems
                .Select(k => k.MaTuiMau)
                .Distinct()
                .ToListAsync();

            var danhSach = await _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.ChienDich)
                .Where(t => testedMaTuiMaus.Contains(t.MaTuiMau) || t.TrangThai == TrangThaiTuiMau.DaXetNghiem || t.TrangThai == TrangThaiTuiMau.DaLuuKho || t.TrangThai == TrangThaiTuiMau.DaHuy)
                .OrderByDescending(t => t.ThoiGianLayMau)
                .ThenByDescending(t => t.MaTuiMau)
                .ToListAsync();

            var ketQua = danhSach.Select(t =>
            {
                string trangThaiString = "Chờ xét nghiệm";
                if (t.TrangThai == TrangThaiTuiMau.DaXetNghiem)
                    trangThaiString = "Yêu cầu nhập kho";
                else if (t.TrangThai == TrangThaiTuiMau.DaLuuKho)
                    trangThaiString = "Nhập kho";
                else if (t.TrangThai == TrangThaiTuiMau.DaHuy)
                    trangThaiString = "Đã hủy";

                return new
                {
                    maTuiMau = t.MaTuiMau,
                    maDon = t.MaDon,
                    tenTinhNguyenVien = t.DonDangKy?.TinhNguyenVien?.HoTen ?? "Ẩn danh",
                    tenChienDich = t.DonDangKy?.ChienDich?.TenChienDich ?? "N/A",
                    theTich = t.TheTich ?? 0,
                    thoiGianLayMau = t.ThoiGianLayMau,
                    trangThai = trangThaiString,
                    nhomMau = t.DonDangKy?.TinhNguyenVien?.NhomMau != null
                        ? t.DonDangKy.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-")
                        : "Chưa rõ"
                };
            }).ToList();

            return Ok(ketQua);
        }
        // API 6: Thay đổi trạng thái túi máu (QLK trả túi máu về để kiểm tra lại)
        // PUT /api/tuimau/{id}/status?status=Chờ xét nghiệm
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromQuery] string status)
        {
            var tuiMau = await _context.TuiMaus.FirstOrDefaultAsync(t => t.MaTuiMau == id);
            if (tuiMau == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy túi máu" });
            }
            if (status == "Chờ xét nghiệm")
            {
                // Reset trạng thái về Chưa xử lý và rút khỏi kho tạm thời
                tuiMau.TrangThai = TrangThaiTuiMau.ChuaXuLy;
                tuiMau.MaKho = null;
                // Xóa kết quả xét nghiệm cũ trong DB để bác sĩ làm lại từ đầu
                var xetNghiem = await _context.KetQuaXetNghiems.FirstOrDefaultAsync(k => k.MaTuiMau == id);
                if (xetNghiem != null)
                {
                    _context.KetQuaXetNghiems.Remove(xetNghiem);
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Cập nhật trạng thái túi máu thành công." });
        }

        //api get lấy danh sách các túi máu theo chiến dịch phục vụ thống kê (Danh cho QLK)
        // API 8: Lấy danh sách túi máu trong kho (phục vụ quản lý kho)
        [HttpGet("blood-units")]
        public async Task<IActionResult> GetBloodUnits(
            [FromQuery] int page = 0 ,
            [FromQuery] int size = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            [FromQuery] string? maChienDich = null
            )
        {
            var query = _context.TuiMaus
                .Include(t => t.DonDangKy)
                .ThenInclude(d => d.TinhNguyenVien)
                .Include(t => t.DonDangKy)
                .ThenInclude(d => d.ChienDich)
                .AsQueryable();

            if (!string.IsNullOrEmpty(maChienDich))
            {
                query = query.Where(t => t.DonDangKy != null && t.DonDangKy.MaChienDich == maChienDich);
            }

            //LỌC TRẠNG THÁI 
            if(!string.IsNullOrEmpty(status) && status == "Nhập kho")
            {
                query = query.Where(t => t.TrangThai == TrangThaiTuiMau.DaLuuKho);
            }

            //tìm kiếm theo mã túi hoặc nhóm máu

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.MaTuiMau.Contains(search) ||
                t.DonDangKy.TinhNguyenVien.NhomMau.ToString().Contains(search));
            }
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / size);

            var list = await query
                .OrderByDescending(t => t.ThoiGianLayMau)
                .Skip(page * size)
                .Take(size)
                .ToListAsync();

            var homNay = DateTime.Now;
            var result = list.Select(t =>
            {
                var ngayHetHan = t.ThoiGianLayMau?.AddDays(365) ?? homNay;
                var soNgayConLai = (ngayHetHan - homNay).Days;
                var tinhTrangSD = soNgayConLai < 0 ? "Hết hạn" : (soNgayConLai <= 30 ? "Sắp hết hạn" : "Còn hạn");

                return new
                {
                    maTuiMau = t.MaTuiMau,
                    maChienDich = t.DonDangKy?.ChienDich?.MaChienDich ?? "N/A",
                    nhomMau = t.DonDangKy?.TinhNguyenVien?.NhomMau != null ? t.DonDangKy.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-")
                    : "Chưa rõ",
                    theTich = t.TheTich,
                    ngayThuNhan = t.ThoiGianLayMau,
                    ngayHetHan = ngayHetHan,
                    trangThai = "Nhập kho",
                    tinhTrangHSD = tinhTrangSD
                };
            }).ToList();
            return Ok(new
            {
                content = result,
                totalPages = totalPages,
                totalElements = totalItems
            });
        }
        //{
        //    try
        //    {
        //        if (string.IsNullOrEmpty(maChienDich))
        //        {
        //            return BadRequest(new { success = false, message = "Mã chiến dịch không được để trống." });
        //        }
        //        //query lấy danh sách túi máu join với đơn đăng ký và tình nguyện viên 
        //        var list = await _context.TuiMaus
        //            .Include(t => t.DonDangKy)
        //            .ThenInclude(d => d.TinhNguyenVien)
        //            .Where(t => t.DonDangKy != null && t.DonDangKy.MaChienDich == maChienDich)
        //            .ToArrayAsync();

        //        //chuyển đổi dữ liệu sang định dạng DTO cho FE
        //        var result = list.Select(t => new
        //        {
        //            maTuiMau = t.MaTuiMau,
        //            maDon = t.MaDon,
        //            nhomMau = t.DonDangKy?.TinhNguyenVien?.NhomMau != null
        //            ? t.DonDangKy.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "chưa rõ",
        //            theTich = t.TheTich,
        //            ngayThuNhan = t.ThoiGianLayMau,
        //            thoiGianLayMau = t.ThoiGianLayMau,
        //            nhietDoVanChuyen = t.NhietDoVanChuyen,
        //            trangThai = t.TrangThai == TrangThaiTuiMau.DaLuuKho ? "Nhập kho" :
        //            t.TrangThai == TrangThaiTuiMau.DaXetNghiem ? "Yêu cầu nhập kho" :
        //            t.TrangThai = TrangThaiTuiMau.DaHuy ? "Đã huỷ" : "Chờ xét nghiệm"

        //        }).ToList();

        //        //Bọc trong đối tượng có trường   'Content' để khớp với FE mẫu
        //        return Ok(new { content = result });
        //    }catch(Exception ex)
        //    {
        //        return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
        //    }
        //}


        //API 7 . Quét mã túi maus để chuẩn bị nhập kho
        [HttpGet("scan/{barcode}")]
        public  async Task<IActionResult> ScanTuiMau(string barcode)
        {
            var tui = await _context.TuiMaus
                .Include(t => t.DonDangKy)
                .ThenInclude(d => d.TinhNguyenVien)
                .Include(t => t.DonDangKy)
                .ThenInclude(d => d.ChienDich)
                .FirstOrDefaultAsync(t => t.MaTuiMau == barcode);

            if(tui== null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy túi máu với mã vạch'{barcode}'." });
            }

            //Ràng buộc bảo mật : chỉ cho phép nhập kho túi máu đã có kwts quả xét nghiệm an toàn (DaXetNghiem)
            if (tui.TrangThai != TrangThaiTuiMau.DaXetNghiem)
            {
                if(tui.TrangThai == TrangThaiTuiMau.DaLuuKho)
                {
                    return BadRequest(new { success = false, message = $"Túi máu '{barcode}' đã được nhập khi từ trươc !" });
                }

                return BadRequest(new { success = false, message = $"Túi máu '{barcode}' chưa sẵn sàn nhập kho (trạng thái : {tui.TrangThai})." });
            }

            var homNay = DateTime.Now;
            var ngayHetHan = tui.ThoiGianLayMau?.AddDays(365) ?? homNay.AddDays(365);
            var soNgayConLai = (ngayHetHan - homNay).Days;
            var tinhTrangSd = soNgayConLai < 0 ? "Hết hạn" : (soNgayConLai <= 30 ? "Sắp hết hạn" : "Còn hạn");

            return Ok(new
            {
                maTuiMau = tui.MaTuiMau,
                maChienDich = tui.DonDangKy?.ChienDich?.MaChienDich ?? "N/A",
                nhomMau = tui.DonDangKy?.TinhNguyenVien?.NhomMau != null ? tui.DonDangKy.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-")
                :"Chưa rõ",
                theTich = tui.TheTich,
                ngayThuNhan = tui.ThoiGianLayMau,
                ngayHetHan = ngayHetHan,
                tinhTrangSd = tinhTrangSd
            });


        }


        // Class DTO để hứng dữ liệu cập nhật từ React
        public class CapNhatTuiMauRequest
        {
            public string NhomMau { get; set; } = string.Empty;
            public int? TheTich { get; set; }
            public DateTime? NgayHetHan { get; set; }
        }


        //API 9 cập nhật thông tin túi máu (nhóm máu , thể tích , ngày hết hạn)
        [HttpPut("{maTuiMau}")]
        public async Task<IActionResult> CapNhatTuiMau(string maTuiMau, [FromBody] CapNhatTuiMauRequest request) {
            var tui = await _context.TuiMaus
                    .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                    .FirstOrDefaultAsync(t => t.MaTuiMau == maTuiMau);

            if(tui == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy túi máu !" });

            }

            //cập nhật thể tích 
            if (request.TheTich.HasValue)
            {
                tui.TheTich = request.TheTich.Value;

            }

            //Cập nhật nhóm máu của tình nguyện viên 
            if (!string.IsNullOrEmpty(request.NhomMau) && tui.DonDangKy?.TinhNguyenVien != null)
            {
                string enumStr = request.NhomMau.Replace("+", "_positive").Replace("-", "_negative");
                if(Enum.TryParse<NhomMau>(enumStr, out var parsedEnum))
                {
                    tui.DonDangKy.TinhNguyenVien.NhomMau = parsedEnum;
                }
            }

            //cập nhật ngày hết hạn 
            if (request.NgayHetHan.HasValue)
            {
                tui.ThoiGianLayMau = request.NgayHetHan.Value.AddDays(365);

            }
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Vập nhật thông tin túi máu thành công!" });
        }


        // API 11: Lấy thống kê hạn dùng túi máu
        [HttpGet("expiry-stats")]
        public async Task<IActionResult> GetExpiryStats()
        {
            var homNay = DateTime.Now;
            var list = await _context.TuiMaus.ToListAsync();

            int safeCount = 0;
            int nearExpiryCount = 0;
            int expiredCount = 0;

            foreach (var tui in list)
            {
                var ngayHetHan = tui.ThoiGianLayMau?.AddDays(365) ?? homNay.AddDays(365);
                var soNgayConLai = (ngayHetHan - homNay).Days;
                if (soNgayConLai < 0) expiredCount++;
                else if (soNgayConLai <= 30) nearExpiryCount++;
                else safeCount++;
            }

            return Ok(new
            {
                safeCount = safeCount,
                nearExpiryCount = nearExpiryCount,
                expiredCount = expiredCount
            });
        }

        // API 12: Quản lý chi tiết hạn dùng túi máu
        [HttpGet("expiry-management")]
        public async Task<IActionResult> GetExpiryManagement([FromQuery] string viewMode = "all", [FromQuery] string? search = null)
        {
            var homNay = DateTime.Now;
            var list = await _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .ToListAsync();

            var result = list.Select(t =>
            {
                var ngayHetHan = t.ThoiGianLayMau?.AddDays(365) ?? homNay.AddDays(365);
                var soNgayConLai = (ngayHetHan - homNay).Days;
                string statusTag = soNgayConLai < 0 ? "expired" : (soNgayConLai <= 30 ? "near" : "safe");
                string statusText = soNgayConLai < 0 ? "Đã hết hạn" : (soNgayConLai <= 30 ? "Sắp hết hạn" : "An toàn");

                return new
                {
                    maTuiMau = t.MaTuiMau,
                    tenTinhNguyenVien = t.DonDangKy?.TinhNguyenVien?.HoTen ?? "Nguyễn Văn A",
                    nhomMau = t.DonDangKy?.TinhNguyenVien?.NhomMau != null 
                        ? t.DonDangKy.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-")
                        : "B+",
                    theTich = t.TheTich ?? 350,
                    thoiGianLay = t.ThoiGianLayMau.HasValue ? t.ThoiGianLayMau.Value.ToString("dd/MM/yyyy HH:mm") : "10/06/2026 08:15",
                    ngayHetHan = ngayHetHan.ToString("dd/MM/yyyy"),
                    trangThaiHienThi = statusText,
                    statusTag = statusTag
                };
            }).Where(t => 
                viewMode == "all" || t.statusTag == viewMode
            ).ToList();

            return Ok(result);
        }

        //API 10 .xoá túi máu khỏi kho lưu trữ
        [HttpDelete("blood-units/{maTuiMau}")]
        public async Task<IActionResult> XoaTuiMauKhoiKho(string maTuiMau)
        {
            var tui = await _context.TuiMaus.FirstOrDefaultAsync(t => t.MaTuiMau == maTuiMau);
            if(tui == null)
            {
                return NotFound(new { success = false, message = "không tìm thấy túi máu" });

            }

            //1. xoá các chi tiết phiêys nhập / xuất liên quan trước để tránh lỗi khoá ngoại 
            var chiTiets = await
                _context.ChiTietNhapXuats.Where(c => c.MaTuiMau == maTuiMau).ToListAsync();
            if (chiTiets.Any())
            {
                _context.ChiTietNhapXuats.RemoveRange(chiTiets);

            }
            //2. trừ tồn kho máu của nhóm máu tương ứng đi 1 dvi
            if (!string.IsNullOrEmpty(tui.MaKho))
            {
                var kho = await _context.KhoMaus.FirstOrDefaultAsync(K => K.MaKho == tui.MaKho);
                if (kho != null)
                {
                    kho.SoLuongTon = Math.Max(0, (kho.SoLuongTon ?? 0) - 1);
                }
            }

            //3.Xáo túi máu khỏi csdl
            _context.TuiMaus.Remove(tui);
            await _context.SaveChangesAsync();

            return Ok(new { succcess = true, message = "Xoá túi máu khỏi kho thành công!" });
        }
    }
}