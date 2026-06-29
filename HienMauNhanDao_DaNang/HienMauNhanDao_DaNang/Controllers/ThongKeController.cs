using HienMauNhanDao_DaNang.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            // Đếm tổng số lượng người dùng
            var tongNguoiDung = await _context.TinhNguyenViens.CountAsync();
            // Lấy TẤT CẢ tờ đơn ra, nếu có ghi thể tích thì đem cộng lại hết
            // (ĐÂY LÀ ĐOẠN CODE CỐ TÌNH CHỨA BUG LOGIC)
            var tongTheTichMau = await _context.DonDangKys.SumAsync(d => d.TheTich ?? 0);
            // Trả về dữ liệu đóng gói
            return Ok(new
            {
                success = true,
                data = new
                {
                    TongNguoiDung = tongNguoiDung,
                    TongTheTichMau = tongTheTichMau
                }
            });
        }