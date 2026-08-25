using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Constants;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public partial class DonDangKyPage : Page
    {
        private List<DonDangKy> _allDons = new List<DonDangKy>();

        public DonDangKyPage()
        {
            InitializeComponent();
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadData();
        }

        private async void btnRefresh_Click(object sender, RoutedEventArgs e)
        {
            await LoadData();
        }

        private async Task LoadData()
        {
            try
            {
                btnRefresh.IsEnabled = false;
                btnRefresh.Content = "Đang tải...";

                var response = await ApiClient.Instance.Client.GetAsync("/api/dondangky/tat-ca");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    
                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<DonDangKy>>>(json);
                        if (apiRes != null && apiRes.Data != null)
                        {
                            _allDons = apiRes.Data;
                        }
                    }
                    catch { }

                    if (_allDons == null || _allDons.Count == 0)
                    {
                        try
                        {
                            var paginated = JsonConvert.DeserializeObject<PaginatedResponse<DonDangKy>>(json);
                            if (paginated != null && paginated.Content != null)
                            {
                                _allDons = paginated.Content;
                            }
                        }
                        catch { }
                    }

                    if (_allDons == null || _allDons.Count == 0)
                    {
                        try { _allDons = JsonConvert.DeserializeObject<List<DonDangKy>>(json) ?? new List<DonDangKy>(); } catch { }
                    }

                    FilterData();
                }
                else
                {
                    MessageBox.Show("Không thể tải danh sách đơn đăng ký.", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi kết nối: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "LÀM MỚI";
            }
        }

        private void FilterData()
        {
            if (dgDonDangKy == null) return;
            if (_allDons == null) _allDons = new List<DonDangKy>();

            var keyword = txtSearch?.Text?.Trim()?.ToLower() ?? "";
            if (string.IsNullOrEmpty(keyword))
            {
                dgDonDangKy.ItemsSource = _allDons.Where(d => d != null).OrderByDescending(d => d.ThoiGianDangKy).ToList();
            }
            else
            {
                dgDonDangKy.ItemsSource = _allDons.Where(d => d != null && 
                    ((d.MaDon != null && d.MaDon.ToLower().Contains(keyword)) ||
                     (d.HoTenTNV != null && d.HoTenTNV.ToLower().Contains(keyword)) ||
                     (d.TenChienDich != null && d.TenChienDich.ToLower().Contains(keyword)))
                ).OrderByDescending(x => x.ThoiGianDangKy).ToList();
            }
        }

        private void txtSearch_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                FilterData();
            }
        }

        private async void btnWalkIn_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new WalkInRegistrationDialog();
            dialog.Owner = Window.GetWindow(this);
            if (dialog.ShowDialog() == true)
            {
                await LoadData();
            }
        }

        private async void btnTiepNhan_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is DonDangKy don)
            {
                if (don.TrangThai != "DaDangKy")
                {
                    MessageBox.Show("Chỉ tiếp nhận những đơn có trạng thái 'Đã Đăng Ký'.", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                var dialog = new TiepNhanQuayDialog(don);
                dialog.Owner = Window.GetWindow(this);
                if (dialog.ShowDialog() == true)
                {
                    await LoadData();
                }
            }
        }
    }
}
