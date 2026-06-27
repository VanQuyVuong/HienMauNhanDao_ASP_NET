using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Models.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HienMauNhanDao_DaNang.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DonDangKyController : ControllerBase
    {

        private readonly AppDbContext _context;

        public DonDangKyController(AppDbContext context)
        {
            _context = context;
        }

        //Tạo 1 class nhỏ (DTO) để hứng dữ liệu từ React gửi lên 
        public class DangKyRequest
        {
            public string MaChienDich { get; set; }
        }


        //API nhận yêu cầu đăng ký
        [HttpPost]
        public async Task<IActionResult> DangKyHienMau([FromBody] DangKyRequest request)
        {
            //1.KIỂM TRA XEM CHIẾN DỊCH NÀY CÓ THÂT KHÔNG 
            var chienDich = await _context.ChienDichHienMaus.FindAsync(request.MaChienDich);
            if (chienDich == null)
            {
                return NotFound(new { success = false, message = "Chiến dịch không tồn tại" });
            }

            //2.tự động sinh mã đơn dựa vào Giờ_Phút_Giây để KHông bị trùng lăoj
            string maDonMoi = "Don" + DateTime.Now.ToString("HHmmss");

            //3.tạo tờ đơn đang ký mới 

            var donMoi = new DonDangKy
            {
                MaDon = maDonMoi,
                MaChienDich=request.MaChienDich,
                ThoiGianDangKy=DateTime.Now,
                TrangThai=TrangThaiDonDangKy.ChoDuyet,// Trạng thái mặc định: Chờ nhân viên y tế duyệt
                TheTich= 250 // Mặc định đăng ký hiến 250ml
            };

            //4.Lưu vào Database
            _context.DonDangKys.Add(donMoi);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Bạn đã đăng ký hiến máu thành công " });

        }
            

        }

    
}
