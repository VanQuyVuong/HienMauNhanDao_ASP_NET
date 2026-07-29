using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HienMauNhanDao_DaNang.Data;
using HienMauNhanDao_DaNang.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HienMauNhanDao_DaNang.Services.Implementations
{
    /// <summary>
    /// Background Service tự động kiểm tra và đóng các Chiến dịch hiến máu Khẩn cấp khi hết hạn (sau 12 giờ hoặc khi thoiGianKT trải qua)
    /// </summary>
    public class EmergencyCampaignHostedService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EmergencyCampaignHostedService> _logger;

        public EmergencyCampaignHostedService(
            IServiceProvider serviceProvider,
            ILogger<EmergencyCampaignHostedService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Emergency Campaign Hosted Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        var now = DateTime.Now;

                        // Tìm các chiến dịch khẩn cấp đang diễn ra hoặc chưa kết thúc
                        var activeEmergencyCampaigns = await context.ChienDichHienMaus
                            .Where(c => c.MucDoUuTien == MucDoUuTienChienDich.KhanCap &&
                                        c.TrangThai != TrangThaiChienDich.DaKetThuc &&
                                        c.TrangThai != TrangThaiChienDich.DaHuy)
                            .ToListAsync(stoppingToken);

                        bool updatedAny = false;
                        foreach (var campaign in activeEmergencyCampaigns)
                        {
                            // Tự động đóng nếu thời gian hiện tại vượt quá ThoiGianKT hoặc trôi qua 12 tiếng từ ThoiGianBD
                            if (now >= campaign.ThoiGianKT || (now - campaign.ThoiGianBD).TotalHours >= 12)
                            {
                                campaign.TrangThai = TrangThaiChienDich.DaKetThuc;
                                updatedAny = true;
                                _logger.LogInformation($"Tự động đóng chiến dịch khẩn cấp {campaign.MaChienDich} - {campaign.TenChienDich} do hết thời gian (12 giờ / Hạn KT).");
                            }
                        }

                        if (updatedAny)
                        {
                            await context.SaveChangesAsync(stoppingToken);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi chạy EmergencyCampaignHostedService kiểm tra chiến dịch khẩn cấp.");
                }

                // Chạy kiểm tra định kỳ mỗi 60 giây
                await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
            }

            _logger.LogInformation("Emergency Campaign Hosted Service is stopping.");
        }
    }
}
