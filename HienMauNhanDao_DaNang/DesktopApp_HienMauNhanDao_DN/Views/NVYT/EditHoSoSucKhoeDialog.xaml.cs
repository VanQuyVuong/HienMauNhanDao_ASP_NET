using System;
using System.Net.Http;
using System.Text;
using System.Windows;
using Newtonsoft.Json;
using DesktopApp_HienMauNhanDao_DN.Models;
using DesktopApp_HienMauNhanDao_DN.Services;

namespace DesktopApp_HienMauNhanDao_DN.Views.NVYT
{
    public partial class EditHoSoSucKhoeDialog : Window
    {
        private HoSoSucKhoe _hs;

        public EditHoSoSucKhoeDialog(HoSoSucKhoe hs)
        {
            InitializeComponent();
            _hs = hs;
            LoadData();
        }

        private void LoadData()
        {
            txtMaHoSo.Text = _hs.MaHoSo;
            txtMaDon.Text = _hs.MaDon;

            if (_hs.DauHong == true) rbQ1_Yes.IsChecked = true; else rbQ1_No.IsChecked = true;
            if (_hs.KhangSinh == true) rbQ2_Yes.IsChecked = true; else rbQ2_No.IsChecked = true;
            if (_hs.TruyenNhiem == true) rbQ3_Yes.IsChecked = true; else rbQ3_No.IsChecked = true;
            if (_hs.CoThai == true) rbQ4_Yes.IsChecked = true; else rbQ4_No.IsChecked = true;

            txtMoTaKhac.Text = _hs.MoTaKhac;
        }

        private void btnCancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private async void btnSave_Click(object sender, RoutedEventArgs e)
        {
            btnSave.IsEnabled = false;
            btnSave.Content = "Đang lưu...";

            try
            {
                var payload = new
                {
                    maDon = _hs.MaDon,
                    dauHong = rbQ1_Yes.IsChecked == true,
                    khangSinh = rbQ2_Yes.IsChecked == true,
                    truyenNhiem = rbQ3_Yes.IsChecked == true,
                    coThai = rbQ4_Yes.IsChecked == true,
                    moTaKhac = txtMoTaKhac.Text.Trim()
                };

                var json = JsonConvert.SerializeObject(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await ApiClient.Instance.Client.PutAsync($"/api/hososuckhoe/{_hs.MaHoSo}", content);
                if (response.IsSuccessStatusCode)
                {
                    MessageBox.Show("Cập nhật khai báo y tế thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    DialogResult = true;
                    Close();
                }
                else
                {
                    var err = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"Lỗi lưu khai báo: {err}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    btnSave.IsEnabled = true;
                    btnSave.Content = "Lưu Thay Đổi";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                btnSave.IsEnabled = true;
                btnSave.Content = "Lưu Thay Đổi";
            }
        }
    }
}
