using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Constants;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public partial class KhaiBaoYTePage : Page
    {
        public KhaiBaoYTePage()
        {
            InitializeComponent();
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await LoadDanhSachHoSo();
        }

        // --- TAB 1: KHAI BÁO MỚI ---

        private async void btnCheckMaDon_Click(object sender, RoutedEventArgs e)
        {
            var maDon = txtMaDon.Text.Trim();
            if (string.IsNullOrEmpty(maDon))
            {
                txtStatus.Text = "Vui lòng nhập mã đơn!";
                txtStatus.Foreground = System.Windows.Media.Brushes.Red;
                return;
            }

            btnCheckMaDon.IsEnabled = false;
            txtStatus.Text = "Đang kiểm tra...";
            txtStatus.Foreground = System.Windows.Media.Brushes.Gray;
            FormKhaiBao.Visibility = Visibility.Collapsed;

            try
            {
                // GET /hososuckhoe/don/{maDon}
                var response = await ApiClient.Instance.Client.GetAsync($"/api/hososuckhoe/don/{maDon}");
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    if (!string.IsNullOrEmpty(result) && result != "null")
                    {
                        txtStatus.Text = "Đã có khai báo y tế cho đơn này!";
                        txtStatus.Foreground = System.Windows.Media.Brushes.Orange;
                    }
                    else
                    {
                        txtStatus.Text = "Mã đơn hợp lệ. Sẵn sàng khai báo.";
                        txtStatus.Foreground = System.Windows.Media.Brushes.Green;
                        FormKhaiBao.Visibility = Visibility.Visible;
                    }
                }
                else
                {
                    txtStatus.Text = "Không tìm thấy mã đơn hoặc có lỗi xảy ra.";
                    txtStatus.Foreground = System.Windows.Media.Brushes.Red;
                }
            }
            catch (Exception ex)
            {
                txtStatus.Text = $"Lỗi: {ex.Message}";
                txtStatus.Foreground = System.Windows.Media.Brushes.Red;
            }
            finally
            {
                btnCheckMaDon.IsEnabled = true;
            }
        }

        private async void btnSubmitKhaiBao_Click(object sender, RoutedEventArgs e)
        {
            if (cbCamDoan.IsChecked != true)
            {
                MessageBox.Show("Vui lòng xác nhận cam đoan thông tin!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            btnSubmitKhaiBao.IsEnabled = false;
            btnSubmitKhaiBao.Content = "Đang lưu...";

            try
            {
                var payload = new
                {
                    maDon = txtMaDon.Text.Trim(),
                    dauHong = rbQ1_Yes.IsChecked == true,
                    khangSinh = rbQ2_Yes.IsChecked == true,
                    truyenNhiem = rbQ3_Yes.IsChecked == true,
                    coThai = rbQ4_Yes.IsChecked == true,
                    moTaKhac = txtMoTaKhac.Text.Trim()
                };

                var json = JsonConvert.SerializeObject(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PostAsync("/api/hososuckhoe", content);
                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show("Đã lưu khai báo y tế thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    ResetFormKhaiBao();
                    await LoadDanhSachHoSo();
                }
                else
                {
                    var err = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"Lỗi lưu khai báo: {err}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                btnSubmitKhaiBao.IsEnabled = true;
                btnSubmitKhaiBao.Content = "LƯU KHAI BÁO Y TẾ";
            }
        }

        private void ResetFormKhaiBao()
        {
            txtMaDon.Text = "";
            txtStatus.Text = "";
            rbQ1_No.IsChecked = true;
            rbQ2_No.IsChecked = true;
            rbQ3_No.IsChecked = true;
            rbQ4_No.IsChecked = true;
            txtMoTaKhac.Text = "";
            cbCamDoan.IsChecked = false;
            FormKhaiBao.Visibility = Visibility.Collapsed;
        }


        // --- TAB 2: DANH SÁCH KHAI BÁO ---

        private async void btnRefreshList_Click(object sender, RoutedEventArgs e)
        {
            await LoadDanhSachHoSo();
        }

        private async Task LoadDanhSachHoSo()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/hososuckhoe/tat-ca");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    
                    List<HoSoSucKhoe> _allHoSo = null;

                    try
                    {
                        var apiRes = JsonConvert.DeserializeObject<ApiResponse<List<HoSoSucKhoe>>>(json);
                        if (apiRes != null && apiRes.Data != null)
                        {
                            _allHoSo = apiRes.Data;
                        }
                    }
                    catch { }

                    if (_allHoSo == null || _allHoSo.Count == 0)
                    {
                        try
                        {
                            var paginated = JsonConvert.DeserializeObject<PaginatedResponse<HoSoSucKhoe>>(json);
                            if (paginated != null && paginated.Content != null)
                            {
                                _allHoSo = paginated.Content;
                            }
                        }
                        catch { }
                    }

                    if (_allHoSo == null || _allHoSo.Count == 0)
                    {
                        try { _allHoSo = JsonConvert.DeserializeObject<List<HoSoSucKhoe>>(json) ?? new List<HoSoSucKhoe>(); } catch { }
                    }
                    
                    if (_allHoSo != null)
                    {
                        dgHoSo.ItemsSource = _allHoSo;
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi kết nối: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void btnEditHoSo_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is HoSoSucKhoe hs)
            {
                var dialog = new EditHoSoSucKhoeDialog(hs);
                dialog.Owner = Window.GetWindow(this);
                if (dialog.ShowDialog() == true)
                {
                    _ = LoadDanhSachHoSo();
                }
            }
        }

        private async void btnDeleteHoSo_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.DataContext is HoSoSucKhoe hs)
            {
                var result = MessageBox.Show($"Xác nhận xóa hồ sơ {hs.MaHoSo} của đơn {hs.MaDon}?", "Xóa", MessageBoxButton.YesNo, MessageBoxImage.Warning);
                if (result == MessageBoxResult.Yes)
                {
                    try
                    {
                        var response = await ApiClient.Instance.Client.DeleteAsync($"/api/hososuckhoe/{hs.MaHoSo}");
                        if (response.IsSuccessStatusCode)
                        {
                            MessageBox.Show("Xóa thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                            await LoadDanhSachHoSo();
                        }
                        else
                        {
                            MessageBox.Show("Lỗi xóa hồ sơ.", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                        }
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Lỗi kết nối: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
        }
    }

    // Converters for UI
    public class BoolToYesNoConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return (value is bool b && b) ? "Có" : "Không";
        }
        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) => throw new NotImplementedException();
    }

    public class BoolToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return (value is bool b && b) ? System.Windows.Media.Brushes.Red : System.Windows.Media.Brushes.Green;
        }
        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture) => throw new NotImplementedException();
    }
}
