namespace HienMauNhanDao_DaNang.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(string toEmail, string otp);
    }
}
