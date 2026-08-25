using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Constants;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.BacSi
{
    public partial class KhamLamSangPage : Page
    {
        private DonChoKhamDto _currentDon;
        private string _selectedVolume = "350";
        private string _currentMaDon;
        private string _passedMaDon;
        private DonChoKhamDto _passedDonData;

        public KhamLamSangPage()
        {
            InitializeComponent();
            RegisterVitalsEvents();
        }

        public KhamLamSangPage(DonChoKhamDto donData) : this()
        {
            _passedDonData = donData;
        }

        public KhamLamSangPage(string maDon) : this()
        {
            _passedMaDon = maDon;
        }

        public KhamLamSangPage(string maDon, DonChoKhamDto donData) : this()
        {
            _passedMaDon = maDon;
            _passedDonData = donData;
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            if (_passedDonData != null)
            {
                DisplayDonor(_passedDonData);
            }
            else if (!string.IsNullOrEmpty(_passedMaDon))
            {
                txtMaDonSearch.Text = _passedMaDon;
                await SearchDon(_passedMaDon);
            }
        }

        private void RegisterVitalsEvents()
        {
            if (txtHuyetAp != null) txtHuyetAp.TextChanged += Vitals_TextChanged;
            if (txtNhipTim != null) txtNhipTim.TextChanged += Vitals_TextChanged;
            if (txtCanNang != null) txtCanNang.TextChanged += Vitals_TextChanged;
            if (txtNhietDo != null) txtNhietDo.TextChanged += Vitals_TextChanged;
        }

        private void Vitals_TextChanged(object sender, TextChangedEventArgs e)
        {
            EvaluateVitals();
        }

        private void EvaluateVitals()
        {
            if (txtAssessmentMsg == null || AssessmentBadge == null) return;

            string hrStr = txtNhipTim?.Text?.Trim() ?? "";
            string wStr = txtCanNang?.Text?.Trim() ?? "";
            string tempStr = txtNhietDo?.Text?.Trim() ?? "";

            double.TryParse(wStr, out double weight);
            int.TryParse(hrStr, out int hr);
            double.TryParse(tempStr, out double temp);

            // Weight rule
            if (weight > 0 && weight < 42)
            {
                if (PanelLyDo != null) PanelLyDo.Visibility = Visibility.Visible;
                if (txtLyDoTuChoi != null && string.IsNullOrEmpty(txtLyDoTuChoi.Text))
                {
                    txtLyDoTuChoi.Text = "Cân nặng dưới 42kg không đủ điều kiện hiến máu.";
                }
            }
            else if (weight >= 42 && weight < 45)
            {
                SetVolume("250");
            }

            // Realtime assessment
            bool isNormal = weight >= 45 &&
                            hr >= 60 && hr <= 100 &&
                            temp >= 36.0 && temp <= 37.5;

            if (isNormal)
            {
                txtAssessmentMsg.Text = "✅ CÁC CHỈ SỐ SINH HIỆU BÌNH THƯỜNG - ĐỦ ĐIỀU KIỆN SỨC KHỎE";
                txtAssessmentMsg.Foreground = (Brush)new BrushConverter().ConvertFrom("#15803d");
                AssessmentBadge.Background = (Brush)new BrushConverter().ConvertFrom("#f0fdf4");
                AssessmentBadge.BorderBrush = (Brush)new BrushConverter().ConvertFrom("#bbf7d0");
            }
            else
            {
                txtAssessmentMsg.Text = "⚠️ CẦN BÁC SĨ KIỂM TRA LẠI CHỈ SỐ SINH HIỆU";
                txtAssessmentMsg.Foreground = (Brush)new BrushConverter().ConvertFrom("#b45309");
                AssessmentBadge.Background = (Brush)new BrushConverter().ConvertFrom("#fffbeb");
                AssessmentBadge.BorderBrush = (Brush)new BrushConverter().ConvertFrom("#fde68a");
            }
        }

        private void DisplayDonor(DonChoKhamDto don)
        {
            _currentDon = don;
            _currentMaDon = don.MaDon;

            txtCardMaDon.Text = $"Mã đơn: {don.MaDon}";
            txtCardHoTen.Text = don.TenTinhNguyenVien;
            txtCardInitial.Text = string.IsNullOrEmpty(don.TenTinhNguyenVien) ? "A" : don.TenTinhNguyenVien.Trim().Split(' ').Last().Substring(0, 1).ToUpper();
            txtCardNhomMau.Text = string.IsNullOrEmpty(don.NhomMau) ? "---" : don.NhomMau;
            txtCardCCCD.Text = string.IsNullOrEmpty(don.Cccd) ? "---" : don.Cccd;
            txtCardGioiTinh.Text = $"{don.GioiTinh} | {don.NgaySinh}";

            _selectedVolume = don.TheTich > 0 ? don.TheTich.ToString() : "350";
            SetVolume(_selectedVolume);

            EmptyPlaceholder.Visibility = Visibility.Collapsed;
            DonorCard.Visibility = Visibility.Visible;

            EvaluateVitals();
        }

        private void SetVolume(string vol)
        {
            _selectedVolume = vol;
            var activeBg = Brushes.White;
            var activeFg = (Brush)new BrushConverter().ConvertFrom("#e11d48");
            var inactiveBg = (Brush)new BrushConverter().ConvertFrom("#33ffffff");
            var inactiveFg = Brushes.White;

            btnVol250.Background = vol == "250" ? activeBg : inactiveBg;
            btnVol250.Foreground = vol == "250" ? activeFg : inactiveFg;

            btnVol350.Background = vol == "350" ? activeBg : inactiveBg;
            btnVol350.Foreground = vol == "350" ? activeFg : inactiveFg;

            btnVol450.Background = vol == "450" ? activeBg : inactiveBg;
            btnVol450.Foreground = vol == "450" ? activeFg : inactiveFg;
        }

        private void btnVol_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn)
            {
                string text = btn.Content?.ToString() ?? "";
                if (text.Contains("250")) SetVolume("250");
                else if (text.Contains("350")) SetVolume("350");
                else if (text.Contains("450")) SetVolume("450");
            }
        }

        private async Task SearchDon(string maDon)
        {
            if (string.IsNullOrEmpty(maDon))
            {
                MessageBox.Show("Vui lòng nhập Mã Đơn cần tra cứu.", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                btnFind.IsEnabled = false;
                btnFind.Content = "Đang tìm...";

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

                var found = list?.Find(d => d.MaDon != null && d.MaDon.Equals(maDon, StringComparison.OrdinalIgnoreCase));

                // Fallback search to /api/DonDangKy/tat-ca if not found
                if (found == null)
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

                            var target = dons?.Find(d => d.MaDon != null && d.MaDon.Equals(maDon, StringComparison.OrdinalIgnoreCase));
                            if (target != null)
                            {
                                found = new DonChoKhamDto
                                {
                                    MaDon = target.MaDon,
                                    MaTNV = target.MaTNV,
                                    TenTinhNguyenVien = target.HoTenTNV,
                                    NgaySinh = target.TinhNguyenVien?.NgaySinh?.ToString("dd/MM/yyyy") ?? "---",
                                    GioiTinh = target.TinhNguyenVien?.GioiTinh ?? "---",
                                    NhomMau = target.TinhNguyenVien?.NhomMau ?? "Chưa rõ",
                                    SoDienThoai = target.TinhNguyenVien?.SoDienThoai ?? "---",
                                    Cccd = target.TinhNguyenVien?.Cccd ?? "---",
                                    TenChienDich = target.TenChienDich,
                                    TheTich = target.TheTich ?? 350
                                };
                            }
                        }
                    }
                    catch { }
                }

                if (found != null)
                {
                    DisplayDonor(found);
                }
                else
                {
                    MessageBox.Show($"Không tìm thấy Đơn Đăng Ký [{maDon}].", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi kết nối: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnFind.IsEnabled = true;
                btnFind.Content = "Gọi Đơn";
            }
        }

        private async void btnFind_Click(object sender, RoutedEventArgs e)
        {
            await SearchDon(txtMaDonSearch.Text.Trim());
        }

        private async void txtMaDonSearch_KeyUp(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                await SearchDon(txtMaDonSearch.Text.Trim());
            }
        }

        private async void btnTuChoi_Click(object sender, RoutedEventArgs e)
        {
            PanelLyDo.Visibility = Visibility.Visible;
            if (string.IsNullOrEmpty(txtLyDoTuChoi.Text))
            {
                MessageBox.Show("Vui lòng nhập lý do từ chối / tạm hoãn hiến máu.", "Yêu cầu", MessageBoxButton.OK, MessageBoxImage.Warning);
                txtLyDoTuChoi.Focus();
                return;
            }

            await SaveKhamResult(isApproved: false);
        }

        private async void btnPheDuyet_Click(object sender, RoutedEventArgs e)
        {
            PanelLyDo.Visibility = Visibility.Collapsed;
            await SaveKhamResult(isApproved: true);
        }

        private async Task SaveKhamResult(bool isApproved)
        {
            if (_currentDon == null && string.IsNullOrEmpty(_currentMaDon))
            {
                MessageBox.Show("Vui lòng tra cứu hoặc gọi đơn đăng ký TNV trước khi lưu.", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            string maDon = _currentDon?.MaDon ?? _currentMaDon;
            int.TryParse(txtNhipTim.Text.Trim(), out int hr);
            double.TryParse(txtCanNang.Text.Trim(), out double weight);
            double.TryParse(txtNhietDo.Text.Trim(), out double temp);
            int.TryParse(_selectedVolume, out int vol);

            var dto = new
            {
                maDon = maDon,
                huyetAp = txtHuyetAp.Text.Trim(),
                nhipTim = hr > 0 ? hr : 75,
                canNang = weight > 0 ? weight : 60,
                nhietDo = temp > 0 ? temp : 36.8,
                theTichHien = vol > 0 ? vol : 350,
                ketQua = isApproved,
                lyDoTuChoi = isApproved ? "" : txtLyDoTuChoi.Text.Trim()
            };

            try
            {
                btnPheDuyet.IsEnabled = false;
                btnTuChoi.IsEnabled = false;

                var json = JsonConvert.SerializeObject(dto);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PostAsync("/api/khamlamsang", content);
                if (response.IsSuccessStatusCode)
                {
                    string msgTitle = isApproved ? "✅ ĐÃ PHÊ DUYỆT ĐỦ ĐIỀU KIỆN HIẾN MÁU!" : "❌ ĐÃ TỪ CHỐI HIẾN MÁU!";
                    string msgDetail = isApproved ? "Đã lưu kết quả thành công và chuyển đơn sang phòng Thu Nhận Máu!" : "Đã từ chối đơn đăng ký thành công.";
                    MessageBox.Show($"{msgTitle}\n\n{msgDetail}", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);

                    // Reset state
                    _currentDon = null;
                    _currentMaDon = null;
                    DonorCard.Visibility = Visibility.Collapsed;
                    EmptyPlaceholder.Visibility = Visibility.Visible;
                    txtMaDonSearch.Text = "";
                    txtLyDoTuChoi.Text = "";
                    PanelLyDo.Visibility = Visibility.Collapsed;
                }
                else
                {
                    string errJson = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"Lưu thất bại ({response.StatusCode}): {errJson}", "Lỗi server", MessageBoxButton.OK, MessageBoxImage.Error);
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

        private void btnTabNew_Click(object sender, RoutedEventArgs e)
        {
            ViewFormKham.Visibility = Visibility.Visible;
            ViewLichSu.Visibility = Visibility.Collapsed;

            btnTabNew.Background = Brushes.White;
            btnTabNew.Foreground = (Brush)new BrushConverter().ConvertFrom("#be123c");

            btnTabHistory.Background = Brushes.Transparent;
            btnTabHistory.Foreground = Brushes.White;
        }

        private async void btnTabHistory_Click(object sender, RoutedEventArgs e)
        {
            ViewFormKham.Visibility = Visibility.Collapsed;
            ViewLichSu.Visibility = Visibility.Visible;

            btnTabHistory.Background = Brushes.White;
            btnTabHistory.Foreground = (Brush)new BrushConverter().ConvertFrom("#be123c");

            btnTabNew.Background = Brushes.Transparent;
            btnTabNew.Foreground = Brushes.White;

            await LoadLichSu();
        }

        private async void btnRefreshHistory_Click(object sender, RoutedEventArgs e)
        {
            await LoadLichSu();
        }

        private async Task LoadLichSu()
        {
            try
            {
                btnRefreshHistory.IsEnabled = false;
                btnRefreshHistory.Content = "Đang tải...";

                var response = await ApiClient.Instance.Client.GetAsync("/api/khamlamsang/lich-su");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    List<Models.KhamLamSang> list = null;

                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<Models.KhamLamSang>>>(json);
                        if (apiRes != null && apiRes.Data != null) list = apiRes.Data;
                    }
                    catch { }

                    if (list == null)
                    {
                        try { list = JsonConvert.DeserializeObject<List<Models.KhamLamSang>>(json) ?? new List<Models.KhamLamSang>(); } catch { }
                    }

                    dgLichSu.ItemsSource = list;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi kết nối: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnRefreshHistory.IsEnabled = true;
                btnRefreshHistory.Content = "LÀM MỚI";
            }
        }
    }
}
