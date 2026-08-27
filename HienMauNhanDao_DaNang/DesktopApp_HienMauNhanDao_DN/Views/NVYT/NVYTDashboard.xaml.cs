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
            string role = (ApiClient.Instance.Role ?? "").Trim().ToUpper();

<<<<<<< Updated upstream
            // Hide all menu buttons first
            if (btnDonDangKy != null) btnDonDangKy.Visibility = Visibility.Collapsed;
            if (btnTinhNguyenVien != null) btnTinhNguyenVien.Visibility = Visibility.Collapsed;
            if (btnKhaiBaoYTe != null) btnKhaiBaoYTe.Visibility = Visibility.Collapsed;
            if (btnThuNhanMau != null) btnThuNhanMau.Visibility = Visibility.Collapsed;
            if (btnCapNhatXetNghiem != null) btnCapNhatXetNghiem.Visibility = Visibility.Collapsed;

            bool isXn = role.Contains("XN");

            if (isXn)
            {
                // Role NVYT_XN / NVYT-XN: Show strictly 2 Lab & Blood Collection Menu Items
                if (btnThuNhanMau != null) btnThuNhanMau.Visibility = Visibility.Visible;
                if (btnCapNhatXetNghiem != null) btnCapNhatXetNghiem.Visibility = Visibility.Visible;

=======
            if (role.Contains("XN"))
            {
                if (btnThuNhanMau != null) btnThuNhanMau.Visibility = Visibility.Visible;
                if (btnCapNhatXetNghiem != null) btnCapNhatXetNghiem.Visibility = Visibility.Visible;
                
>>>>>>> Stashed changes
                MainFrame?.Navigate(new ThuNhanMauPage());
                SetActiveButton(btnThuNhanMau);
            }
            else
            {
<<<<<<< Updated upstream
                // Role NVYT_LT / NVYT-LT / General NVYT: Show strictly 3 Le Tan Reception Menu Items
                if (btnDonDangKy != null) btnDonDangKy.Visibility = Visibility.Visible;
                if (btnTinhNguyenVien != null) btnTinhNguyenVien.Visibility = Visibility.Visible;
                if (btnKhaiBaoYTe != null) btnKhaiBaoYTe.Visibility = Visibility.Visible;

=======
                // Default / Lễ tân / General NVYT
                if (btnDonDangKy != null) btnDonDangKy.Visibility = Visibility.Visible;
                if (btnTinhNguyenVien != null) btnTinhNguyenVien.Visibility = Visibility.Visible;
                if (btnKhaiBaoYTe != null) btnKhaiBaoYTe.Visibility = Visibility.Visible;
                
>>>>>>> Stashed changes
                MainFrame?.Navigate(new DonDangKyPage());
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
                if (btn == null) continue;
                if (btn == activeBtn)
                {
                    btn.Tag = "Active";
                    btn.Background = activeBg;
                    btn.Foreground = activeFg;
                    btn.FontWeight = FontWeights.Bold;
                }
                else
                {
                    btn.Tag = "Inactive";
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
