using System;
using System.Net.Http;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;
using DesktopApp_HienMauNhanDao_DN.Constants;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public partial class TiepNhanQuayDialog : Window
    {
        private DonDangKy _don;

        public TiepNhanQuayDialog(DonDangKy don)
        {
            InitializeComponent();
            _don = don;
            LoadData();
        }

        private void LoadData()
        {
            txtMaDon.Text = $"Mã đơn: {_don.MaDon}";
            txtHoTen.Text = _don.HoTenTNV;
            
            // Because DonDangKy might not have all TNV details directly if not eager loaded,
            // we display what we have or placeholder.
            txtSDT.Text = _don.TinhNguyenVien?.SoDienThoai ?? "---";
            txtCCCD.Text = _don.TinhNguyenVien?.Cccd ?? "---";

            if (_don.TheTich.HasValue)
            {
                var targetContent = $"{_don.TheTich.Value} ml";
                foreach (ComboBoxItem item in cbTheTich.Items)
                {
                    if (item.Content.ToString() == targetContent)
                    {
                        item.IsSelected = true;
                        break;
                    }
                }
            }
        }

        private void btnCancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private async void btnSave_Click(object sender, RoutedEventArgs e)
        {
            btnSave.IsEnabled = false;
            btnSave.Content = "Đang xử lý...";

            try
            {
                int theTich = 350;
                if (cbTheTich.SelectedItem is ComboBoxItem selectedItem)
                {
                    string val = selectedItem.Content.ToString().Replace("ml", "").Trim();
                    int.TryParse(val, out theTich);
                }

                var payload = new
                {
                    maTNV = _don.MaTNV,
                    maChienDich = _don.MaChienDich,
                    theTich = theTich
                };

                var json = JsonConvert.SerializeObject(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // 1. Cập nhật Đơn (Tiếp Nhận)
                var response = await ApiClient.Instance.Client.PostAsync("/api/dondangky/tiep-nhan", content);
                if (response.IsSuccessStatusCode)
                {
                    // 2. Tạo Hồ sơ sức khỏe sơ lược
                    try
                    {
                        var healthPayload = new
                        {
                            maDon = _don.MaDon,
                            dauHong = rbRuouBia_Yes.IsChecked == true, // Câu 3 map qua DauHong/TruyenNhiem như logic web, hoặc giữ nguyên
                            khangSinh = rbManTinh_Yes.IsChecked == true,
                            truyenNhiem = rbXamHinh_Yes.IsChecked == true,
                            coThai = rbCoThai_Yes.IsChecked == true,
                            moTaKhac = string.IsNullOrEmpty(txtMoTaKhac.Text) ? "NVYT đã kiểm tra sơ lược sức khỏe lúc tiếp nhận tại quầy lễ tân." : txtMoTaKhac.Text
                        };
                        var healthJson = JsonConvert.SerializeObject(healthPayload);
                        var healthContent = new StringContent(healthJson, Encoding.UTF8, "application/json");
                        await ApiClient.Instance.Client.PostAsync("/api/hososuckhoe", healthContent);
                    }
                    catch { }

                    MessageBox.Show("Xác nhận tiếp nhận thành công. Đã chuyển hồ sơ sang Bác Sĩ khám lâm sàng!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    DialogResult = true;
                    Close();
                }
                else
                {
                    var err = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"Lỗi tiếp nhận: {err}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    btnSave.IsEnabled = true;
                    btnSave.Content = "Xác Nhận Tiếp Nhận";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                btnSave.IsEnabled = true;
                btnSave.Content = "Xác Nhận Tiếp Nhận";
            }
        }
    }
}
