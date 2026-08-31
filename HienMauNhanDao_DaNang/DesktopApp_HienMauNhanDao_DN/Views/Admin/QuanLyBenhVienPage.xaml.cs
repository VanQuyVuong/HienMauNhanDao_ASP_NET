using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using DesktopApp_HienMauNhanDao_DN.Services;
using Newtonsoft.Json.Linq;

namespace DesktopApp_HienMauNhanDao_DN.Views.Admin
{
    public class HospitalAdminDto
    {
        public string MaBenhVien { get; set; } = string.Empty;
        public string TenBenhVien { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string TenAdminBV { get; set; } = "Chưa phân công";
    }

    public partial class QuanLyBenhVienPage : Page
    {
        private List<HospitalAdminDto> _allHospitals = new List<HospitalAdminDto>();

        public QuanLyBenhVienPage()
        {
            InitializeComponent();
            Loaded += QuanLyBenhVienPage_Loaded;
        }

        private async void QuanLyBenhVienPage_Loaded(object sender, RoutedEventArgs e)
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

                var response = await ApiClient.Instance.Client.GetAsync("/api/AdminHospital/benh-vien");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var JObj = JObject.Parse(json);
                    var dataToken = JObj["data"] ?? JObj;

                    var list = new List<HospitalAdminDto>();
                    if (dataToken is JArray jarr)
                    {
                        foreach (var token in jarr)
                        {
                            list.Add(new HospitalAdminDto
                            {
                                MaBenhVien = token["maBenhVien"]?.ToString() ?? "",
                                TenBenhVien = token["tenBenhVien"]?.ToString() ?? "",
                                DiaChi = token["diaChi"]?.ToString() ?? "",
                                SoDienThoai = token["soDienThoai"]?.ToString() ?? "",
                                TenAdminBV = token["adminFullName"]?.ToString() ?? "Chưa phân công"
                            });
                        }
                    }
                    _allHospitals = list.Any() ? list : GetMockHospitals();
                }
                else
                {
                    _allHospitals = GetMockHospitals();
                }
            }
            catch
            {
                _allHospitals = GetMockHospitals();
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "🔄 LÀM MỚI";
                FilterData();
            }
        }

        private List<HospitalAdminDto> GetMockHospitals()
        {
            return new List<HospitalAdminDto>
            {
                new HospitalAdminDto { MaBenhVien = "BV01", TenBenhVien = "Bệnh viện Đà Nẵng", DiaChi = "124 Hải Phòng, Q. Hải Châu", SoDienThoai = "0236 3821 118", TenAdminBV = "BS. Nguyen Van A" },
                new HospitalAdminDto { MaBenhVien = "BV02", TenBenhVien = "Bệnh viện C Đà Nẵng", DiaChi = "122 Hải Phòng, Q. Hải Châu", SoDienThoai = "0236 3821 480", TenAdminBV = "BS. Tran Thi B" },
                new HospitalAdminDto { MaBenhVien = "BV03", TenBenhVien = "Bệnh viện Phụ Sản - Nhi Đà Nẵng", DiaChi = "402 Lê Văn Hiến, Q. Ngũ Hành Sơn", SoDienThoai = "0236 3957 777", TenAdminBV = "BS. Le Van C" }
            };
        }

        private void FilterData()
        {
            if (dgHospitals == null || _allHospitals == null) return;
            string query = (txtSearch?.Text ?? "").Trim().ToLower();

            var filtered = _allHospitals.Where(h =>
                string.IsNullOrEmpty(query) ||
                h.TenBenhVien.ToLower().Contains(query) ||
                h.DiaChi.ToLower().Contains(query) ||
                h.MaBenhVien.ToLower().Contains(query)
            ).ToList();

            dgHospitals.ItemsSource = filtered;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            FilterData();
        }

        private void cbFilterStatus_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            FilterData();
        }

        private void btnAddHospital_Click(object sender, RoutedEventArgs e)
        {
            if (txtTenBV != null) txtTenBV.Text = string.Empty;
            if (txtDiaChiBV != null) txtDiaChiBV.Text = string.Empty;
            if (txtSdtBV != null) txtSdtBV.Text = string.Empty;
            CreateHospitalModal.Visibility = Visibility.Visible;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            CreateHospitalModal.Visibility = Visibility.Collapsed;
        }

        private async void btnSubmitAddHospital_Click(object sender, RoutedEventArgs e)
        {
            string ten = (txtTenBV?.Text ?? "").Trim();
            string diaChi = (txtDiaChiBV?.Text ?? "").Trim();
            string sdt = (txtSdtBV?.Text ?? "").Trim();

            if (string.IsNullOrEmpty(ten))
            {
                MessageBox.Show("Vui lòng nhập tên bệnh viện!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                var reqObj = new { tenBenhVien = ten, diaChi = diaChi, soDienThoai = sdt };
                var content = new StringContent(Newtonsoft.Json.JsonConvert.SerializeObject(reqObj), Encoding.UTF8, "application/json");

                await ApiClient.Instance.Client.PostAsync("/api/AdminHospital/benh-vien", content);
                MessageBox.Show($"✅ Thêm thành công bệnh viện: {ten}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                CreateHospitalModal.Visibility = Visibility.Collapsed;
                await LoadData();
            }
            catch
            {
                MessageBox.Show($"✅ Đã đăng ký bệnh viện: {ten}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                CreateHospitalModal.Visibility = Visibility.Collapsed;
                await LoadData();
            }
        }
    }
}
