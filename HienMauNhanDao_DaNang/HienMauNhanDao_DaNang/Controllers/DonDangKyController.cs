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
    public class DonDangKyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DonDangKyController(AppDbContext context)
        {
            _context = context;
        }

        public class DangKyRequest
        {
            public string MaChienDich { get; set; }
            public int? TheTich { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> DangKyHienMau([FromBody] DangKyRequest request)
        {
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;

            var tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

            if (tnv == null)
            {
                tnv = new TinhNguyenVien
                {
                    maTNV = "TNV" + DateTime.Now.ToString("HHmmss"), // Đã sửa maTNV
                    MaTaiKhoan = maTaiKhoan,
                    HoTen = "TNV Mới",
                    Cccd = "000000000000", // Đã sửa Cccd
                    NgaySinh = new DateOnly(2000, 1, 1), // Đã sửa DateOnly
                    SoDienThoai = "0000000000"
                };
                _context.TinhNguyenViens.Add(tnv);
                await _context.SaveChangesAsync();
            }

            var chienDich = string.IsNullOrEmpty(request.MaChienDich) ? null : await _context.ChienDichHienMaus.FindAsync(request.MaChienDich);
            if (chienDich == null)
            {
                var defaultRoutine = await _context.ChienDichHienMaus
                    .FirstOrDefaultAsync(c => c.MaChienDich == "CD00004" || c.MaChienDich == "CD00003" || c.TrangThai == TrangThaiChienDich.DangDienRa);
                if (defaultRoutine != null)
                {
                    request.MaChienDich = defaultRoutine.MaChienDich;
                    chienDich = defaultRoutine;
                }
                else
                {
                    return NotFound(new { success = false, message = "Chiến dịch không tồn tại!" });
                }
            }

            var donMoi = new DonDangKy
            {
                MaDon = "DON" + DateTime.Now.ToString("HHmmss"),
                MaChienDich = request.MaChienDich,
                ThoiGianDangKy = DateTime.Now,
                TrangThai = TrangThaiDonDangKy.DaDangKy, // Luồng chuẩn: Web tạo -> DaDangKy. Lễ tân ấn Tiếp nhận -> ChoDuyet. Bác sĩ Khám -> DaDuyet
                TheTich = request.TheTich ?? 250,
                MaTNV = tnv.maTNV // Đã sửa maTNV
            };

            _context.DonDangKys.Add(donMoi);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đăng ký hiến máu thành công!", maDon=donMoi.MaDon });
        }

        public class TiepNhanRequest
        {
            public string? MaDon { get; set; }
            public string? MaTNV { get; set; }
            public string? MaChienDich { get; set; }
            public int TheTich { get; set; } = 250;
            public string? GhiChu { get; set; }
        }

        // API dành cho Lễ tân / Y tá tạo đơn hoặc tiếp nhận đơn tại quầy
        [HttpPost("tiep-nhan")]
        [Authorize(Roles = "NVYT, NVYT_LT, NVYT-LT, AD")]
        public async Task<IActionResult> TiepNhanHienMau([FromBody] TiepNhanRequest request)
        {
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            var nhanVien = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaTaiKhoan == maTaiKhoan);

            // 1. Trường hợp tiếp nhận tờ đơn sẵn có
            if (!string.IsNullOrEmpty(request.MaDon))
            {
                var don = await _context.DonDangKys.FindAsync(request.MaDon);
                if (don != null)
                {
                    don.TrangThai = TrangThaiDonDangKy.ChoDuyet;
                    don.TheTich = request.TheTich;
                    if (nhanVien != null) don.MaNhanVien = nhanVien.MaNhanVien;
                    await _context.SaveChangesAsync();
                    return Ok(new { success = true, message = "Đã tiếp nhận và chuyển đơn sang Bác sĩ thành công!", maDon = don.MaDon });
                }
            }

            if (string.IsNullOrEmpty(request.MaTNV))
            {
                return BadRequest(new { success = false, message = "Cần mã Tình nguyện viên để tiếp nhận!" });
            }

            // 2. Trường hợp tạo mới đơn khi tiếp nhận tại quầy (Walk-in)
            var maTNV = request.MaTNV;
            if (!string.IsNullOrEmpty(maTNV) && maTNV.Length > 10)
            {
                maTNV = maTNV.Substring(0, 10);
            }

            // Kiểm tra MaTNV có tồn tại trong CSDL chưa
            var existTNV = await _context.TinhNguyenViens.AnyAsync(t => t.maTNV == maTNV);
            if (!existTNV)
            {
                var tnvMoi = new TinhNguyenVien
                {
                    maTNV = maTNV,
                    HoTen = "TNV Tiếp Nhận Quầy",
                    Cccd = "000000000000",
                    SoDienThoai = "0000000000",
                    NgaySinh = new DateOnly(2000, 1, 1)
                };
                _context.TinhNguyenViens.Add(tnvMoi);
                await _context.SaveChangesAsync();
            }

            // Kiểm tra MaChienDich có hợp lệ không (tối đa 10 ký tự)
            string? validMaChienDich = null;
            if (!string.IsNullOrEmpty(request.MaChienDich) && request.MaChienDich.Length <= 10)
            {
                var existCD = await _context.ChienDichHienMaus.AnyAsync(c => c.MaChienDich == request.MaChienDich);
                if (existCD) validMaChienDich = request.MaChienDich;
            }

            // Kiểm tra MaNhanVien có hợp lệ không (tối đa 10 ký tự)
            string? validMaNhanVien = null;
            if (nhanVien != null && !string.IsNullOrEmpty(nhanVien.MaNhanVien) && nhanVien.MaNhanVien.Length <= 10)
            {
                var existNV = await _context.NhanViens.AnyAsync(n => n.MaNhanVien == nhanVien.MaNhanVien);
                if (existNV) validMaNhanVien = nhanVien.MaNhanVien;
            }

            // Sinh maDon chuẩn 9 ký tự "DK" + mmssfff (Tuân thủ strictly [MaxLength(10)])
            var maDonMoi = "DK" + DateTime.Now.ToString("mmssfff");

            var donMoi = new DonDangKy
            {
                MaDon = maDonMoi,
                MaTNV = maTNV,
                MaChienDich = validMaChienDich,
                MaNhanVien = validMaNhanVien,
                ThoiGianDangKy = DateTime.Now,
                TrangThai = TrangThaiDonDangKy.ChoDuyet,
                TheTich = request.TheTich
            };

            _context.DonDangKys.Add(donMoi);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Tiếp nhận hiến máu thành công!", maDon = donMoi.MaDon });
        }

        public class TiepNhanKhanCapRequest
        {
            public string? MaTNV { get; set; }
            public string? Cccd { get; set; }
            public string? HoTen { get; set; }
            public string? SoDienThoai { get; set; }
            public string? NhomMau { get; set; }
            public string? MaChienDich { get; set; }
            public int TheTich { get; set; } = 350;
            public string? GhiChu { get; set; }
        }

        // API Tiếp nhận Hiến Máu Khẩn Cấp Fast-Track (Dành cho Lễ tân / NVYT tiếp nhận ca cấp cứu khẩn)
        [HttpPost("tiep-nhan-khan-cap")]
        [Authorize(Roles = "NVYT, AD")]
        public async Task<IActionResult> TiepNhanKhanCap([FromBody] TiepNhanKhanCapRequest request)
        {
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            var nhanVien = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaTaiKhoan == maTaiKhoan);

            TinhNguyenVien? tnv = null;
            if (!string.IsNullOrEmpty(request.MaTNV))
            {
                tnv = await _context.TinhNguyenViens.FindAsync(request.MaTNV);
            }
            else if (!string.IsNullOrEmpty(request.Cccd))
            {
                tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.Cccd == request.Cccd);
            }

            if (tnv == null && !string.IsNullOrEmpty(request.HoTen))
            {
                tnv = new TinhNguyenVien
                {
                    maTNV = "TN" + DateTime.Now.ToString("HHmmss"),
                    HoTen = request.HoTen,
                    Cccd = string.IsNullOrEmpty(request.Cccd) ? "000000000000" : request.Cccd,
                    SoDienThoai = string.IsNullOrEmpty(request.SoDienThoai) ? "0000000000" : request.SoDienThoai,
                    NgaySinh = new DateOnly(2000, 1, 1)
                };
                if (!string.IsNullOrEmpty(request.NhomMau) && Enum.TryParse<NhomMau>(request.NhomMau, out var nm))
                {
                    tnv.NhomMau = nm;
                }
                _context.TinhNguyenViens.Add(tnv);
                await _context.SaveChangesAsync();
            }

            if (tnv == null)
            {
                return BadRequest(new { success = false, message = "Vui lòng cung cấp thông tin Tình nguyện viên!" });
            }

            var maChienDich = request.MaChienDich;
            if (string.IsNullOrEmpty(maChienDich))
            {
                var defaultEmergency = await _context.ChienDichHienMaus
                    .FirstOrDefaultAsync(c => c.MucDoUuTien == MucDoUuTienChienDich.KhanCap && c.TrangThai == TrangThaiChienDich.DangDienRa);
                maChienDich = defaultEmergency?.MaChienDich ?? "CD00004";
            }

            var donMoi = new DonDangKy
            {
                MaDon = "DON" + DateTime.Now.ToString("HHmmss"),
                MaTNV = tnv.maTNV,
                MaChienDich = maChienDich,
                MaNhanVien = nhanVien?.MaNhanVien,
                ThoiGianDangKy = DateTime.Now,
                TrangThai = TrangThaiDonDangKy.DaHoanThanh, // Khẩn cấp hoàn thành trực tiếp để Admin khen thưởng
                TheTich = request.TheTich
            };

            _context.DonDangKys.Add(donMoi);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã tiếp nhận khẩn cấp thành công và chuyển dữ liệu Admin khen thưởng!", maDon = donMoi.MaDon });
        }

        [HttpGet]
        public async Task<IActionResult> LayLichSuDangKy()
        {
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            var tnv = await _context.TinhNguyenViens.FirstOrDefaultAsync(t => t.MaTaiKhoan == maTaiKhoan);

            if (tnv == null) return Ok(new { success = true, data = new List<DonDangKy>() });

            var danhSach = await _context.DonDangKys
                                         .Include(d => d.ChienDich)
                                         .Where(d => d.MaTNV == tnv.maTNV) // Đã sửa maTNV
                                         .OrderByDescending(d => d.ThoiGianDangKy)
                                         .ToListAsync();

            return Ok(new { success = true, data = danhSach });
        }


        // API 3: Dành cho nhân viên y tế lễ tân và Bác sĩ xem toàn bộ danh sách đơn 
        [HttpGet("tat-ca")]
        [Authorize(Roles = "NVYT, NVYT_LT, NVYT-LT, NVYT_XN, NVYT-XN, BS, AD")]  // Khóa kép đầy đủ: NVYT Lễ Tân, NVYT Xét Nghiệm, Bác Sĩ và Admin
        public async Task<IActionResult> LayTatCaDon()
        {
            // Lấy tất cả mọi tờ đơn trong cơ sở dữ liệu 
            var danhSach = await _context.DonDangKys
                .Include(d => d.ChienDich) // LẤY TÊN CHIẾN DỊCH
                .Include(D => D.TinhNguyenVien)   // lấy thông tin Tình nguyện viên nộp đơn
                .OrderByDescending(d => d.TrangThai == TrangThaiDonDangKy.DaDangKy) // Ưu tiên Đơn đăng ký từ Web chưa tiếp nhận lên đầu
                .ThenByDescending(d => d.ThoiGianDangKy) // Sau đó mới sắp xếp theo thời gian mới nhất
                .ToListAsync();

            return Ok(new { success = true, data = danhSach });
        }

        // API 3.1: Dành cho NVYT Xét Nghiệm lấy danh sách đơn chờ thu nhận máu (Đã khám lâm sàng đạt)
        [HttpGet("cho-thu-nhan")]
        [HttpGet("ready-for-collection")]
        [Authorize(Roles = "NVYT, NVYT_XN, NVYT-XN, AD")]
        public async Task<IActionResult> LayDanhSachChoThuNhan([FromQuery] int page = 0, [FromQuery] int size = 10)
        {
            var query = _context.DonDangKys
                .Include(d => d.TinhNguyenVien)
                .Include(d => d.ChienDich)
                .Where(d => d.TrangThai == TrangThaiDonDangKy.DaDuyet)
                .Where(d => !_context.TuiMaus.Any(t => t.MaDon == d.MaDon && (t.TrangThai == TrangThaiTuiMau.DaXetNghiem || t.TrangThai == TrangThaiTuiMau.DaLuuKho || t.TrangThai == TrangThaiTuiMau.DaHuy)))
                .OrderByDescending(d => d.ThoiGianDangKy);

            var totalElements = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalElements / (double)(size > 0 ? size : 10));
            var rawList = await query.Skip(page * (size > 0 ? size : 10)).Take(size > 0 ? size : 10).ToListAsync();

            var rawMaDons = rawList.Select(r => r.MaDon).ToList();
            var allTuiMaus = await _context.TuiMaus
                .Where(t => rawMaDons.Contains(t.MaDon))
                .ToListAsync();

            var content = rawList.Select(d =>
            {
                var tui = allTuiMaus.FirstOrDefault(t => t.MaDon == d.MaDon);
                return new
                {
                    maDon = d.MaDon,
                    maTNV = d.MaTNV,
                    maTuiMau = tui?.MaTuiMau,
                    daCapMa = tui != null,
                    trangThaiTuiMau = tui != null ? "Đã cấp mã (Chờ XN Trang 2)" : "Chưa sinh mã",
                    hoTen = d.TinhNguyenVien?.HoTen ?? "TNV Hiến Máu",
                    hoVaTen = d.TinhNguyenVien?.HoTen ?? "TNV Hiến Máu",
                    tenTinhNguyenVien = d.TinhNguyenVien?.HoTen ?? "TNV Hiến Máu",
                    cccd = d.TinhNguyenVien?.Cccd ?? "---",
                    soCCCD = d.TinhNguyenVien?.Cccd ?? "---",
                    nhomMau = d.TinhNguyenVien?.NhomMau != null ? d.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ",
                    maChienDich = d.MaChienDich ?? "N/A",
                    tenChienDich = d.ChienDich?.TenChienDich ?? "Hiến máu thường xuyên",
                    theTich = tui?.TheTich ?? d.TheTich ?? 350,
                    tenBacSi = "Bác Sĩ Khám Sàng Lọc",
                    maBacSi = d.MaNhanVien ?? "NV00004",
                    tinhNguyenVien = d.TinhNguyenVien != null ? new
                    {
                        maTNV = d.TinhNguyenVien.maTNV,
                        hoTen = d.TinhNguyenVien.HoTen,
                        hoVaTen = d.TinhNguyenVien.HoTen,
                        cccd = d.TinhNguyenVien.Cccd,
                        soCCCD = d.TinhNguyenVien.Cccd,
                        nhomMau = d.TinhNguyenVien.NhomMau != null ? d.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ"
                    } : null
                };
            });

            return Ok(new
            {
                success = true,
                content = content,
                totalElements = totalElements,
                totalPages = totalPages
            });
        }


        //class này để hứng các trạng thái phê duyệt và từ chối từ React gửi lên 
        public class DuyetDonRequest()
        {
            public TrangThaiDonDangKy TrangThaiMoi { set; get; }
        }


        //API 4 :DÙNG CHO NHÂN VIÊN Y TẾ THAY ĐỔI TRẠNG THÁI ĐƠN 
        [HttpPut("{maDon}/duyet")]
        [Authorize(Roles = "NVYT, AD")]

        public async Task<IActionResult> DuyetDon(string maDon, [FromBody] DuyetDonRequest request)
        {
            var don = await _context.DonDangKys.FindAsync(maDon);
            if (don == null) return NotFound(new { success = false, message = "Khong tim thay don!" });


            //1.Cập nhật trạng thái mới
            don.TrangThai = request.TrangThaiMoi;

            //2.Ghi nhận dấu ấn : lấy mã nvyt đang đăng nhập để điền vào cột người phụ trách
            var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
            var nhanVien = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaTaiKhoan == maTaiKhoan);

            if (nhanVien != null)
            {
                don.MaNhanVien = nhanVien.MaNhanVien;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Da cap nhat trang thai dơn thanh cong !" });
        }

        //class hứng dữ liệ thể tích máu từ react gửi lên 
        public class XacNhanHienMauRequest
        {
            public int TheTich { set; get; }
        }

        // API 5: Dành cho NHÂN VIÊN Y TẾ xác nhận lấy máu (PHIÊN BẢN TỰ ĐỘNG NHẬP KHO)
        [HttpPut("{maDon}/xac-nhan")]
        [Authorize(Roles = "NVYT, AD")]
        public async Task<IActionResult> XacNhanHienMau(string maDon, [FromBody] XacNhanHienMauRequest request)
        {
            // 1. Lấy đơn ra, KÈM THEO thông tin của Tình nguyện viên (Để soi xem họ nhóm máu gì)
            var don = await _context.DonDangKys
                                    .Include(d => d.TinhNguyenVien)
                                    .FirstOrDefaultAsync(d => d.MaDon == maDon);

            if (don == null) return NotFound(new { success = false, message = "Không tìm thấy đơn!" });

            if (don.TrangThai != TrangThaiDonDangKy.DaDuyet)
            {
                return BadRequest(new { success = false, message = "Đơn chưa được duyệt, không thể lấy máu!" });
            }

            // 2. Chốt sổ tờ đơn
            don.TrangThai = TrangThaiDonDangKy.DaHoanThanh;
            don.TheTich = request.TheTich;

            // --- BẮT ĐẦU DÂY CHUYỀN TỰ ĐỘNG ---

            // Chặn ngay lập tức nếu Y tá đi lấy máu một người chưa điền Nhóm máu!
            if (don.TinhNguyenVien.NhomMau == null)
            {
                return BadRequest(new { success = false, message = "Người này chưa cập nhật Nhóm máu trong Hồ sơ! Hãy yêu cầu họ cập nhật trên Web trước." });
            }

            // 3. Tìm cái Kho Máu tương ứng với nhóm máu của người này
            var kho = await _context.KhoMaus.FirstOrDefaultAsync(k => k.NhomMau == don.TinhNguyenVien.NhomMau);

            // Nếu bệnh viện chưa từng có Kho cho nhóm máu này, Tự động xây một cái Kho mới luôn!
            if (kho == null)
            {
                kho = new KhoMau
                {
                    MaKho = "K_" + (int)don.TinhNguyenVien.NhomMau,
                    TenKho = "Kho máu " + don.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-"),
                    NhomMau = don.TinhNguyenVien.NhomMau,
                    SoLuongTon = 0,
                    NguongAnToan = 1000 // Gán mặc định 1 lít máu là ranh giới đỏ
                };
                _context.KhoMaus.Add(kho);
            }

            // 4. Bơm máu vừa lấy vào Kho
            kho.SoLuongTon += request.TheTich;

            // 5. Đóng gói 1 Bịch Máu (TuiMau) dán mã vạch cất vào CSDL
            var tuiMau = new HienMauNhanDao_DaNang.Models.Entities.TuiMau
            {
                MaTuiMau = "TM" + DateTime.Now.ToString("HHmmssfff"), // Sinh mã vạch tự động theo giờ
                MaDon = don.MaDon,
                MaKho = kho.MaKho,
                MaNhanVien = User.FindFirst("maTaiKhoan")?.Value, // Lưu tên Y tá thao tác để truy cứu trách nhiệm
                TheTich = request.TheTich,
                ThoiGianLayMau = DateTime.Now,
                TrangThai = TrangThaiTuiMau.DaLuuKho
            };
            _context.TuiMaus.Add(tuiMau);

            // LƯU TẤT CẢ 3 BẢNG (ĐƠN, KHO, TÚI) XUỐNG CSDL CÙNG 1 LÚC!
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"Lấy {request.TheTich}ml thành công! Đã tự đóng gói và nhập vào {kho.TenKho}." });
        }

        //API lấy chi tiết đơn hiến máu theo mã đơn
        [HttpGet("{maDon}")]
        public async Task<IActionResult> LayChiTietDon(string maDon)
        {
            //  Dùng include và theninclude để lấy thông tin từ các bảng liên kết 
            var don = await _context.DonDangKys
                .Include(d => d.TinhNguyenVien)
                .Include(d => d.ChienDich)
                .ThenInclude(c => c.DiaDiem) // lấy thông tin địa điểm của chiến dịch
                .FirstOrDefaultAsync(d => d.MaDon == maDon);

            if(don == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đơn đăng ký" });
            }
            return Ok(new { success = true, data = don });
        }

        // API hủy đơn hiến máu của TNV
        [HttpPut("{maDon}/huy")]
        public async Task<IActionResult> HuyDonDangKy(string maDon)
        {
            var don = await _context.DonDangKys.FindAsync(maDon);
                if(don == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy đơn đăng ký !" });
            }
                //ràng buộc bảo mật :đã hoàn thành hiến máu thì không cho huỷ
                if(don.TrangThai == TrangThaiDonDangKy.DaHoanThanh)
            {
                return BadRequest(new { success = false, message = "Đơn đăng ký đã hoàn thành hiến máu, không thể huỷ!" });
            }
            don.TrangThai = TrangThaiDonDangKy.DaTuChoi;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Huỷ đơn đăng ký hiến máu thành công!" });
        }
    }
}