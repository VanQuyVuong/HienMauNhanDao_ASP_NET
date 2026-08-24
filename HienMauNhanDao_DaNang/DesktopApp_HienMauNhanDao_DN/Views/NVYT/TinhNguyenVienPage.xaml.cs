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
    public partial class TinhNguyenVienPage : Page
    {
        private List<TinhNguyenVien> _allTnv = new List<TinhNguyenVien>();

        public TinhNguyenVienPage()
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

                var response = await ApiClient.Instance.Client.GetAsync(ApiEndpoints.NVYT.TinhNguyenVien);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    
                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<TinhNguyenVien>>>(json);
                        if (apiRes != null && apiRes.Data != null)
                        {
                            _allTnv = apiRes.Data;
                        }
                    }
                    catch { }

                    if (_allTnv == null || _allTnv.Count == 0)
                    {
                        try
                        {
                            var paginated = JsonConvert.DeserializeObject<PaginatedResponse<TinhNguyenVien>>(json);
                            if (paginated != null && paginated.Content != null)
                            {
                                _allTnv = paginated.Content;
                            }
                        }
                        catch { }
                    }

                    if (_allTnv == null || _allTnv.Count == 0)
                    {
                        try { _allTnv = JsonConvert.DeserializeObject<List<TinhNguyenVien>>(json) ?? new List<TinhNguyenVien>(); } catch { }
                    }

                    FilterData();
                }
                else
                {
                    MessageBox.Show("Không thể tải danh sách tình nguyện viên.", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
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
            var keyword = txtSearch.Text.Trim().ToLower();
            if (string.IsNullOrEmpty(keyword))
            {
                dgTNV.ItemsSource = _allTnv;
            }
            else
            {
                dgTNV.ItemsSource = _allTnv.Where(t => 
                    (t.HoTen != null && t.HoTen.ToLower().Contains(keyword)) ||
                    (t.Cccd != null && t.Cccd.ToLower().Contains(keyword)) ||
                    (t.SoDienThoai != null && t.SoDienThoai.ToLower().Contains(keyword))
                ).ToList();
            }
        }

        private void txtSearch_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                FilterData();
            }
        }

        private async void btnEdit_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is TinhNguyenVien tnv)
            {
                var dialog = new EditTinhNguyenVienDialog(tnv);
                dialog.Owner = Window.GetWindow(this);
                if (dialog.ShowDialog() == true)
                {
                    await LoadData();
                }
            }
        }
    }
}
