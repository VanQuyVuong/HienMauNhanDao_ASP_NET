using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Ocsp;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "NVYT, NVYT_XN, NVYT-XN, BS, QLK, AD")]
    public class KetQuaXetNghiemController : ControllerBase
    {
        private readonly AppDbContext _context;
        public KetQuaXetNghiemController(AppDbContext context)
        {
            _context = context;
        }

        //API 1. Lấy danh sách tất cả túi máu cần xét nghiệm / đã xét nghiệm chờ nhập kho / có yêu cầu Re-test từ QLK
        [HttpGet]
        [HttpGet("danh-sach")]
        public async Task<IActionResult> GetDanhSachXetNghiem()
        {
            // Chỉ lấy túi máu có trạng thái Chưa xử lý (Chờ XN / Re-test) hoặc Đã xét nghiệm (Chờ nhập kho)
            var activeTuiMaus = await _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.ChienDich)
                .Where(t => t.TrangThai == TrangThaiTuiMau.ChuaXuLy || t.TrangThai == TrangThaiTuiMau.DaXetNghiem)
                .OrderByDescending(t => t.ThoiGianLayMau)
                .ThenByDescending(t => t.MaTuiMau)
                .ToListAsync();


            var allKqDict = await _context.KetQuaXetNghiems
                .ToDictionaryAsync(k => k.MaTuiMau, k => k);

            var ketQuaTraVe = new List<object>();

            foreach (var item in activeTuiMaus)
            {
                allKqDict.TryGetValue(item.MaTuiMau, out var kqExist);

                bool isReTest = false;
                string moTa = "Chờ xét nghiệm lần đầu";
                string trangThaiText = "Chờ xét nghiệm";
                bool? ketQuaVal = null;
                int soLanXn = 1;
                string maKQ = "CHUA_TEST_" + item.MaTuiMau;
                string maNV = "";

                if (kqExist != null)
                {
                    maKQ = kqExist.MaKQ;
                    maNV = kqExist.MaNhanVien ?? "";
                    soLanXn = kqExist.SoLanXetNghiem ?? 1;
                    ketQuaVal = kqExist.KetQua;
                    
                    bool isReTestMoTa = (kqExist.MoTa != null) && 
                        (kqExist.MoTa.ToLower().Contains("re-test") || kqExist.MoTa.ToLower().Contains("kiểm tra lại"));

                    if (item.TrangThai == TrangThaiTuiMau.ChuaXuLy || isReTestMoTa)
                    {
                        isReTest = true;
                        soLanXn = Math.Max(2, soLanXn + 1);
                        trangThaiText = "🚨 Đang chờ kiểm tra lại";
                        moTa = string.IsNullOrEmpty(kqExist.MoTa) ? "Quản lý kho yêu cầu kiểm tra lại" : kqExist.MoTa;
                        ketQuaVal = null; // Reset để NVXN nhập lại kết quả mới
                    }
                    else if (kqExist.KetQua == true)
                    {
                        trangThaiText = "⌛ Chờ nhập kho";
                        moTa = string.IsNullOrEmpty(kqExist.MoTa) ? "Đạt tiêu chuẩn vi sinh (Đang chờ QLK duyệt nhập kho)" : kqExist.MoTa;
                    }
                    else if (kqExist.KetQua == false)
                    {
                        trangThaiText = "❌ Không đạt (Chờ xử lý hủy)";
                        moTa = string.IsNullOrEmpty(kqExist.MoTa) ? "Không đạt tiêu chuẩn vi sinh (Chờ QLK duyệt hủy)" : kqExist.MoTa;
                    }
                }


                string nhomMauStr = item.DonDangKy?.TinhNguyenVien?.NhomMau != null 
                    ? item.DonDangKy.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") 
                    : "Chưa rõ";

                ketQuaTraVe.Add(new
                {
                    maKQ = maKQ,
                    maTuiMau = item.MaTuiMau,
                    maNhanVien = maNV,
                    nhomMau = nhomMauStr,
                    soLanXetNghiem = soLanXn,
                    ketQua = ketQuaVal,
                    isReTest = isReTest,
                    trangThaiText = trangThaiText,
                    moTa = moTa,
                    theTich = item.TheTich ?? 350,
                    thoiGianLayMau = item.ThoiGianLayMau,
                    tenTinhNguyenVien = item.DonDangKy?.TinhNguyenVien?.HoTen ?? "Ẩn danh",
                    tenChienDich = item.DonDangKy?.ChienDich?.TenChienDich ?? "N/A"
                });
            }
            return Ok(ketQuaTraVe);
        }

        //API 2. LẤY SỐ LIỆU THỐNG KÊ XÉT NGHIỆM PHỤC VỤ CHO DASHBOARD
        [HttpGet("stats")]
        [HttpGet("thong-ke")]
        public async Task<IActionResult> GetThongKe()
        {
            var tongSo = await _context.KetQuaXetNghiems.CountAsync();
            var dat = await _context.KetQuaXetNghiems.CountAsync(k => k.KetQua == true);
            var khongDat = await _context.KetQuaXetNghiems.CountAsync(k => k.KetQua == false);

            return Ok(new
            {
                tongSo,
                datYeuCau = dat,
                khongDat
            });
        }


        //API 3. Lưu hoặc cập nhật kết quả xét nghiệm túi máu 
        [HttpPost]
        [HttpPost("luu")]
        public async Task<IActionResult> LuuXetNghiem([FromBody] LuuXetNghiemRequest request)
        {
            // 1. Tìm túi máu cần xét nghiệm xem có tồn tại hay không
            var tuiMau = await _context.TuiMaus.FirstOrDefaultAsync(t => t.MaTuiMau == request.MaTuiMau);
            if (tuiMau == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy túi máu cần xét nghiệm" });
            }

            // Kiểm tra và lấy mã nhân viên hợp lệ (tránh lỗi khóa ngoại Foreign Key với bảng NHANVIEN)
            var validMaNV = request.MaNhanVien;
            if (string.IsNullOrEmpty(validMaNV) || !await _context.NhanViens.AnyAsync(n => n.MaNhanVien == validMaNV))
            {
                var firstNv = await _context.NhanViens.FirstOrDefaultAsync();
                validMaNV = firstNv?.MaNhanVien ?? "NV00007";
            }

            // 2. Tìm xem đã có bản ghi xét nghiệm nào cho túi máu này chưa 
            var xetNghiem = await _context.KetQuaXetNghiems.FirstOrDefaultAsync(k => k.MaTuiMau == request.MaTuiMau);

            // Dịch chuỗi nhóm máu từ FrontEnd sang enum 
            var parsedNhomMau = ParseNhomMau(request.NhomMau);

            if (xetNghiem == null)
            {
                // A. Nếu chưa có kết quả xét nghiệm cũ -> Tạo mới hoàn toàn (Tìm max ID số chính xác)
                var allKqIds = await _context.KetQuaXetNghiems.Select(k => k.MaKQ).ToListAsync();
                int maxNum = 0;
                foreach (var id in allKqIds)
                {
                    if (!string.IsNullOrEmpty(id) && id.StartsWith("XN"))
                    {
                        if (int.TryParse(id.Substring(2), out int num) && num > maxNum)
                        {
                            maxNum = num;
                        }
                    }
                }
                string newMaKQ = "XN" + (maxNum + 1).ToString("D5");

                xetNghiem = new KetQuaXetNghiem
                {
                    MaKQ = newMaKQ,
                    MaTuiMau = request.MaTuiMau,
                    MaNhanVien = validMaNV,
                    NhomMau = parsedNhomMau,
                    SoLanXetNghiem = request.SoLanXetNghiem,
                    KetQua = request.KetQua,
                    MoTa = request.MoTa
                };
                _context.KetQuaXetNghiems.Add(xetNghiem);
            }
            else
            {
                // B. Nếu đã tồn tại kết quả xét nghiệm ➔ Cập nhật các chỉ số mới
                xetNghiem.NhomMau = parsedNhomMau;
                xetNghiem.SoLanXetNghiem = request.SoLanXetNghiem;
                xetNghiem.KetQua = request.KetQua;
                xetNghiem.MoTa = request.MoTa;
                xetNghiem.MaNhanVien = validMaNV;
            }

            // 3. Xử lý cập nhật trạng thái túi máu tương ứng
            if (request.KetQua)
            {
                // Trường hợp Đạt (true): Đổi trạng thái thành "Đã xét nghiệm" (DaXetNghiem) để chờ Thủ kho duyệt nhập
                tuiMau.TrangThai = TrangThaiTuiMau.DaXetNghiem;
                if (parsedNhomMau != null)
                {
                    // Tự động tìm ngăn kho tương thích với nhóm máu vừa xác nhận
                    var khoKhopNhomMau = await _context.KhoMaus.FirstOrDefaultAsync(k => k.NhomMau == parsedNhomMau);
                    if (khoKhopNhomMau != null)
                    {
                        tuiMau.MaKho = khoKhopNhomMau.MaKho;
                    }
                    // Đồng bộ nhóm máu chính xác này vào hồ sơ của Tình nguyện viên hiến máu
                    var don = await _context.DonDangKys
                        .Include(d => d.TinhNguyenVien)
                        .FirstOrDefaultAsync(d => d.MaDon == tuiMau.MaDon);
                    if (don != null && don.TinhNguyenVien != null)
                    {
                        don.TinhNguyenVien.NhomMau = parsedNhomMau;
                    }
                }
            }
            else
            {
                // Trường hợp Không đạt (false) (máu nhiễm bệnh): Đổi trạng thái sang "Đã hủy" (DaHuy), rút ra khỏi ngăn kho
                tuiMau.TrangThai = TrangThaiTuiMau.DaHuy;
                tuiMau.MaKho = null;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Fallback nếu MaKho dính ràng buộc ngoại
                tuiMau.MaKho = null;
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true, message = "Cập nhật kết quả xét nghiệm thành công." });
        }
        // API 4: Xóa kết quả xét nghiệm (Để phục vụ việc sửa đổi hoặc xét nghiệm lại)
        // DELETE /api/ketquaxetnghiem/xoa/{id}
        [HttpDelete("xoa/{id}")]
        public async Task<IActionResult> XoaXetNghiem(string id)
        {
            var item = await _context.KetQuaXetNghiems.FirstOrDefaultAsync(k => k.MaKQ == id);
            if (item == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy ca xét nghiệm này." });
            }
            // Khôi phục trạng thái túi máu về "Chưa xử lý" để bác sĩ xét nghiệm lại từ đầu
            var tui = await _context.TuiMaus.FirstOrDefaultAsync(t => t.MaTuiMau == item.MaTuiMau);
            if (tui != null)
            {
                tui.TrangThai = TrangThaiTuiMau.ChuaXuLy;
                tui.MaKho = null;
            }
            _context.KetQuaXetNghiems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Đã xóa kết quả xét nghiệm và khôi phục trạng thái túi máu." });
        }
        // Hàm Helper: Quy đổi nhóm máu dạng chuỗi (React gửi lên) thành Enum của C#
        private NhomMau? ParseNhomMau(string input)
        {
            if (string.IsNullOrEmpty(input)) return null;
            string clean = input.Replace("+", "_positive").Replace("-", "_negative");
            if (Enum.TryParse<NhomMau>(clean, out var result))
            {
                return result;
            }
            return null;
        }
    }
    // Lớp DTO nhận gói dữ liệu từ Frontend gửi lên trong Body
    public class LuuXetNghiemRequest
    {
        public string MaTuiMau { get; set; } = string.Empty;
        public string NhomMau { get; set; } = string.Empty;
        public int SoLanXetNghiem { get; set; } = 1;
        public bool KetQua { get; set; }
        public string? MoTa { get; set; }
        public string MaNhanVien { get; set; } = string.Empty;
    }
}