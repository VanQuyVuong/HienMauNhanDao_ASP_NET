using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.QLK
{
    public partial class QLKDashboard : Window
    {
        public QLKDashboard()
        {
            InitializeComponent();
            
            if (!string.IsNullOrEmpty(ApiClient.Instance.Email))
            {
                txtUserName.Text = ApiClient.Instance.Email.Split('@')[0];
            }

            // Default page: ThongKeTonKhoPage
            btnThongKe_Click(btnThongKe, null);
        }

        private void SetActiveButton(Button activeBtn)
        {
            Button[] allButtons = { btnThongKe, btnKhoBenhVien, btnNhapKhoChienDich, btnQuanLyHanDung };
            foreach (var btn in allButtons)
            {
                if (btn == null) continue;
                if (btn == activeBtn)
                {
                    btn.Tag = "Active";
                    btn.Background = (Brush)new BrushConverter().ConvertFrom("#ea580c")!;
                    btn.Foreground = Brushes.White;
                }
                else
                {
                    btn.Tag = null;
                    btn.Background = Brushes.Transparent;
                    btn.Foreground = (Brush)new BrushConverter().ConvertFrom("#c2410c")!;
                }
            }
        }

        private void btnThongKe_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnThongKe);
            MainFrame.Navigate(new ThongKeTonKhoPage());
        }

        private void btnKhoBenhVien_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnKhoBenhVien);
            MainFrame.Navigate(new KhoMauBenhVienPage());
        }

        private void btnNhapKhoChienDich_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnNhapKhoChienDich);
            MainFrame.Navigate(new NhapKhoChienDichPage());
        }

        private void btnQuanLyHanDung_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnQuanLyHanDung);
            MainFrame.Navigate(new QuanLyHanDungPage());
        }

        private void btnLogout_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Bạn có chắc chắn muốn đăng xuất?", "Xác nhận", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (result == MessageBoxResult.Yes)
            {
                ApiClient.Instance.Logout();
                var loginWindow = new LoginWindow();
                loginWindow.Show();
                this.Close();
            }
        }
    }
}
