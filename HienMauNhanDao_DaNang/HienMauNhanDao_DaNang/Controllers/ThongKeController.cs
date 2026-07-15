using HienMauNhanDao_DaNang.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HienMauNhanDao_DaNang.Models.Enums;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "NVYT,AD")]
    public class ThongKeController : ControllerBase
    {

        private readonly AppDbContext _context;

        public ThongKeController(AppDbContext context)
        {
            _context = context;
        }

        // API đếm số liệu thống kê chung
        [HttpGet("tong-quan")]
        public async Task<IActionResult> GetThongKeTongQuan()
        {
            // 1. Đếm tổng số lượng người dùng
            var tongNguoiDung = await _context.TinhNguyenViens.CountAsync();

            //2. Tổng số túi máu thực tế đang lưu kho 
            var tongTuiMau = await _context.TuiMaus.Where(t => t.TrangThai == TrangThaiTuiMau.DaLuuKho).CountAsync();
            //Lấy TẤT CẢ tờ đơn ra, nếu có ghi thể tích thì đem cộng lại hết
            // (ĐÂY LÀ ĐOẠN CODE CỐ TÌNH CHỨA BUG LOGIC)
            //3.tổng thể tích máu có trong kho
            var tongTheTichMau = await _context.DonDangKys.Where(d => d.TrangThai == TrangThaiDonDangKy.DaHoanThanh)
                .SumAsync(d => d.TheTich ?? 0);

            //4.cơ cấu tồn kho theo từng nhóm máu 
            var theoNhomMau = await _context.KhoMaus.Select(k => new
            {
                NhomMau = k.NhomMau != null ? k.NhomMau.ToString() : "Chưa rõ",
                SoluongTon = k.SoLuongTon ?? 0
            })
                .ToListAsync();

            //5.Thống kê thể tích máu thu nhận trong 6 tháng gần đây nhất 
            var sauThangTruoc = DateTime.Now.AddMonths(-6);
            var theoThangRaw = await _context.TuiMaus
                .Where(t => t.ThoiGianLayMau != null && t.ThoiGianLayMau >= sauThangTruoc)
                .ToListAsync();

            var theoThang = theoThangRaw
                .GroupBy(t => new { t.ThoiGianLayMau!.Value.Year, t.ThoiGianLayMau!.Value.Month })
                .Select(g => new
                {
                    Nam = g.Key.Year,
                    Thang = g.Key.Month,
                    TongTheTich = g.Sum(t => t.TheTich ?? 0)
                })
                .OrderBy(g => g.Nam)
                .ThenBy(g => g.Thang)
                .ToList();


            //// Trả về dữ liệu đóng gói
            //return Ok(new
            //{
            //    success = true,
            //    data = new
            //    {
            //        TongNguoiDung = tongNguoiDung,
            //        TongTheTichMau = tongTheTichMau,
            //        TongTuiMau= tongTuiMau,
            //        TheoNhomMau= theoNhomMau,
            //        TheoThang= theoThang
            //    }
            //});


            //6 . tổng số chiến dịch đã tổ chức 
            var tongChienDich = await _context.ChienDichHienMaus.CountAsync();

            //7. tỷ lệ khám sàng lọc lâm sáng đạt yêu cầu 
            var tongKham = await _context.KetQuaLamSangs.CountAsync();
            var daKham = await _context.KetQuaLamSangs.CountAsync(K => K.KetQua == true);
            var tyLeDatSangLoc = tongKham > 0 ? Math.Round((double)daKham / tongKham * 100, 1) : 0;

            //trả về dữ liệu đóng gói 
            return Ok(new
            {
                success = true,
                data = new
                {
                    TongNguoiDung = tongNguoiDung,
                    TongTheTichMau = tongTheTichMau,
                    TongTuiMau = tongTuiMau,
                    TheoNhomMau = theoNhomMau,
                    TheoThang = theoThang,
                    TongChienDich = tongChienDich,
                    TyLeDatSangLoc = tyLeDatSangLoc
                }

            });
        }
    }
}