using System;
using System.Collections.Generic;
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
    public partial class WalkInRegistrationDialog : Window
    {
        private TinhNguyenVien _currentTnv;
        private List<ChienDich> _chienDichs = new List<ChienDich>();

        public WalkInRegistrationDialog()
        {
            InitializeComponent();
            LoadChienDich();
        }

        private async void LoadChienDich()
        {
            try
            {
                var response = await ApiClient.Instance.Client.GetAsync("/api/chiendich");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    try
                    {
                        var JObj = Newtonsoft.Json.Linq.JObject.Parse(json);
                        var dataToken = JObj["data"] ?? JObj;
                        _chienDichs = JsonConvert.DeserializeObject<List<ChienDich>>(dataToken.ToString()) ?? new List<ChienDich>();
                    }
                    catch
                    {
                        _chienDichs = JsonConvert.DeserializeObject<List<ChienDich>>(json) ?? new List<ChienDich>();
                    }

                    cbChienDich.ItemsSource = _chienDichs;
                    cbChienDich.DisplayMemberPath = "TenChienDich";
                    cbChienDich.SelectedValuePath = "MaChienDich";
                }

            }
            catch { }
        }

        private async void btnSearch_Click(object sender, RoutedEventArgs e)
        {
            string cccd = txtCCCD.Text.Trim();
            if (string.IsNullOrEmpty(cccd) || cccd.Length != 12)
            {
                txtStatus.Text = "CCCD phải gồm 12 số!";
                txtStatus.Foreground = System.Windows.Media.Brushes.Red;
                txtStatus.Visibility = Visibility.Visible;
                return;
            }

            btnSearch.IsEnabled = false;
            txtStatus.Text = "Đang tìm...";
            txtStatus.Foreground = System.Windows.Media.Brushes.Gray;
            txtStatus.Visibility = Visibility.Visible;
            FormPanel.Visibility = Visibility.Collapsed;
            NewTNVPanel.Visibility = Visibility.Collapsed;
            _currentTnv = null;

            try
            {
                var response = await ApiClient.Instance.Client.GetAsync($"/api/tinhnguyenvien/cccd/{cccd}");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    dynamic apiRes = JsonConvert.DeserializeObject(json);
                    
                    if (apiRes != null && apiRes.data != null)
                    {
                        _currentTnv = JsonConvert.DeserializeObject<TinhNguyenVien>(apiRes.data.ToString());
                        txtTNVName.Text = $"{_currentTnv.HoTen} - {_currentTnv.Cccd}";
                        
                        if (apiRes.duDieuKien != null && apiRes.duDieuKien == false)
                        {
                            txtStatus.Text = apiRes.thongBao != null ? apiRes.thongBao.ToString() : "TNV chưa đủ thời gian 84 ngày!";
                            txtStatus.Foreground = System.Windows.Media.Brushes.Orange;
                        }
                        else
                        {
                            txtStatus.Text = "Tìm thấy TNV. Đủ điều kiện hiến máu.";
                            txtStatus.Foreground = System.Windows.Media.Brushes.Green;
                        }

                        FormPanel.Visibility = Visibility.Visible;
                        btnSave.IsEnabled = true;
                    }
                    else
                    {
                        ShowNewTNVForm();
                    }
                }
                else
                {
                    ShowNewTNVForm();
                }
            }
            catch
            {
                ShowNewTNVForm();
            }
            finally
            {
                btnSearch.IsEnabled = true;
            }
        }

        private void ShowNewTNVForm()
        {
            txtStatus.Text = "Chưa có hồ sơ trong hệ thống.";
            txtStatus.Foreground = System.Windows.Media.Brushes.Orange;
            txtTNVName.Text = "Tạo Hồ Sơ Mới";
            NewTNVPanel.Visibility = Visibility.Visible;
            FormPanel.Visibility = Visibility.Visible;
            btnSave.IsEnabled = true;
        }

        private void cbLoaiHinh_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (PanelChienDich == null) return;

            if (cbLoaiHinh.SelectedItem is ComboBoxItem item && item.Tag?.ToString() == "ChienDich")
            {
                PanelChienDich.Visibility = Visibility.Visible;
            }
            else
            {
                PanelChienDich.Visibility = Visibility.Collapsed;
            }
        }

        private void btnCancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private async void btnSave_Click(object sender, RoutedEventArgs e)
        {
            if (_currentTnv == null)
            {
                if (string.IsNullOrEmpty(txtNewHoTen.Text) || string.IsNullOrEmpty(txtNewSDT.Text) || !dpNewNgaySinh.SelectedDate.HasValue)
                {
                    MessageBox.Show("Vui lòng điền đủ Họ tên, SĐT và Ngày sinh cho TNV mới.", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }
            }

            string maChienDich = "CD00004"; // Mặc định Thường xuyên
            if (cbLoaiHinh.SelectedItem is ComboBoxItem item && item.Tag?.ToString() == "ChienDich")
            {
                if (cbChienDich.SelectedValue == null)
                {
                    MessageBox.Show("Vui lòng chọn Chiến dịch.", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }
                maChienDich = cbChienDich.SelectedValue.ToString();
            }

            btnSave.IsEnabled = false;
            btnSave.Content = "Đang xử lý...";

            try
            {
                string hoTen = _currentTnv?.HoTen ?? txtNewHoTen.Text.Trim();
                string cccd = _currentTnv?.Cccd ?? txtCCCD.Text.Trim();

                int theTich = 350;
                if (cbTheTich.SelectedItem is ComboBoxItem tItem)
                {
                    int.TryParse(tItem.Content.ToString(), out theTich);
                }

                // Nếu là TNV mới, tạo TNV trước nhưng API hiện tại chưa hỗ trợ API riêng?
                // Chúng ta sẽ gửi thẳng lên /dondangky/tiep-nhan vì backend có thể tự tạo TNV nếu cccd chưa có.
                
                var payload = new
                {
                    maTNV = _currentTnv?.MaTNV,
                    cccd = cccd,
                    hoTen = hoTen,
                    soDienThoai = _currentTnv?.SoDienThoai ?? txtNewSDT.Text.Trim(),
                    ngaySinh = dpNewNgaySinh.SelectedDate?.ToString("yyyy-MM-dd"), // Backend may or may not map this in tiep-nhan
                    maChienDich = maChienDich,
                    theTich = theTich
                };

                var json = JsonConvert.SerializeObject(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // 1. Tạo đơn (Walk-in)
                var response = await ApiClient.Instance.Client.PostAsync("/api/dondangky/tiep-nhan", content);
                if (response.IsSuccessStatusCode)
                {
                    var resJson = await response.Content.ReadAsStringAsync();
                    var savedDon = JsonConvert.DeserializeObject<DonDangKy>(resJson);

                    // 2. Tạo Hồ sơ sức khỏe sơ lược
                    if (savedDon != null && !string.IsNullOrEmpty(savedDon.MaDon))
                    {
                        try
                        {
                            var healthPayload = new
                            {
                                maDon = savedDon.MaDon,
                                dauHong = cbQ1.IsChecked == true,
                                khangSinh = cbQ2.IsChecked == true,
                                truyenNhiem = cbQ3.IsChecked == true,
                                coThai = cbQ4.IsChecked == true,
                                moTaKhac = "Tiếp nhận trực tiếp (Walk-in) tại quầy lễ tân"
                            };
                            var healthJson = JsonConvert.SerializeObject(healthPayload);
                            var healthContent = new StringContent(healthJson, Encoding.UTF8, "application/json");
                            await ApiClient.Instance.Client.PostAsync("/api/hososuckhoe", healthContent);
                        }
                        catch { }
                    }

                    MessageBox.Show("Tiếp nhận thành công. Hồ sơ đã chuyển sang Bác Sĩ khám lâm sàng!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    DialogResult = true;
                    Close();
                }
                else
                {
                    var err = await response.Content.ReadAsStringAsync();
                    MessageBox.Show($"Lỗi tạo đơn: {err}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    btnSave.IsEnabled = true;
                    btnSave.Content = "Hoàn Tất Tiếp Nhận";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                btnSave.IsEnabled = true;
                btnSave.Content = "Hoàn Tất Tiếp Nhận";
            }
        }
    }
}
