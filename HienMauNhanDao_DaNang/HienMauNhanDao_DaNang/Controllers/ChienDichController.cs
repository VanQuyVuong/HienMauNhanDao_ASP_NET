using Microsoft.AspNetCore.Mvc;
using HienMauNhanDao_DaNang.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Data;
using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Models.Enums;

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

                       var danhSach = await _context.ChienDichHienMaus
                .Include(c => c.DiaDiem)
                .Include(c => c.NhanVienPhuTrach) // <-- Dùng NhanVienPhuTrach cho đúng tên thuộc tính trong thực thể
                .ToListAsync();

            // Trả về cho React dưới định dạng JSON

            return Ok(new
            {
                success = true,
                message = "Lấy danh sách chiến dịch thành công",
                data = danhSach
            });
        }

        //Tạo Api lấy chi tiết chiến dịch theo mã . 
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByID(string id)
        {
            // để lôi luôn cái tên Bệnh Viện và Địa chỉ chi tiết ra cho bạn, không cần viết SQL JOIN phức tạp!
            var chienDich = await _context.ChienDichHienMaus
                .Include(c => c.DiaDiem)
            // Lệnh Include: Ma thuật của EF Core! Nó tự động chạy lệnh JOIN sang bảng DiaDiem 
                .FirstOrDefaultAsync(c => c.MaChienDich == id);
            // Lệnh FirstOrDefaultAsync: Tìm chiến dịch đầu tiên có MaChienDich khớp với id
            if (chienDich == null)
            {
                return NotFound(new {success=false, mesage= "Không tìm thấy chiến dịch này "});
            }
            return Ok(new { success = true, data = chienDich });
        }


        //class hứng dữ liệu từ form react 
        public class TaoChienDichRequest
        {
            public string TenChienDich { set; get; } = string.Empty;
            public DateTime ThoiGianBD { set; get; }
            public DateTime ThoiGianKT { set; get; }
            public int SoLuongDuKien { set; get; }
            public string? MaDiaDiem { set; get; }
            public string? ImageUrl { set; get; }
        }


        // TẠO API TẠO CHIẾN DỊCH MỚI (CHỈ NVYT VÀ ADMIN ĐƯỢC PHÉP DÙNG )
        [HttpPost]
        [Authorize(Roles ="NVYT,AD")]
        public async Task<IActionResult> TaoMoiChienDich([FromBody] TaoChienDichRequest request)
        {
            try
            {
                //1.trich xuat ma ngừuoi tạo để biết nvyt nào tạo 
                var maTaiKhoan = User.FindFirst("maTaiKhoan")?.Value;
                var nhanVien = await _context.NhanViens.FirstOrDefaultAsync(n => n.MaTaiKhoan == maTaiKhoan);

                //2.sINH MÃ CHIẾN DỊCH NGẪU NHIÊN 
                string maCD = "CD" + DateTime.Now.ToString("HHmmss");

                //3.đóng gói dữ liệu 
                var cd = new ChienDichHienMau
                {
                    MaChienDich = maCD,
                    TenChienDich = request.TenChienDich,
                    ThoiGianBD = request.ThoiGianBD,
                    ThoiGianKT = request.ThoiGianKT,
                    SoLuongDuKien = request.SoLuongDuKien,
                    MaDiaDiem = request.MaDiaDiem,
                    ImageUrl = request.ImageUrl,
                    TrangThai = TrangThaiChienDich.ChuaBatDau,
                    MaNhanVien = nhanVien?.MaNhanVien
                };

                //4.lưu vào csdl
                _context.ChienDichHienMaus.Add(cd);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Tao chien dich moi thanh cong", data = cd });
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new { success = false, message = "Lỗi khi tạo chiến dịch: " + msg });
            }
        }

        // Class này để hứng dữ liệu cập nhật từ React gửi lên
        public class CapNhatChienDichRequest
        {
            public string TenChienDich { get; set; } = string.Empty;
            public DateTime ThoiGianBD { get; set; }
            public DateTime ThoiGianKT { get; set; }
            public int SoLuongDuKien { get; set; }
            public string? MaDiaDiem { get; set; }
            public string? ImageUrl { get; set; }
            public TrangThaiChienDich TrangThai { get; set; }
        }

        // api cập nhật chiến dịch
        [HttpPut("{id}")]
        [Authorize(Roles = "NVYT,AD")]
        public async Task<IActionResult> CapNhatChienDich(string id, [FromBody] CapNhatChienDichRequest request)
        {
            try
            {
                //1. tìm chiến dịch trong csdl theo id truyền từ đường dẫn URL
                var cd = await _context.ChienDichHienMaus.FindAsync(id);
                if (cd == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy chiến dịch này!" });
                }

                //2. gán dữ liệu mới nhận từ react vào thực tế chiến dịch
                cd.TenChienDich = request.TenChienDich;
                cd.ThoiGianBD = request.ThoiGianBD;
                cd.ThoiGianKT = request.ThoiGianKT;
                cd.SoLuongDuKien = request.SoLuongDuKien;
                cd.MaDiaDiem = request.MaDiaDiem;
                cd.ImageUrl = request.ImageUrl;
                cd.TrangThai = request.TrangThai;

                //3. LƯU TẤT CẢ THAY ĐỔI XUỐNG CSDL MYSQL
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Cập nhật chiến dịch thành công!", data = cd });
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new { success = false, message = "Lỗi khi cập nhật chiến dịch: " + msg });
            }
        }

        // api xóa chiến dịch
        [HttpDelete("{id}")]
        [Authorize(Roles = "AD")]
        public async Task<IActionResult> XoaChienDich(string id)
        {
            var cd = await _context.ChienDichHienMaus.FindAsync(id); // Đã thêm id vào đây
            if (cd == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy chiến dịch!" });
            }

            // Ràng buộc bảo mật: Nếu đã có đơn hiến máu đăng ký tham gia chiến dịch này thì cấm xóa
            var daCoDon = await _context.DonDangKys.AnyAsync(d => d.MaChienDich == id);
            if (daCoDon)
            {
                return BadRequest(new { success = false, message = "Không thể xóa chiến dịch đã có người đăng ký hiến máu!" });
            }

            _context.ChienDichHienMaus.Remove(cd);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Xóa chiến dịch thành công!" });
        }
    }
}
