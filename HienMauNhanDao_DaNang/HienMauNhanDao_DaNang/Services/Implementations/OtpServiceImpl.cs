using HienMauNhanDao_DaNang.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace HienMauNhanDao_DaNang.Services.Implementations
{
    public class OtpServiceImpl : IOtpService
    {
        private readonly IMemoryCache _cache;

        //cấu hình thời gian của mã OTP là 5 phút 
        private static readonly TimeSpan ExpireTime = TimeSpan.FromMinutes(5);

        //Inject IMemoryCache đưuojc cung cấp sẵn bởi ASP.NET Core
        public OtpServiceImpl(IMemoryCache cache)
        {
            _cache = cache;
        }

        public string GenerateOtp (string email)
        {
            //làm sạch email trước khi dùng làm key trong cache
            email = email.Trim().ToLower();

            //sinh số ngẫu nhiên từ 100000 đến 999999 (6 chữu số )
            var random = new Random();
            var otp = random.Next(100000, 999999).ToString();

            //lưu cặp Key-Value (Email-Otp) vào cache kèm theo thười gian hết hạn là 5 phút 
            _cache.Set(email, otp, ExpireTime);

            return otp;


        }

        public bool ValidateOtp(string email, string otp)
        {
            email = email.Trim().ToLower();
            otp = otp.Trim();

            //lấy mã OTP Trong cache tương ứng với mail
            if(_cache.TryGetValue(email, out string? cacheOtp))
            {
                //so sánh mã người dùng nhập và mã trong cache
                if(cacheOtp == otp)
                {
                    //nếu khớp , xoá ngay mã otp trong cache để tránh việc tái xử dụng 
                    _cache.Remove(email);
                    
                    // Lưu cờ xác thực thành công vào bộ nhớ cache trong vòng 5 phút
                    _cache.Set($"verified_{email}", true, TimeSpan.FromMinutes(5));
                    return true;
                }
            }

            //trả về false nếu không tìm thấy email trong cache , hoặc mã nhập vào không chíng xác , mã hết hạn 
            return false;
        }

        public bool IsEmailVerified(string email)
        {
            email = email.Trim().ToLower();
            return _cache.TryGetValue($"verified_{email}", out bool verified) && verified;
        }

        public void ClearVerification(string email)
        {
            email = email.Trim().ToLower();
            _cache.Remove($"verified_{email}");
        }
    }
}
