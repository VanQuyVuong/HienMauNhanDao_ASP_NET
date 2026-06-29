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

            var chienDich = await _context.ChienDichHienMaus.FindAsync(request.MaChienDich);
            if (chienDich == null) return NotFound(new { success = false, message = "Chiến dịch không tồn tại!" });

            var donMoi = new DonDangKy
            {
                MaDon = "DON" + DateTime.Now.ToString("HHmmss"),
                MaChienDich = request.MaChienDich,
                ThoiGianDangKy = DateTime.Now,
                TrangThai = TrangThaiDonDangKy.ChoDuyet,
                TheTich = 250,
                MaTNV = tnv.maTNV // Đã sửa maTNV
            };

            _context.DonDangKys.Add(donMoi);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đăng ký hiến máu thành công!" });
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


        //API 3 :Dành cho nhân viên y tế xem toàn bộ danh sách đơn 
        [HttpGet("tat-ca")]
        [Authorize(Roles ="NVYT, AD")]  //đây là ổ  khóa kép: Vừa phải có Thẻ, vừa phải có quyền NVYT hoặc Admin
        public async Task<IActionResult> LayTatCaDon()
        {
            //Lấy tất cả mọi tờ đơn trong cơ sở dữ liệu 
            var danhSach = await _context.DonDangKys
                .Include(d => d.ChienDich) //LẤY TÊN CHIẾN DỊCH
                .Include(D => D.TinhNguyenVien)   //lấy thông tin Tình nguyện viên nộp đơn
                .OrderByDescending(d => d.ThoiGianDangKy)
                .ToListAsync();

            return Ok(new { success = true, data = danhSach });

        }


        //class này để hứng các trạng thái phê duyệt và từ chối từ React gửi lên 
        public class DuyetDonRequest()
        {
            public TrangThaiDonDangKy TrangThaiMoi { set; get; }
        }


        //API 4 :DÙNG CHO NHÂN VIÊN Y TẾ THAY ĐỔI TRẠNG THÁI ĐƠN 
        [HttpPut("{maDon}/duyet")]
        [Authorize(Roles ="NVYT, AD")]

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

        //API 5. Dành cho nhân viên y tế xác nhận đã lấy máu xong 
        [HttpPut("{maDon}/xac_nhan")]
        [Authorize(Roles ="NVYT,AD")]
        public async Task<IActionResult> XacNhanHienMau(string maDon, [FromBody] XacNhanHienMauRequest request)
        {
            var don = await _context.DonDangKys.FindAsync();
            if (don == null) return NotFound(new { success = false, message = "Không tìm thấy đơn !" });


            //Kiẻm tra bảo mật : chỉ những đơn nào ở trạng thái đã duyệt thì mới cho phép lấy máu 

            if(don.TrangThai != TrangThaiDonDangKy.DaDuyet)
            {
                return BadRequest(new { success = false, message = " Đơn chưa được duyêt hoặc đã xử lý, không thể lấy máu !" });
            }

            //1. chuyển trạng thái sang Đá hiến máu 
            don.TrangThai = TrangThaiDonDangKy.DaHoanThanh;

            //2. ghi nhận thể tích ml máu thu được thưucj tế 
            don.TheTich = request.TheTich;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"Xác nhận thu thập {request.TheTich}ml máu thành công" });
        }
    }
}
