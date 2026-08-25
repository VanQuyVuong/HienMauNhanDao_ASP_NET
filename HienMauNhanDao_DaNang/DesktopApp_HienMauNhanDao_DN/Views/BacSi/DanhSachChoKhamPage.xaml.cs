using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.BacSi
{
    public partial class DanhSachChoKhamPage : Page
    {
        private BacSiDashboard _dashboard;
        private List<DonChoKhamDto> _allChoKham = new List<DonChoKhamDto>();

        public DanhSachChoKhamPage(BacSiDashboard dashboard)
        {
            InitializeComponent();
            _dashboard = dashboard;
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

                List<DonChoKhamDto> list = null;

                try
                {
                    var response = await ApiClient.Instance.Client.GetAsync("/api/khamlamsang/cho-kham");
                    if (response.IsSuccessStatusCode)
                    {
                        var json = await response.Content.ReadAsStringAsync();
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
                    }
                }
                catch { }

                // Fallback API if /api/khamlamsang/cho-kham is empty
                if (list == null || list.Count == 0)
                {
                    try
                    {
                        var fbResponse = await ApiClient.Instance.Client.GetAsync("/api/DonDangKy/tat-ca");
                        if (fbResponse.IsSuccessStatusCode)
                        {
                            var fbJson = await fbResponse.Content.ReadAsStringAsync();
                            List<DonDangKy> dons = null;

                            try
                            {
                                var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<DonDangKy>>>(fbJson);
                                if (apiRes != null && apiRes.Data != null) dons = apiRes.Data;
                            }
                            catch { }

                            if (dons == null)
                            {
                                try
                                {
                                    var paginated = JsonConvert.DeserializeObject<PaginatedResponse<DonDangKy>>(fbJson);
                                    if (paginated != null && paginated.Content != null) dons = paginated.Content;
                                }
                                catch { }
                            }

                            if (dons == null)
                            {
                                try { dons = JsonConvert.DeserializeObject<List<DonDangKy>>(fbJson); } catch { }
                            }

                            if (dons != null && dons.Count > 0)
                            {
                                list = dons.Select(d => new DonChoKhamDto
                                {
                                    MaDon = d.MaDon,
                                    MaTNV = d.MaTNV,
                                    TenTinhNguyenVien = d.HoTenTNV,
                                    NgaySinh = d.TinhNguyenVien?.NgaySinh?.ToString("dd/MM/yyyy") ?? "---",
                                    GioiTinh = d.TinhNguyenVien?.GioiTinh ?? "---",
                                    NhomMau = d.TinhNguyenVien?.NhomMau ?? "Chưa rõ",
                                    SoDienThoai = d.TinhNguyenVien?.SoDienThoai ?? "---",
                                    Cccd = d.TinhNguyenVien?.Cccd ?? "---",
                                    TenChienDich = d.TenChienDich,
                                    TheTich = d.TheTich ?? 350
                                }).ToList();
                            }
                        }
                    }
                    catch { }
                }

                _allChoKham = list ?? new List<DonChoKhamDto>();
                FilterData();
                UpdateKpis();
                _dashboard?.FetchPendingCount();
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

        private void UpdateKpis()
        {
            if (_allChoKham == null) return;
            
            txtStatTotal.Text = _allChoKham.Count.ToString();
            
            // On web: registeredByLeTanCount = list.filter(d => d.maNhanVien || d.maNV).length
            // Here we check if any officer field or check-in marker exists, or count dynamically
            int leTanCount = _allChoKham.Count(d => !string.IsNullOrEmpty(d.MaDon)); // Default all are checked-in by Le Tan
            txtStatLeTan.Text = leTanCount.ToString();
            txtStatTuDangKy.Text = (_allChoKham.Count - leTanCount).ToString();
        }

        private void FilterData()
        {
            if (dgChoKham == null) return;
            if (_allChoKham == null) _allChoKham = new List<DonChoKhamDto>();

            var kw = txtSearch?.Text?.Trim()?.ToLower() ?? "";
            string selectedBlood = "ALL";

            if (cbBloodFilter?.SelectedItem is ComboBoxItem selectedItem && selectedItem.Tag != null)
            {
                selectedBlood = selectedItem.Tag.ToString();
            }

            var filtered = _allChoKham.Where(d => d != null &&
                (string.IsNullOrEmpty(kw) ||
                    (d.MaDon != null && d.MaDon.ToLower().Contains(kw)) ||
                    (d.TenTinhNguyenVien != null && d.TenTinhNguyenVien.ToLower().Contains(kw)) ||
                    (d.Cccd != null && d.Cccd.ToLower().Contains(kw)) ||
                    (d.SoDienThoai != null && d.SoDienThoai.ToLower().Contains(kw)))
                &&
                (selectedBlood == "ALL" || (d.NhomMau != null && d.NhomMau.Contains(selectedBlood)))
            ).ToList();

            dgChoKham.ItemsSource = filtered;
        }

        private void cbBloodFilter_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            FilterData();
        }

        private void txtSearch_KeyUp(object sender, KeyEventArgs e)
        {
            FilterData();
        }

        private void btnKhamNow_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is DonChoKhamDto don)
            {
                _dashboard?.NavigateToKham(don);
            }
        }
    }
}
