using System;
using System.Collections.Generic;
using System.Linq;
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
    public partial class CapNhatXetNghiemPage : Page
    {
        private List<KetQuaXetNghiemDto> _allList = new List<KetQuaXetNghiemDto>();
        private KetQuaXetNghiemDto? _selectedItem = null;

        private bool _hbv = false;
        private bool _hcv = false;
        private bool _hiv = false;
        private bool _giangMai = false;

        public CapNhatXetNghiemPage()
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

                var response = await ApiClient.Instance.Client.GetAsync("/api/ketquaxetnghiem/danh-sach");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<KetQuaXetNghiemDto>>>(json);
                        if (apiRes != null && apiRes.Data != null) _allList = apiRes.Data;
                    }
                    catch { }

                    if (_allList == null || _allList.Count == 0)
                    {
                        try { _allList = JsonConvert.DeserializeObject<List<KetQuaXetNghiemDto>>(json) ?? new List<KetQuaXetNghiemDto>(); } catch { }
                    }
                }

                await FetchStats();
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

        private async Task FetchStats()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/ketquaxetnghiem/thong-ke");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var stats = JsonConvert.DeserializeObject<XetNghiemStatsDto>(json);
                    if (stats != null)
                    {
                        txtKpiTongSo.Text = stats.TongSo.ToString();
                        txtKpiDat.Text = stats.DatYeuCau.ToString();
                        txtKpiKhongDat.Text = stats.KhongDat.ToString();
                        txtKpiReTest.Text = stats.ReTestCount.ToString();
                        return;
                    }
                }
            }
            catch { }

            // Local Stats Fallback
            int tong = _allList.Count;
            int dat = _allList.Count(i => i.KetQua == true);
            int khongDat = _allList.Count(i => i.KetQua == false);
            int reTest = _allList.Count(i => i.MoTa != null && (i.MoTa.ToLower().Contains("re-test") || i.MoTa.ToLower().Contains("kiểm tra lại")));

            txtKpiTongSo.Text = tong.ToString();
            txtKpiDat.Text = dat.ToString();
            txtKpiKhongDat.Text = khongDat.ToString();
            txtKpiReTest.Text = reTest.ToString();
        }

        private void FilterData()
        {
            if (dgXetNghiem == null) return;

            string kw = txtSearch != null ? txtSearch.Text.Trim().ToLower() : "";
            string bloodFilter = cbBloodFilter != null && cbBloodFilter.SelectedItem is ComboBoxItem item && item.Tag != null ? item.Tag.ToString()! : "ALL";

            var filtered = _allList.Where(i =>
                (string.IsNullOrEmpty(kw) || i.MaTuiMau.ToLower().Contains(kw) || i.TenTinhNguyenVien.ToLower().Contains(kw) || i.TenChienDich.ToLower().Contains(kw)) &&
                (bloodFilter == "ALL" || i.NhomMau.Contains(bloodFilter))
            ).ToList();

            dgXetNghiem.ItemsSource = filtered;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            FilterData();
        }

        private void cbBloodFilter_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            FilterData();
        }

        private void btnOpenModal_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is KetQuaXetNghiemDto item)
            {
                _selectedItem = item;

                bool isReTest = item.MoTa != null && (item.MoTa.ToLower().Contains("re-test") || item.MoTa.ToLower().Contains("kiểm tra lại"));

                txtModalTitle.Text = isReTest ? "🚨 CẬP NHẬT XÉT NGHIỆM LẦN 2 (RE-TEST KHO)" : "🧪 ĐÁNH GIÁ VI SINH TÚI MÁU";
                txtModalSubtitle.Text = $"Mã định danh túi máu: [{item.MaTuiMau}]";
                txtModalDonorName.Text = $"TNV: {item.TenTinhNguyenVien}";
                txtModalCampaign.Text = $"Đợt hiến: {item.TenChienDich}";

                txtMoTa.Text = isReTest ? "Thực hiện xét nghiệm lại lần 2 theo yêu cầu từ Quản Lý Kho." : "Đã xét nghiệm vi sinh phẩm máu đầy đủ (Âm tính 4 bệnh).";

                // Reset switches to Negative
                _hbv = false;
                _hcv = false;
                _hiv = false;
                _giangMai = false;

                // Pre-select donor's blood type in modal dropdown
                if (!string.IsNullOrEmpty(item.NhomMau))
                {
                    string targetBlood = item.NhomMau.Trim().Replace("_positive", "+").Replace("_negative", "-");
                    foreach (ComboBoxItem cbi in cbModalBloodType.Items)
                    {
                        if (cbi.Content?.ToString()?.Trim() == targetBlood || cbi.Content?.ToString()?.Trim() == item.NhomMau.Trim())
                        {
                            cbModalBloodType.SelectedItem = cbi;
                            break;
                        }
                    }
                }

                UpdatePathogenSwitches();
                DiagnosticModal.Visibility = Visibility.Visible;
            }
        }


        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            DiagnosticModal.Visibility = Visibility.Collapsed;
        }

        private void btnPathogen_Click(object sender, MouseButtonEventArgs e)
        {
            if (sender is Border border)
            {
                if (border.Name == "btnHbv") _hbv = !_hbv;
                else if (border.Name == "btnHcv") _hcv = !_hcv;
                else if (border.Name == "btnHiv") _hiv = !_hiv;
                else if (border.Name == "btnGiangMai") _giangMai = !_giangMai;

                UpdatePathogenSwitches();
            }
        }

        private void UpdatePathogenSwitches()
        {
            UpdateSwitchUI(btnHbv, txtHbvStatus, _hbv);
            UpdateSwitchUI(btnHcv, txtHcvStatus, _hcv);
            UpdateSwitchUI(btnHiv, txtHivStatus, _hiv);
            UpdateSwitchUI(btnGiangMai, txtGiangMaiStatus, _giangMai);

            bool isHasDisease = _hbv || _hcv || _hiv || _giangMai;

            if (isHasDisease)
            {
                AssessmentBadge.Background = (Brush)new BrushConverter().ConvertFrom("#88be123c")!;
                AssessmentBadge.BorderBrush = (Brush)new BrushConverter().ConvertFrom("#e11d48")!;
                txtAssessmentMsg.Text = "❌ KHÔNG ĐẠT: MẪU MÁU BỊ NHIỄM BỆNH (HỦY)";
                txtAssessmentMsg.Foreground = Brushes.White;
            }
            else
            {
                AssessmentBadge.Background = (Brush)new BrushConverter().ConvertFrom("#064e3b")!;
                AssessmentBadge.BorderBrush = (Brush)new BrushConverter().ConvertFrom("#059669")!;
                txtAssessmentMsg.Text = "✅ PHÊ DUYỆT: ĐẠT TIÊU CHUẨN KHO MÁU";
                txtAssessmentMsg.Foreground = Brushes.White;
            }
        }

        private void UpdateSwitchUI(Border border, TextBlock txtStatus, bool isPositive)
        {
            if (border == null || txtStatus == null) return;

            if (isPositive)
            {
                border.Background = (Brush)new BrushConverter().ConvertFrom("#88be123c")!;
                border.BorderBrush = (Brush)new BrushConverter().ConvertFrom("#e11d48")!;
                txtStatus.Text = "DƯƠNG TÍNH ❌";
                txtStatus.Foreground = (Brush)new BrushConverter().ConvertFrom("#fecdd3")!;
            }
            else
            {
                border.Background = (Brush)new BrushConverter().ConvertFrom("#064e3b")!;
                border.BorderBrush = (Brush)new BrushConverter().ConvertFrom("#059669")!;
                txtStatus.Text = "ÂM TÍNH ✅";
                txtStatus.Foreground = (Brush)new BrushConverter().ConvertFrom("#34d399")!;
            }
        }

        private async void btnPheDuyet_Click(object sender, RoutedEventArgs e)
        {
            await SubmitAssessment(true);
        }

        private async void btnTuChoi_Click(object sender, RoutedEventArgs e)
        {
            await SubmitAssessment(false);
        }

        private async Task SubmitAssessment(bool isDat)
        {
            if (_selectedItem == null) return;

            try
            {
                btnPheDuyet.IsEnabled = false;
                btnTuChoi.IsEnabled = false;

                string selectedBloodType = "O+";
                if (cbModalBloodType.SelectedItem is ComboBoxItem item) selectedBloodType = item.Content.ToString()!;

                string fullMoTa = $"{txtMoTa.Text.Trim()} | HBV: {(_hbv ? "dương tính" : "âm tính")}, HCV: {(_hcv ? "dương tính" : "âm tính")}, HIV: {(_hiv ? "dương tính" : "âm tính")}, Giang Mai: {(_giangMai ? "dương tính" : "âm tính")}";

                var req = new SaveXetNghiemRequest
                {
                    MaTuiMau = _selectedItem.MaTuiMau,
                    NhomMau = selectedBloodType,
                    SoLanXetNghiem = _selectedItem.SoLanXetNghiem > 1 ? _selectedItem.SoLanXetNghiem : 1,
                    KetQua = isDat,
                    MoTa = fullMoTa,
                    MaNhanVien = "NV00007"
                };

                var content = new System.Net.Http.StringContent(JsonConvert.SerializeObject(req), System.Text.Encoding.UTF8, "application/json");
                var response = await ApiClient.Instance.Client.PostAsync("/api/ketquaxetnghiem/luu", content);

                if (response.IsSuccessStatusCode)
                {
                    string statusStr = isDat ? "✅ ĐÃ PHÊ DUYỆT ĐẠT TIÊU CHUẨN! Trạng thái chuyển thành: CHỜ NHẬP KHO." : "❌ ĐÃ ĐÁNH GIÁ KHÔNG ĐẠT! Trạng thái chuyển thành: ĐÃ HỦY.";
                    MessageBox.Show($"XỬ LÝ KẾT QUẢ XÉT NGHIỆM THÀNH CÔNG!\n\nMã Túi Máu: [{_selectedItem.MaTuiMau}]\nNhóm Máu: [{selectedBloodType}]\n\n{statusStr}", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    
                    DiagnosticModal.Visibility = Visibility.Collapsed;
                    await LoadData();
                }
                else
                {
                    string errStr = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"Lỗi khi lưu kết quả xét nghiệm ({response.StatusCode}):\n{errStr}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi kết nối: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnPheDuyet.IsEnabled = true;
                btnTuChoi.IsEnabled = true;
            }
        }
    }
}
