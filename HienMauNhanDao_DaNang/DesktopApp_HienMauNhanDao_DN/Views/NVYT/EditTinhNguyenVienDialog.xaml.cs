using System;
using System.Net.Http;
using System.Text;
using System.Windows;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Constants;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public partial class EditTinhNguyenVienDialog : Window
    {
        private TinhNguyenVien _tnv;

        public EditTinhNguyenVienDialog(TinhNguyenVien tnv)
        {
            InitializeComponent();
            _tnv = tnv;
            LoadData();
        }

        private void LoadData()
        {
            txtMaTNV.Text = _tnv.MaTNV;
            txtCCCD.Text = _tnv.Cccd;
            txtHoTen.Text = _tnv.HoTen;
            txtSDT.Text = _tnv.SoDienThoai;
            txtDiaChi.Text = _tnv.DiaChi;

            if (_tnv.NgaySinh.HasValue)
            {
                dpNgaySinh.SelectedDate = _tnv.NgaySinh.Value;
            }

            if (!string.IsNullOrEmpty(_tnv.GioiTinh))
            {
                cbGioiTinh.Text = _tnv.GioiTinh;
            }
        }

        private void btnCancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private async void btnSave_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtHoTen.Text) || string.IsNullOrWhiteSpace(txtSDT.Text))
            {
                MessageBox.Show("Vui lòng nhập đủ Họ tên và Số điện thoại.", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            btnSave.IsEnabled = false;
            btnSave.Content = "Đang lưu...";

            try
            {
                var updateRequest = new
                {
                    HoTen = txtHoTen.Text.Trim(),
                    Cccd = _tnv.Cccd,
                    NgaySinh = dpNgaySinh.SelectedDate?.ToString("yyyy-MM-dd"),
                    SoDienThoai = txtSDT.Text.Trim(),
                    DiaChi = txtDiaChi.Text.Trim(),
                    GioiTinh = cbGioiTinh.Text,
                    NhomMau = _tnv.NhomMau
                };

                string json = JsonConvert.SerializeObject(updateRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var url = $"{ApiEndpoints.NVYT.TinhNguyenVien}/{_tnv.MaTNV}";
                var response = await ApiClient.Instance.Client.PutAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show("Cập nhật tình nguyện viên thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    DialogResult = true;
                    Close();
                }
                else
                {
                    var err = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"Lỗi: {response.StatusCode}\n{err}", "Lỗi Cập Nhật", MessageBoxButton.OK, MessageBoxImage.Error);
                    btnSave.IsEnabled = true;
                    btnSave.Content = "Lưu Thay Đổi";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi kết nối: {ex.Message}", "Lỗi Hệ Thống", MessageBoxButton.OK, MessageBoxImage.Error);
                btnSave.IsEnabled = true;
                btnSave.Content = "Lưu Thay Đổi";
            }
        }
    }
}
