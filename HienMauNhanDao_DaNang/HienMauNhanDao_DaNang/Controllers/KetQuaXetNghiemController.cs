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
    [Authorize(Roles ="BS/ADD")]
    public class KetQuaXetNghiemController : ControllerBase
    {
        private readonly AppDbContext _context;
        public KetQuaXetNghiemController(AppDbContext context)
        {
            _context = context;
        }

        //API 1 .lấy danh sách kết quả xét nghiệm(bao gồm cả túi máu chờ sét nghiệm 
        [HttpGet("danh-sach")]
        public async Task<IActionResult> GetDanhSachXetNghiem()
        {
            // A. Lấy danh sách xét nghiệm đã lưu thực tế trong CSDL
            var daCoKQ = await _context.KetQuaXetNghiems
                .Include(k => k.TuiMau)
                .ThenInclude(t => t.DonDangKy)
                .ThenInclude(d => d.TinhNguyenVien)
                .Include(k => k.TuiMau)
                .ThenInclude(t => t.DonDangKy)
                .ThenInclude(d => d.ChienDich)
                .OrderByDescending(k => k.MaKQ)
                .ToListAsync();

            // B. Lấy các túi máu "Chưa xử lý" nhưng chưa hề có dòng nào trong bảng KETQUAXETNGHIEM
            var tuiChuaTest = await _context.TuiMaus
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.TinhNguyenVien)
                .Include(t => t.DonDangKy)
                    .ThenInclude(d => d.ChienDich)
                .Where(t => t.TrangThai == TrangThaiTuiMau.ChuaXuLy)
                .Where(t => !_context.KetQuaXetNghiems.Any(k => k.MaTuiMau == t.MaTuiMau))
                .ToListAsync();

            var ketQuaTraVe = new List<object>();


            //gom nhóm các ca đã có kết quả xét nghiệm
            foreach(var item in daCoKQ)
            {
                ketQuaTraVe.Add(new
                {
                    maKQ = item.MaKQ,
                    maTuiMau = item.MaTuiMau,
                    maNhanVien = item.MaNhanVien,
                    nhomMau = item.NhomMau != null > item.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ",
                    soLanXetNghiem = item.SoLanXetNghiem ?? 1,
                    ketQua = item.KetQua,
                    moTa = item.MoTa,
                    tenTinhNguyenVien = item.TuiMau?.DonDangKy?.TinhNguyenVien?.HoTen ?? "Ẩn danh",
                    tenChienDich = item.TuiMau?.DonDangKy?.ChienDich?.TenChienDich ?? "N/A"

                });

            }

            //Gom nhóm các túi máu mới đang chờ xét nghiệm ( tạo bản ghi ảo cho fe hiển thị)
            foreach(var item in tuiChuaTest)
            {
                ketQuaTraVe.Add(new
                {
                    maKQ = "CHUA_TEST_" + item.MaTuiMau,
                    maTuiMau = item.MaTuiMau,
                    maNhanVien = "",
                    nhomMau = item.DonDangKy?.TinhNguyenVien?.NhomMau != null ? item.DonDangKy.TinhNguyenVien.NhomMau.ToString().Replace("_positive", "+").Replace("_negative", "-") : "Chưa rõ",
                    soLanXetNghiem = 1,
                    ketQua = (bool?)null,
                    moTa = "Chờ xét nghiệm lần đầu ",
                    tenTinhNguyenVien = item.DonDangKy?.TinhNguyenVien?.HoTen ?? "Ẩn danh",
                    tenChienDich = item.DonDangKy?.ChienDich?.TenChienDich ?? "N/A",
                });
            }
            return Ok(ketQuaTraVe);
        }
        //API 2. LẤY SỐ LIỆU THỐNG KÊ XÉT NGHIỆM PHỤC VỤ CHO DASHBOARD
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


        //API 3. lưu hoặc cập nhật kết quả  xét nghiệm túi máu 
        [HttpPost("luu")]
        public async Task<IActionResult> LuuXetNghiem([FromBody]  LuuXetNghiemRequets requets)
        {
            //1.tìm túi máu cần xét nghiêmh xem có thực sự tồn tạo hay không 

            var TuiMau = await _context.TuiMaus.FirstOrDefaultAsync(t => t.MaTuiMau == requets.MaTuiMau);
            if(TuiMau == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy túi máu cần xét nghiệm" });
            }

            //2.tìm xem đã có bản ghi xét nghiệm nào cho túi máu này chưa 
            var xetNghiem = await _context.KetQuaXetNghiems.FirstOrDefaultAsync(k => k.MaTuiMau == requets.MaTuiMau);

            //Dịch chuỗi nhóm máu từ FrontEnd sáng enum 
            var parsedNhomMau = ParseNhomMau(request.NhomMau);

            if(xetNghiem == null)
            {
                //A. nêys chưa có kết quả xét nghiệm cũ -> tạo mới hoàn toàn 

                var maxKQ = await _context.KetQuaXetNghiems.OrderByDescending(k => k.MaKQ).FirstOrDefaultAsync();
                int nextKQId = 1;
                if (maxKQ != null && maxKQ.MaKQ.StartsWith("XN"))
                {
                    int.TryParse(maxKQ.MaKQ.Substring(2), out int currentKQId);
                    nextKQId = currentKQId + 1;
                }
                string newMaKQ = "XN" + nextKQId.ToString("D5");
                xetNghiem = new KetQuaXetNghiem
                {
                    MaKQ = newMaKQ,
                    MaTuiMau = request.MaTuiMau,
                    MaNhanVien = request.MaNhanVien,
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
                xetNghiem.MaNhanVien = request.MaNhanVien;
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
            await _context.SaveChangesAsync();
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