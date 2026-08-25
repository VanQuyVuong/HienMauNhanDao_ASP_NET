using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.BacSi
{
    public partial class BacSiDashboard : Window
    {
        private Button _currentActiveBtn;
        private DispatcherTimer _timer;

        public BacSiDashboard()
        {
            InitializeComponent();
            MainFrame.Navigate(new DanhSachChoKhamPage(this));
            SetActiveButton(btnDanhSachChoKham);

            StartBadgeTimer();
        }

        private void StartBadgeTimer()
        {
            FetchPendingCount();
            _timer = new DispatcherTimer();
            _timer.Interval = TimeSpan.FromSeconds(5);
            _timer.Tick += (s, e) => FetchPendingCount();
            _timer.Start();
        }

        public async void FetchPendingCount()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/khamlamsang/cho-kham");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    List<DonChoKhamDto> list = null;

                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<DonChoKhamDto>>>(json);
                        if (apiRes != null && apiRes.Data != null) list = apiRes.Data;
                    }
                    catch { }

                    if (list == null)
                    {
                        try { list = JsonConvert.DeserializeObject<List<DonChoKhamDto>>(json); } catch { }
                    }

                    if (txtBadgeCount == null || badgeBorder == null) return;

                    if (list != null && list.Count > 0)
                    {
                        txtBadgeCount.Text = list.Count.ToString();
                        badgeBorder.Visibility = Visibility.Visible;
                    }
                    else
                    {
                        badgeBorder.Visibility = Visibility.Collapsed;
                    }
                }
            }
            catch { }
        }

        private void SetActiveButton(Button activeBtn)
        {
            var inactiveBg = Brushes.Transparent;
            var inactiveFg = (Brush)new BrushConverter().ConvertFrom("#475569");
            
            var activeBg = (Brush)new BrushConverter().ConvertFrom("#e11d48");
            var activeFg = Brushes.White;

            Button[] allButtons = { btnDanhSachChoKham, btnKhamLamSang };
            
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

        public void NavigateToKham(DonChoKhamDto don)
        {
            SetActiveButton(btnKhamLamSang);
            MainFrame.Navigate(new KhamLamSangPage(don));
        }

        private void btnDanhSachChoKham_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnDanhSachChoKham);
            MainFrame.Navigate(new DanhSachChoKhamPage(this));
        }

        private void btnKhamLamSang_Click(object sender, RoutedEventArgs e)
        {
            SetActiveButton(btnKhamLamSang);
            MainFrame.Navigate(new KhamLamSangPage());
        }

        private void btnLogout_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Bạn có chắc chắn muốn đăng xuất?", "Xác nhận", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (result == MessageBoxResult.Yes)
            {
                _timer?.Stop();
                ApiClient.Instance.Logout();
                var loginWindow = new LoginWindow();
                loginWindow.Show();
                this.Close();
            }
        }
    }
}
