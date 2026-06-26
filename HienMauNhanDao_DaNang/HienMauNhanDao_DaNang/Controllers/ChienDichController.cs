using Microsoft.AspNetCore.Mvc;
using HienMauNhanDao_DaNang.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace HienMauNhanDao_DaNang.Controllers
{
    // Cấu hình đường dẫn chung cho toàn bộ file này
    // [controller] sẽ tự động biến thành chữ "ChienDich" (bỏ chữ Controller đi)

    [Route("api/[controller]")]
    [ApiController]
    public class ChienDichController : Controller
    {
        public readonly AppDbContext _context;


        // "Xin" (Inject) cái AppDbContext từ hệ thống để có công cụ nói chuyện với Database
        public ChienDichController(AppDbContext context)
        {
            _context = context;
        }


        // Tạo API (GET) để lấy toàn bộ danh sách chiến dịch
        // Khi React gọi GET: https://localhost:7004/api/chiendich nó sẽ chạy vào hàm này

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {

            // Bảo Entity Framework chạy xuống MySQL, mở bảng CHIENDICHHIENMAU và lấy hết lên

            var danhSach = await _context.ChienDichHienMaus.ToListAsync();

            // Trả về cho React dưới định dạng JSON

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách chiến dịch thành cồn",
                data = danhSach
            });
        }
    }
}
