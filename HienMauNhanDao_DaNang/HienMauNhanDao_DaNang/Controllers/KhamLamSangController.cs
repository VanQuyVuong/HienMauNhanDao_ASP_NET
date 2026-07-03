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
    [Authorize(Roles ="BS,AD")]
    public class KhamLamSangController : ControllerBase
    {

        private readonly AppDbContext _context;

        public KhamLamSangController (AppDbContext context)
        {
            _context = context;
        }


        //API 1 Lấy ra danh sách các đơn đang chờ khám sàn lọc 
        [HttpGet("cho-kham")]
        public async Task<IActionResult> GetDanhSachChoKham()
        {
            //loc ra nhung don Da duyet, khai bao y te (HoSoYTe != null ), va chua tung duoc kham lam san 
            var choKham = await _context.DonDangKys
                .Include(d => d.TinhNguyenVien)
                .Where(d => d.TrangThai == TrangThaiDonDangKy.DaDuyet)
                .Where(d => _context.HoSoSucKhoes.Any(h => h.MaDon == d.MaDon))
                .Where(d => !_context.KetQuaLamSangs.Any(k => k.MaDon == d.MaDon))
                .Select(d => new
                {
                    maDon = d.MaDon,
                    tenTinhNguyenVien = d.TinhNguyenVien != null ? d.TinhNguyenVien.HoTen : "An danh".
                    ngaySinh = d.TinhNguyenVien != null && d.TinhNguyenVien.ngaySinh != null ? d.TinhNguyenVien.ngaySinh.Value.ToString("dd/MM/yyyy") : "---",
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
                    tenTinhNguyenVien = k.DonDangKy != null && k.DonDangKy.TinhNguyenVien != null ? k.DonDangKy.TinhNguyenVien.hoTen : "Ẩn danh",
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


    }
}