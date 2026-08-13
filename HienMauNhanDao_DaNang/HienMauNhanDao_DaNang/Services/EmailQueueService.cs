using System.Threading.Channels;

namespace HienMauNhanDao_DaNang.Services
{
    public class EmailMessage
    {
        public string ToEmail { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }

    public class EmailQueueService
    {
        private readonly Channel<EmailMessage> _queue;

        public EmailQueueService()
        {
            // Bounded channel to prevent unbounded memory growth
            var options = new BoundedChannelOptions(1000)
            {
                FullMode = BoundedChannelFullMode.Wait
            };
            _queue = Channel.CreateBounded<EmailMessage>(options);
        }

        public async ValueTask QueueEmailAsync(string email, string otp)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentNullException(nameof(email));

            var message = new EmailMessage
            {
                ToEmail = email,
                Otp = otp
            };

            await _queue.Writer.WriteAsync(message);
        }

        public IAsyncEnumerable<EmailMessage> ReadAllAsync(CancellationToken cancellationToken)
        {
            return _queue.Reader.ReadAllAsync(cancellationToken);
        }
    }
}
