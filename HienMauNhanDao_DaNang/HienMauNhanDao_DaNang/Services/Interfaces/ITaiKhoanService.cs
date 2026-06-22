using HienMauNhanDao_DaNang.Models.DTOs.Requests;
using HienMauNhanDao_DaNang.Models.DTOs.Responses;

namespace HienMauNhanDao_DaNang.Services.Interfaces
{
    public interface ITaiKhoanService
    {
        // Task<T> = hàm bất đồng bộ (async), trả về T
        //=> khi hàm làm việc với database (chờ MySQL trả lời) → dùng async/await để không bị block.

        // Đăng nhập → trả về LoginResponse chứa token
        Task<LoginResponse> LoginAsync(LoginRequest request);
        // Đăng ký → không trả về gì
        Task RegisterAsync(RegisterRequest request);
        // Đăng xuất → vô hiệu hóa token
        Task LogoutAsync(string token);
    }
}
