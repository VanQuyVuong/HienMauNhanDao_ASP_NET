using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public partial class NVYTDashboard : Window
    {
        private Button _currentActiveBtn;

        public NVYTDashboard()
        {
            InitializeComponent();
            SetupMenuByRole();
        }

        private void SetupMenuByRole()
        {
            string role = ApiClient.Instance.Role;

            if (role == "NVYT_LT" || role == "NVYT" || role == "NVYT-LT")
            {
                btnDonDangKy.Visibility = Visibility.Visible;
                btnTinhNguyenVien.Visibility = Visibility.Visible;
                btnKhaiBaoYTe.Visibility = Visibility.Visible;
                
                MainFrame.Navigate(new DonDangKyPage());
                SetActiveButton(btnDonDangKy);
            }
            else if (role == "NVYT_XN" || role == "NVYT-XN")
            {
                btnThuNhanMau.Visibility = Visibility.Visible;
                btnCapNhatXetNghiem.Visibility = Visibility.Visible;
                
                MainFrame.Navigate(new ThuNhanMauPage());
                SetActiveButton(btnThuNhanMau);
            }
            else
            {
                MainFrame.Navigate(new DonDangKyPage());
                SetActiveButton(btnDonDangKy);
            }
        }

        private void SetActiveButton(Button activeBtn)
        {
            var inactiveBg = Brushes.Transparent;
            var inactiveFg = (Brush)new BrushConverter().ConvertFrom("#475569");
            
            var activeBg = (Brush)new BrushConverter().ConvertFrom("#e11d48");
            var activeFg = Brushes.White;

            Button[] allButtons = { btnDonDangKy, btnTinhNguyenVien, btnKhaiBaoYTe, btnThuNhanMau, btnCapNhatXetNghiem };
            
            foreach (var btn in allButtons)
            {
                if (btn == activeBtn)
                {
                    btn.Background = activeBg;
                    btn.Foreground = activeFg;
                    btn.FontWeight = FontWeights.Bold;
                }
                else
                {
                    btn.Background = inactiveBg;
                    btn.Foreground = inactiveFg;
                    btn.FontWeight = FontWeights.SemiBold;
                }
            }

            _currentActiveBtn = activeBtn;
        }

        private void btnDonDangKy_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnDonDangKy);
            MainFrame.Navigate(new DonDangKyPage());
        }

        private void btnTinhNguyenVien_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnTinhNguyenVien);
            MainFrame.Navigate(new TinhNguyenVienPage());
        }

        private void btnKhaiBaoYTe_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnKhaiBaoYTe);
            MainFrame.Navigate(new KhaiBaoYTePage());
        }

        private void btnThuNhanMau_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnThuNhanMau);
            MainFrame.Navigate(new ThuNhanMauPage());
        }

        private void btnCapNhatXetNghiem_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnCapNhatXetNghiem);
            MainFrame.Navigate(new CapNhatXetNghiemPage());
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
