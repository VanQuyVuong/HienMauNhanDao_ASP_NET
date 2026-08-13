using HienMauNhanDao_DaNang.Services.Interfaces;

namespace HienMauNhanDao_DaNang.Services
{
    public class EmailBackgroundWorker : BackgroundService
    {
        private readonly EmailQueueService _emailQueue;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EmailBackgroundWorker> _logger;

        public EmailBackgroundWorker(
            EmailQueueService emailQueue,
            IServiceProvider serviceProvider,
            ILogger<EmailBackgroundWorker> logger)
        {
            _emailQueue = emailQueue;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Email Background Worker is starting.");

            await foreach (var message in _emailQueue.ReadAllAsync(stoppingToken))
            {
                try
                {
                    // Create a new scope to resolve scoped services (like IEmailService)
                    using var scope = _serviceProvider.CreateScope();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                    _logger.LogInformation("Sending queued email to {Email}", message.ToEmail);
                    await emailService.SendOtpEmailAsync(message.ToEmail, message.Otp);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing email sending for {Email}.", message.ToEmail);
                }
            }
        }

        public override async Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Email Background Worker is stopping.");
            await base.StopAsync(stoppingToken);
        }
    }
}
