using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public class PendingDonorDto
    {
        public string MaDon { get; set; } = string.Empty;
        public string TenTinhNguyenVien { get; set; } = string.Empty;
        public string Cccd { get; set; } = string.Empty;
        public string GioiTinh { get; set; } = "---";
        public string NgaySinh { get; set; } = "---";
        public string NhomMau { get; set; } = "Chưa rõ";
        public string TenChienDich { get; set; } = string.Empty;
        public int TheTich { get; set; } = 350;

        public string GioiTinhNgaySinh => $"{GioiTinh} | {NgaySinh}";
    }

    public partial class ThuNhanMauPage : Page
    {
        private List<PendingDonorDto> _allPending = new List<PendingDonorDto>();
        private List<TuiMauDto> _allCompleted = new List<TuiMauDto>();
        private PendingDonorDto? _selectedPending = null;
        private TuiMauDto? _editingBag = null;
        private int _selectedVol = 350;

        public ThuNhanMauPage()
        {
            InitializeComponent();
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadAllData();
        }

        private async void btnRefresh_Click(object sender, RoutedEventArgs e)
        {
            await LoadAllData();
        }

        private async Task LoadAllData()
        {
            try
            {
                btnRefresh.IsEnabled = false;
                btnRefresh.Content = "Đang tải...";

                await Task.WhenAll(LoadPendingDonors(), LoadCompletedBags());

                FilterData();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải dữ liệu: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "LÀM MỚI";
            }
        }

        private async Task LoadPendingDonors()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/DonDangKy/tat-ca");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    List<DonDangKy> dons = null;

                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<DonDangKy>>>(json);
                        if (apiRes != null && apiRes.Data != null) dons = apiRes.Data;
                    }
                    catch { }

                    if (dons == null)
                    {
                        try
                        {
                            var paginated = JsonConvert.DeserializeObject<PaginatedResponse<DonDangKy>>(json);
                            if (paginated != null && paginated.Content != null) dons = paginated.Content;
                        }
                        catch { }
                    }

                    if (dons == null)
                    {
                        try { dons = JsonConvert.DeserializeObject<List<DonDangKy>>(json); } catch { }
                    }

                    if (dons != null)
                    {
                        _allPending = dons.Select(d => new PendingDonorDto
                        {
                            MaDon = d.MaDon,
                            TenTinhNguyenVien = d.HoTenTNV,
                            Cccd = d.TinhNguyenVien?.Cccd ?? "---",
                            GioiTinh = d.TinhNguyenVien?.GioiTinh ?? "---",
                            NgaySinh = d.TinhNguyenVien?.NgaySinh?.ToString("dd/MM/yyyy") ?? "---",
                            NhomMau = d.TinhNguyenVien?.NhomMau ?? "Chưa rõ",
                            TenChienDich = d.TenChienDich,
                            TheTich = d.TheTich ?? 350
                        }).ToList();
                    }
                }
            }
            catch { }
        }

        private async Task LoadCompletedBags()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/tuimau");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<TuiMauDto>>>(json);
                        if (apiRes != null && apiRes.Data != null) _allCompleted = apiRes.Data;
                    }
                    catch { }

                    if (_allCompleted == null || _allCompleted.Count == 0)
                    {
                        try { _allCompleted = JsonConvert.DeserializeObject<List<TuiMauDto>>(json) ?? new List<TuiMauDto>(); } catch { }
                    }
                }
            }
            catch { }
        }

        private void FilterData()
        {
            if (dgPending == null || dgCompleted == null) return;

            string kw = txtSearch != null ? txtSearch.Text.Trim().ToLower() : "";
            string bloodFilter = cbBloodFilter != null && cbBloodFilter.SelectedItem is ComboBoxItem item && item.Tag != null ? item.Tag.ToString()! : "ALL";

            var filteredPending = _allPending.Where(p =>
                (string.IsNullOrEmpty(kw) || p.MaDon.ToLower().Contains(kw) || p.TenTinhNguyenVien.ToLower().Contains(kw) || p.Cccd.Contains(kw)) &&
                (bloodFilter == "ALL" || p.NhomMau.Contains(bloodFilter))
            ).ToList();

            var filteredCompleted = _allCompleted.Where(c =>
                (string.IsNullOrEmpty(kw) || c.MaTuiMau.ToLower().Contains(kw) || c.MaDon.ToLower().Contains(kw) || c.TenTinhNguyenVien.ToLower().Contains(kw)) &&
                (bloodFilter == "ALL" || c.NhomMau.Contains(bloodFilter))
            ).ToList();

            dgPending.ItemsSource = filteredPending;
            dgCompleted.ItemsSource = filteredCompleted;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            FilterData();
        }

        private void cbBloodFilter_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            FilterData();
        }

        private void btnTabPending_Click(object sender, RoutedEventArgs e)
        {
            ViewPending.Visibility = Visibility.Visible;
            ViewCompleted.Visibility = Visibility.Collapsed;
            btnTabPending.Background = Brushes.White;
            btnTabPending.Foreground = (Brush)new BrushConverter().ConvertFrom("#be123c")!;
            btnTabCompleted.Background = Brushes.Transparent;
            btnTabCompleted.Foreground = Brushes.White;
        }

        private void btnTabCompleted_Click(object sender, RoutedEventArgs e)
        {
            ViewPending.Visibility = Visibility.Collapsed;
            ViewCompleted.Visibility = Visibility.Visible;
            btnTabCompleted.Background = Brushes.White;
            btnTabCompleted.Foreground = (Brush)new BrushConverter().ConvertFrom("#be123c")!;
            btnTabPending.Background = Brushes.Transparent;
            btnTabPending.Foreground = Brushes.White;
        }

        private void btnCreateBarcode_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is PendingDonorDto item)
            {
                _selectedPending = item;
                _editingBag = null;

                txtModalBarcodeCode.Text = $"TM{DateTime.Now:mmffssfff}";
                txtModalDonorName.Text = $"TNV: {item.TenTinhNguyenVien}";
                txtModalOrderCode.Text = $"Mã đơn: {item.MaDon}";
                txtModalBloodType.Text = item.NhomMau;
                
                SetVolumeSelection(item.TheTich);
                txtModalTemp.Text = "4.0";
                BarcodeModal.Visibility = Visibility.Visible;
            }
        }

        private void btnEditBag_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is TuiMauDto bag)
            {
                _editingBag = bag;
                _selectedPending = null;

                txtModalBarcodeCode.Text = bag.MaTuiMau;
                txtModalDonorName.Text = $"TNV: {bag.TenTinhNguyenVien}";
                txtModalOrderCode.Text = $"Mã đơn: {bag.MaDon}";
                txtModalBloodType.Text = bag.NhomMau;

                SetVolumeSelection(bag.TheTich);
                txtModalTemp.Text = bag.NhietDoVanChuyen.ToString("0.0");
                BarcodeModal.Visibility = Visibility.Visible;
            }
        }

        private async void btnDeleteBag_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is TuiMauDto bag)
            {
                if (MessageBox.Show($"Bạn có chắc chắn muốn xóa túi máu [{bag.MaTuiMau}] không?", "Xác nhận xóa", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    try
                    {
                        var response = await ApiClient.Instance.Client.DeleteAsync($"/api/tuimau/{bag.MaTuiMau}");
                        if (response.IsSuccessStatusCode)
                        {
                            MessageBox.Show($"Đã xóa túi máu [{bag.MaTuiMau}] thành công.", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                            await LoadAllData();
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Lỗi khi xóa túi máu: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
        }

        private void btnModalVol_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn)
            {
                if (btn.Content.ToString()!.Contains("250")) SetVolumeSelection(250);
                else if (btn.Content.ToString()!.Contains("350")) SetVolumeSelection(350);
                else if (btn.Content.ToString()!.Contains("450")) SetVolumeSelection(450);
            }
        }

        private void SetVolumeSelection(int vol)
        {
            _selectedVol = vol;
            btnModalVol250.Background = (vol == 250) ? Brushes.White : (Brush)new BrushConverter().ConvertFrom("#33ffffff")!;
            btnModalVol250.Foreground = (vol == 250) ? (Brush)new BrushConverter().ConvertFrom("#e11d48")! : Brushes.White;

            btnModalVol350.Background = (vol == 350) ? Brushes.White : (Brush)new BrushConverter().ConvertFrom("#33ffffff")!;
            btnModalVol350.Foreground = (vol == 350) ? (Brush)new BrushConverter().ConvertFrom("#e11d48")! : Brushes.White;

            btnModalVol450.Background = (vol == 450) ? Brushes.White : (Brush)new BrushConverter().ConvertFrom("#33ffffff")!;
            btnModalVol450.Foreground = (vol == 450) ? (Brush)new BrushConverter().ConvertFrom("#e11d48")! : Brushes.White;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            BarcodeModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitModal_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                btnSubmitModal.IsEnabled = false;
                btnSubmitModal.Content = "Đang xử lý...";

                double.TryParse(txtModalTemp.Text.Trim(), out double temp);
                if (temp == 0) temp = 4.0;

                var req = new CreateTuiMauRequest
                {
                    MaDon = _selectedPending?.MaDon ?? _editingBag?.MaDon ?? "",
                    MaNV = "NV00007",
                    TheTich = _selectedVol,
                    ThoiGianLayMau = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
                    NhietDoVanChuyen = temp
                };

                HttpResponseMessage response;
                if (_editingBag != null)
                {
                    var content = new System.Net.Http.StringContent(JsonConvert.SerializeObject(req), System.Text.Encoding.UTF8, "application/json");
                    response = await ApiClient.Instance.Client.PutAsync($"/api/tuimau/{_editingBag.MaTuiMau}", content);
                }
                else
                {
                    var content = new System.Net.Http.StringContent(JsonConvert.SerializeObject(req), System.Text.Encoding.UTF8, "application/json");
                    response = await ApiClient.Instance.Client.PostAsync("/api/tuimau", content);
                }

                if (response.IsSuccessStatusCode)
                {
                    string barcodeStr = txtModalBarcodeCode.Text;
                    MessageBox.Show($"✅ CẤP MÃ BARCODE VÀ LẤY MÁU THÀNH CÔNG!\n\nMã Barcode Túi Máu: [{barcodeStr}]\nThể Tích: [{_selectedVol} ml]\nNhiệt Độ: [{temp} °C]", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    BarcodeModal.Visibility = Visibility.Collapsed;
                    await LoadAllData();
                }
                else
                {
                    string errStr = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"Không thể tạo túi máu ({response.StatusCode}):\n{errStr}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi kết nối: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnSubmitModal.IsEnabled = true;
                btnSubmitModal.Content = "✅ LƯU & IN BARCODE";
            }
        }
    }
}
