using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.DTOs.Requests;
using HienMauNhanDao_DaNang.Models.DTOs.Responses;
using HienMauNhanDao_DaNang.Models.Entities;
using HienMauNhanDao_DaNang.Security;
using HienMauNhanDao_DaNang.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HienMauNhanDao_DaNang.Services.Implementations
{
    public class TaiKhoanServiceImpl:ITaiKhoanService
    {

        private readonly AppDbContext _db;
        private readonly JwtHelper _jwtHelper;


        public TaiKhoanServiceImpl(AppDbContext db, JwtHelper jwtHelper)
        {
            _db = db;
            _jwtHelper = jwtHelper;
        }

        //Dăng nhập
        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            //Tìm tài khoản theo email
            var taiKhoan = await _db.TaiKhoans
                .Include(tk => tk.VaiTro)
                .FirstOrDefaultAsync(tk => tk.Email == request.Email);

            //kiểm tra email có tồn tại hay không 
            if (taiKhoan == null) 
                throw new UnauthorizedAccessException("Email hoac mat khau khong dung");

            //kiểm tra tài khoản có bị khoá không
            if (!taiKhoan.TrangThai)
                throw new UnauthorizedAccessException("Tai khoan da bi vo hieu hoa, Vui long lien he quan tri vien");

            //nếu mật khẩu chưa được hash thì hash lại 
            if (!taiKhoan.MatKhau.StartsWith("$2a$"))
            {
                taiKhoan.MatKhau = BCrypt.Net.BCrypt.HashPassword(taiKhoan.MatKhau);
                await _db.SaveChangesAsync();
            }

            //kiem tra mat khau
            // BCrypt.Verify = so sánh mật khẩu gõ vào với mật khẩu đã hash
            if (!BCrypt.Net.BCrypt.Verify(request.MatKhau, taiKhoan.MatKhau))
                throw new UnauthorizedAccessException("Email hoac mat khau khong dung");

            //lay ma nhan vien neu co 
            var nhanVien = await _db.NhanViens
                .FirstOrDefaultAsync(nv => nv.MaTaiKhoan == taiKhoan.MaTaiKhoan);

            //lay ma TNV neu co 
            var tinhNguyenVien = await _db.TinhNguyenViens
                .FirstOrDefaultAsync(tnv => tnv.MaTaiKhoan == taiKhoan.MaTaiKhoan);

            //tao JWT Token
            var maVaiTro = taiKhoan.VaiTro?.maVaiTro ?? "TNV";
            var accessToken = _jwtHelper.GenerateAccessToken(
                taiKhoan.Email, maVaiTro, taiKhoan.MaTaiKhoan);
            var refreshToken = _jwtHelper.GenerateRefreshToken(taiKhoan.Email);

            //tra ve response
            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                TokenType = "Bearer",
                ExpiresIn = 900,
                UserId = taiKhoan.MaTaiKhoan,
                Email = taiKhoan.Email,
                MaVaiTro = maVaiTro,
                MaNhanVien = nhanVien?.MaNhanVien,
                MaTNV = tinhNguyenVien?.maTNV
            };
        }

        //DANG KY
        public async Task RegisterAsync(RegisterRequest request)
        {
            var emailExist = await _db.TaiKhoans
                .AnyAsync(tk => tk.Email == request.Email);

            if (emailExist)
                throw new InvalidOperationException("Email nay da duoc su dung");
            //lay vai tro tnv mac dinh
            var vaiTro = await _db.VaiTros
                .FirstOrDefaultAsync(v => v.maVaiTro == "TNV");

            //NEU CHUA CO VAI TRO TNV THI TU TAO
            if (vaiTro == null)
            {
                vaiTro = new VaiTro
                {
                    maVaiTro = "TNV",
                    tenVaiTro = "Tinh Nguyen Vien"
                };
                _db.VaiTros.Add(vaiTro);
                await _db.SaveChangesAsync();
            }

            //tao ma tai khoan tu dong 
            var count = await _db.TaiKhoans.CountAsync();
            var maTaiKhoan = $"TK{(count + 1):D5}";
            //d5 la dinh dang 5 chu so 

            //tao tai khoan moi
            var taiKhoan = new TaiKhoan
            {
                MaTaiKhoan = maTaiKhoan,
                Email = request.Email,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhau),
                MaVaiTro = vaiTro.maVaiTro,
                TrangThai = true
            };

            _db.TaiKhoans.Add(taiKhoan);
            await _db.SaveChangesAsync();
        }


            //DANHG XUAT

            public async Task LogoutAsync(string token)
        {
            var invalidated = new InvalidatedToken
            {
                Id = token,
                ExpiryTime = DateTime.UtcNow.AddHours(2)
            };
            _db.InvalidatedTokens.Add(invalidated);
            await _db.SaveChangesAsync();

        }


    }
}
