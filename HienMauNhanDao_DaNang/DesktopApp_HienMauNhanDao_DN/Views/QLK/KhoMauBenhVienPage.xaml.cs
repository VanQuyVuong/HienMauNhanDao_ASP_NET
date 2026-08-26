using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DesktopApp_HienMauNhanDao_DN.Views.QLK
{
    public partial class KhoMauBenhVienPage : Page
    {
        private List<BloodUnitInventoryDto> _allBloodUnits = new List<BloodUnitInventoryDto>();
        private ScanBloodUnitDto? _scannedUnit = null;

        public KhoMauBenhVienPage()
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

                var response = await ApiClient.Instance.Client.GetAsync("/api/KhoMauBenhVien/my-hospital");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var JObj = JObject.Parse(json);

                    if (JObj["hospital"]?["tenBenhVien"] != null)
                    {
                        txtHospitalHeader.Text = $"Kho lưu trữ chính thức tại {JObj["hospital"]!["tenBenhVien"]} | Cán bộ quản lý: {JObj["hospital"]!["nhanVienQuanLy"]}";
                    }

                    if (JObj["bloodUnits"] != null)
                    {
                        _allBloodUnits = JsonConvert.DeserializeObject<List<BloodUnitInventoryDto>>(JObj["bloodUnits"]!.ToString()) ?? new List<BloodUnitInventoryDto>();
                    }
                }

                FilterData();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải kho máu: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "LÀM MỚI";
            }
        }

        private async void btnScan_Click(object sender, RoutedEventArgs e)
        {
            await PerformScan();
        }

        private async void txtScanBarcode_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                await PerformScan();
            }
        }

        private async Task PerformScan()
        {
            string code = txtScanBarcode.Text.Trim();
            if (string.IsNullOrEmpty(code))
            {
                MessageBox.Show("Vui lòng nhập mã túi máu!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                btnScan.IsEnabled = false;
                btnScan.Content = "Đang quét...";

                var response = await ApiClient.Instance.Client.GetAsync($"/api/KhoMauBenhVien/scan-blood-unit/{code}");
                var json = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var JObj = JObject.Parse(json);
                    if (JObj["data"] != null)
                    {
                        _scannedUnit = JsonConvert.DeserializeObject<ScanBloodUnitDto>(JObj["data"]!.ToString());
                        DisplayScanResult(_scannedUnit);
                    }
                }
                else
                {
                    ScanResultCard.Visibility = Visibility.Collapsed;
                    string msg = "Không tìm thấy túi máu!";
                    try
                    {
                        var JObj = JObject.Parse(json);
                        if (JObj["message"] != null) msg = JObj["message"]!.ToString();
                    }
                    catch { }

                    MessageBox.Show(msg, "Kết quả tìm kiếm", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi quét mã: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnScan.IsEnabled = true;
                btnScan.Content = "🔍 QUÉT MÃ";
            }
        }

        private void DisplayScanResult(ScanBloodUnitDto? unit)
        {
            if (unit == null)
            {
                ScanResultCard.Visibility = Visibility.Collapsed;
                return;
            }

            txtScanMaTui.Text = unit.MaTuiMau;
            txtScanNhomMau.Text = unit.NhomMau;
            txtScanTheTich.Text = $" • {unit.TheTich} ml";
            txtScanDonor.Text = $"TNV: {unit.TenTinhNguyenVien} | CCCD: {unit.SoCCCD ?? "---"}";
            txtScanViSinh.Text = $"✅ Kết quả vi sinh: {unit.KetQuaViSinh}";

            ScanResultCard.Visibility = Visibility.Visible;
        }

        private async void btnConfirmImport_Click(object sender, RoutedEventArgs e)
        {
            if (_scannedUnit == null) return;

            try
            {
                var req = new ImportHospitalRequest { MaTuiMau = _scannedUnit.MaTuiMau };
                var jsonReq = JsonConvert.SerializeObject(req);
                var content = new StringContent(jsonReq, Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PostAsync("/api/KhoMauBenhVien/import", content);
                var jsonRes = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show($"✅ Nhập kho thành công túi máu {_scannedUnit.MaTuiMau}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    ScanResultCard.Visibility = Visibility.Collapsed;
                    _scannedUnit = null;
                    txtScanBarcode.Text = "";
                    await LoadData();
                }
                else
                {
                    MessageBox.Show($"Lỗi nhập kho: {jsonRes}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi xử lý: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void btnReportIssue_Click(object sender, RoutedEventArgs e)
        {
            if (_scannedUnit == null) return;
            txtIssueReason.Text = "";
            IssueModal.Visibility = Visibility.Visible;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            IssueModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitReTest_Click(object sender, RoutedEventArgs e)
        {
            await SubmitReportIssue("KIEM_TRA");
        }

        private async void btnSubmitCancelBag_Click(object sender, RoutedEventArgs e)
        {
            await SubmitReportIssue("HUY");
        }

        private async Task SubmitReportIssue(string action)
        {
            if (_scannedUnit == null) return;

            string reason = txtIssueReason.Text.Trim();
            if (string.IsNullOrEmpty(reason))
            {
                MessageBox.Show("Vui lòng nhập lý do từ chối / cần kiểm tra!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var req = new ReportIssueRequest
                {
                    MaTuiMau = _scannedUnit.MaTuiMau,
                    LyDo = reason,
                    HanhDong = action
                };

                var jsonReq = JsonConvert.SerializeObject(req);
                var content = new StringContent(jsonReq, Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PostAsync("/api/KhoMauBenhVien/report-issue", content);
                if (response.IsSuccessStatusCode)
                {
                    string msg = action == "HUY" ? "Đã hủy túi máu thành công!" : "Đã chuyển túi máu sang diện Re-Test kiểm tra lại!";
                    MessageBox.Show($"✅ {msg}", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                    IssueModal.Visibility = Visibility.Collapsed;
                    ScanResultCard.Visibility = Visibility.Collapsed;
                    _scannedUnit = null;
                    txtScanBarcode.Text = "";
                    await LoadData();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi gửi yêu cầu: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void FilterData()
        {
            string query = (txtSearch.Text ?? "").Trim().ToLower();
            var selectedItem = cbFilterStatus.SelectedItem as ComboBoxItem;
            string filterTag = selectedItem?.Tag?.ToString() ?? "ALL";

            var filtered = _allBloodUnits.Where(item =>
            {
                bool matchesSearch = string.IsNullOrEmpty(query) ||
                                     item.MaTuiMau.ToLower().Contains(query) ||
                                     item.MaDon.ToLower().Contains(query) ||
                                     item.TenTinhNguyenVien.ToLower().Contains(query) ||
                                     item.NhomMau.ToLower().Contains(query);

                bool matchesStatus = true;
                if (filterTag != "ALL") matchesStatus = item.TrangThai == filterTag;

                return matchesSearch && matchesStatus;
            }).ToList();

            dgBloodUnits.ItemsSource = filtered;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            FilterData();
        }

        private void cbFilterStatus_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            FilterData();
        }
    }
}
