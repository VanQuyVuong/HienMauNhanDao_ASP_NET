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
    }
}
