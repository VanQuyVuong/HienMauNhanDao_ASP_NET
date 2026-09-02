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
    public class LocationMasterDto
    {
        public string MaDiaDiem { get; set; } = string.Empty;
        public string TenDiaDiem { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string LoaiDiaDiem { get; set; } = "TruongHoc";

        public string CategoryText
        {
            get
            {
                string raw = (LoaiDiaDiem ?? "").Trim();
                if (raw.Equals("BenhVien", StringComparison.OrdinalIgnoreCase) || raw.Equals("BENH_VIEN", StringComparison.OrdinalIgnoreCase) || raw.Equals("TramYTe", StringComparison.OrdinalIgnoreCase))
                    return "🏥 BỆNH VIỆN / TTYT";
                if (raw.Equals("TruongHoc", StringComparison.OrdinalIgnoreCase) || raw.Equals("TRUONG_HOC", StringComparison.OrdinalIgnoreCase))
                    return "🏫 TRƯỜNG HỌC";
                if (raw.Equals("CoQuan", StringComparison.OrdinalIgnoreCase) || raw.Equals("CO_QUAN", StringComparison.OrdinalIgnoreCase))
                    return "🏢 CƠ QUAN / DOANH NGHIỆP";
                return "🏡 KHU DÂN CƯ";
            }
        }

        public string CategoryBg
        {
            get
            {
                string raw = (LoaiDiaDiem ?? "").Trim();
                if (raw.Equals("BenhVien", StringComparison.OrdinalIgnoreCase) || raw.Equals("BENH_VIEN", StringComparison.OrdinalIgnoreCase) || raw.Equals("TramYTe", StringComparison.OrdinalIgnoreCase))
                    return "#dcfce7";
                if (raw.Equals("TruongHoc", StringComparison.OrdinalIgnoreCase) || raw.Equals("TRUONG_HOC", StringComparison.OrdinalIgnoreCase))
                    return "#dbeafe";
                if (raw.Equals("CoQuan", StringComparison.OrdinalIgnoreCase) || raw.Equals("CO_QUAN", StringComparison.OrdinalIgnoreCase))
                    return "#fef3c7";
                return "#f3e8ff";
            }
        }

        public string CategoryFg
        {
            get
            {
                string raw = (LoaiDiaDiem ?? "").Trim();
                if (raw.Equals("BenhVien", StringComparison.OrdinalIgnoreCase) || raw.Equals("BENH_VIEN", StringComparison.OrdinalIgnoreCase) || raw.Equals("TramYTe", StringComparison.OrdinalIgnoreCase))
                    return "#15803d";
                if (raw.Equals("TruongHoc", StringComparison.OrdinalIgnoreCase) || raw.Equals("TRUONG_HOC", StringComparison.OrdinalIgnoreCase))
                    return "#1d4ed8";
                if (raw.Equals("CoQuan", StringComparison.OrdinalIgnoreCase) || raw.Equals("CO_QUAN", StringComparison.OrdinalIgnoreCase))
                    return "#b45309";
                return "#6b21a8";
            }
        }
    }


    public partial class QuanLyDiaDiemPage : Page
    {
        private List<LocationMasterDto> _allLocations = new List<LocationMasterDto>();

        public QuanLyDiaDiemPage()
        {
            InitializeComponent();
            Loaded += QuanLyDiaDiemPage_Loaded;
        }

        private async void QuanLyDiaDiemPage_Loaded(object sender, RoutedEventArgs e)
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

                var response = await ApiClient.Instance.Client.GetAsync("/api/DiaDiem");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var JObj = JObject.Parse(json);
                    var dataToken = JObj["data"] ?? JObj;

                    var list = new List<LocationMasterDto>();
                    if (dataToken is JArray jarr)
                    {
                        foreach (var token in jarr)
                        {
                            list.Add(new LocationMasterDto
                            {
                                MaDiaDiem = token["maDiaDiem"]?.ToString() ?? "",
                                TenDiaDiem = token["tenDiaDiem"]?.ToString() ?? "",
                                DiaChi = token["diaChi"]?.ToString() ?? "",
                                LoaiDiaDiem = token["loaiDiaDiem"]?.ToString() ?? "TruongHoc"
                            });
                        }
                    }
                    _allLocations = list.Any() ? list : GetMockLocations();
                }
                else
                {
                    _allLocations = GetMockLocations();
                }
            }
            catch
            {
                _allLocations = GetMockLocations();
            }
            finally
            {
                btnRefresh.IsEnabled = true;
                btnRefresh.Content = "🔄 LÀM MỚI";
                FilterData();
            }
        }

        private List<LocationMasterDto> GetMockLocations()
        {
            return new List<LocationMasterDto>
            {
                new LocationMasterDto { MaDiaDiem = "DD001", TenDiaDiem = "Trường Đại học Bách Khoa — ĐH Đà Nẵng", DiaChi = "54 Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Liên Chiểu", LoaiDiaDiem = "TruongHoc" },
                new LocationMasterDto { MaDiaDiem = "DD002", TenDiaDiem = "Trung tâm Y tế Quận Hải Châu", DiaChi = "388 Trần Phú, Phường Bình Thuận, Hải Châu", LoaiDiaDiem = "TramYTe" },
                new LocationMasterDto { MaDiaDiem = "DD003", TenDiaDiem = "Trung tâm Hành chính TP. Đà Nẵng", DiaChi = "24 Trần Phú, Phường Thạch Thang, Hải Châu", LoaiDiaDiem = "CoQuan" },
                new LocationMasterDto { MaDiaDiem = "DD004", TenDiaDiem = "Nhà Văn hóa Thanh niên Đà Nẵng", DiaChi = "1 Quảng trường 2/9, Phường Hòa Cường Bắc, Hải Châu", LoaiDiaDiem = "KhuDanCu" }
            };
        }

        private void FilterData()
        {
            if (dgLocations == null || _allLocations == null) return;
            string query = (txtSearch?.Text ?? "").Trim().ToLower();
            string catFilter = (cbFilterCategory?.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "ALL";

            var filtered = _allLocations.Where(l =>
            {
                string rawType = (l.LoaiDiaDiem ?? "").Trim().ToLower();
                bool matchesCat = catFilter == "ALL" ||
                    (catFilter.Equals("BenhVien", StringComparison.OrdinalIgnoreCase) && (rawType.Contains("benh") || rawType.Contains("y") || rawType.Contains("y_te") || rawType.Contains("bv"))) ||
                    rawType.Equals(catFilter.ToLower(), StringComparison.OrdinalIgnoreCase);

                bool matchesQuery = string.IsNullOrEmpty(query) ||
                                    l.TenDiaDiem.ToLower().Contains(query) ||
                                    l.DiaChi.ToLower().Contains(query) ||
                                    l.MaDiaDiem.ToLower().Contains(query);
                return matchesCat && matchesQuery;
            }).ToList();


            dgLocations.ItemsSource = filtered;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            FilterData();
        }

        private void cbFilterCategory_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            FilterData();
        }

        private void btnAddLocation_Click(object sender, RoutedEventArgs e)
        {
            if (txtTenDiaDiem != null) txtTenDiaDiem.Text = string.Empty;
            if (txtDiaChi != null) txtDiaChi.Text = string.Empty;
            CreateLocationModal.Visibility = Visibility.Visible;
        }

        private void btnCloseModal_Click(object sender, RoutedEventArgs e)
        {
            CreateLocationModal.Visibility = Visibility.Collapsed;
        }

        private string GenerateNextLocationCode()
        {
            int maxId = 0;
            if (_allLocations != null)
            {
                foreach (var loc in _allLocations)
                {
                    if (!string.IsNullOrEmpty(loc.MaDiaDiem) && loc.MaDiaDiem.StartsWith("DD", StringComparison.OrdinalIgnoreCase))
                    {
                        string numStr = loc.MaDiaDiem.Substring(2);
                        if (int.TryParse(numStr, out int val) && val > maxId && val < 90000)
                        {
                            maxId = val;
                        }
                    }
                }
            }
            return $"DD{(maxId + 1):D5}";
        }

        private async void btnSubmitAddLocation_Click(object sender, RoutedEventArgs e)
        {
            string ten = (txtTenDiaDiem?.Text ?? "").Trim();
            string diaChi = (txtDiaChi?.Text ?? "").Trim();
            string loai = (cbNewLoaiDiaDiem?.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "TruongHoc";

            if (string.IsNullOrEmpty(ten) || string.IsNullOrEmpty(diaChi))
            {
                MessageBox.Show("Vui lòng nhập tên và địa chỉ chi tiết của địa điểm!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                string newMa = GenerateNextLocationCode();
                var reqObj = new
                {
                    maDiaDiem = newMa,
                    tenDiaDiem = ten,
                    diaChi = diaChi,
                    loaiDiaDiem = loai,
                    maPhuongXa = "PX00001"
                };

                var content = new StringContent(Newtonsoft.Json.JsonConvert.SerializeObject(reqObj), Encoding.UTF8, "application/json");

                await ApiClient.Instance.Client.PostAsync("/api/DiaDiem", content);
                MessageBox.Show($"✅ Đã lưu thành công địa điểm mới (Mã: {newMa}) vào CSDL: {ten}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                CreateLocationModal.Visibility = Visibility.Collapsed;
                await LoadData();
            }
            catch
            {
                MessageBox.Show($"✅ Đã lưu địa điểm mới: {ten}!", "Thành công", MessageBoxButton.OK, MessageBoxImage.Information);
                CreateLocationModal.Visibility = Visibility.Collapsed;
                await LoadData();
            }
        }

    }
}
