import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import {
  chienDichService,
  diaDiemService,
} from "../../services/chienDichService";
import { uploadService } from "../../services/uploadService";
import { donDangKyService } from "../../services/donDangKy";
import { phuongXaService } from "../../services/phuongXaService";
import { getApiError } from "../../utils/apiHelper";

const toImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  const name = String(imageUrl)
    .replace(/^\/images\//, "")
    .replace(/^images\//, "");
  return `https://localhost:7004/images/${name}`;
};

const STATUS_OPTIONS = [
  { value: "ChuaBatDau", label: "Đã mở đăng ký (Chưa diễn ra)" },
  { value: "DangDienRa", label: "Đang diễn ra (Thực hiện thu nhận máu)" },
  { value: "DaKetThuc", label: "Đã kết thúc" },
  { value: "DaHuy", label: "Đã hủy / Tạm hoãn" },
];

const getStatusLabel = (status) => {
  const s = String(status || "").trim();
  if (
    s === "ChuaBatDau" ||
    s.includes("lập kế hoạch") ||
    s.includes("phê duyệt") ||
    s.includes("mở")
  ) {
    return "Đã mở đăng ký";
  }
  if (s === "DangDienRa" || (s.includes("diễn ra") && !s.includes("kết"))) {
    return "Đang diễn ra";
  }
  if (s === "DaKetThuc" || s.includes("kết thúc")) {
    return "Đã kết thúc";
  }
  if (s === "DaHuy" || s.includes("hủy")) {
    return "Đã hủy";
  }
  return "Đã mở đăng ký";
};

const toBackendStatus = (status) => {
  const s = String(status || "").trim();
  if (s === "DangDienRa" || (s.includes("diễn ra") && !s.includes("kết")))
    return "DangDienRa";
  if (s === "DaKetThuc" || s.includes("kết thúc")) return "DaKetThuc";
  if (s === "DaHuy" || s.includes("hủy")) return "DaHuy";
  return "ChuaBatDau";
};

const calcStatusByTime = (bdVal, ktVal) => {
  if (!bdVal || !ktVal) return "ChuaBatDau";
  const now = new Date();
  const bd = new Date(bdVal);
  const kt = new Date(ktVal);
  if (isNaN(bd.getTime()) || isNaN(kt.getTime())) return "ChuaBatDau";
  if (now < bd) return "ChuaBatDau";
  if (now >= bd && now <= kt) return "DangDienRa";
  return "DaKetThuc";
};

const statusBadge = (status) => {
  const label = getStatusLabel(status);
  if (label === "Đang diễn ra") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-xs shadow-emerald-500/10";
  }
  if (label === "Đã mở đăng ký") {
    return "bg-blue-100 text-blue-700 border-blue-200 shadow-xs shadow-blue-500/10";
  }
  if (label === "Đã kết thúc") {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }
  if (label === "Đã hủy") {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }
  return "bg-blue-100 text-blue-700 border-blue-200";
};

const toDatetimeLocal = (val) => {
  if (!val) return "";
  return String(val).replace(" ", "T").slice(0, 16);
};

const fromDatetimeLocal = (val) => {
  if (!val) return null;
  return val; // Giữ nguyên định dạng chuẩn ISO 8601 (có chữ T) để C# không bị lỗi binding
};

const DANANG_GIS_PLACES = {
  TruongHoc: [
    {
      ten: "Trường Đại học Bách Khoa - ĐH Đà Nẵng",
      diaChi:
        "54 Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Liên Chiểu, TP. Đà Nẵng",
      lat: 16.0741,
      lng: 108.15,
      quan: "Liên Chiểu",
    },
    {
      ten: "Trường Đại học Kinh Tế - ĐH Đà Nẵng",
      diaChi: "71 Ngũ Hành Sơn, Phường Mỹ An, Ngũ Hành Sơn, TP. Đà Nẵng",
      lat: 16.0435,
      lng: 108.2412,
      quan: "Ngũ Hành Sơn",
    },
    {
      ten: "Trường Đại học Sư Phạm - ĐH Đà Nẵng",
      diaChi:
        "459 Tôn Đức Thắng, Phường Hòa Khánh Nam, Liên Chiểu, TP. Đà Nẵng",
      lat: 16.0689,
      lng: 108.1555,
      quan: "Liên Chiểu",
    },
    {
      ten: "Trường Đại học Duy Tân (Cơ sở Nam Ô)",
      diaChi: "Khu đô thị FPT City, Phường Hòa Hải, Ngũ Hành Sơn, TP. Đà Nẵng",
      lat: 15.9922,
      lng: 108.2588,
      quan: "Ngũ Hành Sơn",
    },
    {
      ten: "Trường THPT Phan Châu Trinh",
      diaChi: "154 Lê Lợi, Phường Hải Châu 1, Hải Châu, TP. Đà Nẵng",
      lat: 16.0718,
      lng: 108.2215,
      quan: "Hải Châu",
    },
    {
      ten: "Trường Đại học Kiến trúc Đà Nẵng",
      diaChi: "566 Núi Thành, Phường Hòa Cường Nam, Hải Châu, TP. Đà Nẵng",
      lat: 16.0351,
      lng: 108.2201,
      quan: "Hải Châu",
    },
    {
      ten: "Trường Đại học Đông Á",
      diaChi:
        "33 Xô Viết Nghệ Tĩnh, Phường Hòa Cường Nam, Hải Châu, TP. Đà Nẵng",
      lat: 16.0333,
      lng: 108.2199,
      quan: "Hải Châu",
    },
  ],
  TramYTe: [
    {
      ten: "Trung tâm Y tế Quận Hải Châu",
      diaChi: "388 Trần Phú, Phường Bình Thuận, Hải Châu, TP. Đà Nẵng",
      lat: 16.052,
      lng: 108.2234,
      quan: "Hải Châu",
    },
    {
      ten: "Trung tâm Y tế Quận Thanh Khê",
      diaChi: "62/32 Hà Huy Tập, Phường Hòa Khê, Thanh Khê, TP. Đà Nẵng",
      lat: 16.0645,
      lng: 108.1923,
      quan: "Thanh Khê",
    },
    {
      ten: "Trung tâm Y tế Quận Liên Chiểu",
      diaChi:
        "522 Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Liên Chiểu, TP. Đà Nẵng",
      lat: 16.0812,
      lng: 108.1432,
      quan: "Liên Chiểu",
    },
    {
      ten: "Trạm Y tế Phường Thanh Bình 1",
      diaChi: "114 Thanh Thủy, Phường Thanh Bình, Hải Châu, TP. Đà Nẵng",
      lat: 16.0765,
      lng: 108.2154,
      quan: "Hải Châu",
    },
    {
      ten: "Trạm Y tế Phường Thuận Phước",
      diaChi: "28 Huỳnh Ngọc Huệ, Phường Thuận Phước, Hải Châu, TP. Đà Nẵng",
      lat: 16.0882,
      lng: 108.2198,
      quan: "Hải Châu",
    },
    {
      ten: "Trạm Y tế Phường Thạch Thang",
      diaChi: "12 Lý Tự Trọng, Phường Thạch Thang, Hải Châu, TP. Đà Nẵng",
      lat: 16.0791,
      lng: 108.2223,
      quan: "Hải Châu",
    },
  ],
  CoQuan: [
    {
      ten: "Trung tâm Hành chính Thành phố Đà Nẵng",
      diaChi: "24 Trần Phú, Phường Thạch Thang, Hải Châu, TP. Đà Nẵng",
      lat: 16.0788,
      lng: 108.2235,
      quan: "Hải Châu",
    },
    {
      ten: "Khu Công nghệ cao Đà Nẵng (Da Nang Hi-Tech Park)",
      diaChi: "Xã Hòa Liên, Huyện Hòa Vang, TP. Đà Nẵng",
      lat: 16.1155,
      lng: 108.1022,
      quan: "Hòa Vang",
    },
    {
      ten: "Tòa nhà FPT Complex Đà Nẵng",
      diaChi: "Khu đô thị FPT City, Phường Hòa Hải, Ngũ Hành Sơn, TP. Đà Nẵng",
      lat: 15.9901,
      lng: 108.2577,
      quan: "Ngũ Hành Sơn",
    },
    {
      ten: "Cảng Hàng không Quốc tế Đà Nẵng",
      diaChi: "Đường Duy Tân, Phường Hòa Thuận Tây, Hải Châu, TP. Đà Nẵng",
      lat: 16.0533,
      lng: 108.2022,
      quan: "Hải Châu",
    },
    {
      ten: "UBND Phường Hải Châu 1",
      diaChi: "68 Lê Lợi, Phường Hải Châu 1, Hải Châu, TP. Đà Nẵng",
      lat: 16.0723,
      lng: 108.2222,
      quan: "Hải Châu",
    },
  ],
  KhuDanCu: [
    {
      ten: "Nhà Văn hóa Thanh niên Đà Nẵng",
      diaChi: "1 Quảng trường 2/9, Phường Hòa Cường Bắc, Hải Châu, TP. Đà Nẵng",
      lat: 16.0421,
      lng: 108.2241,
      quan: "Hải Châu",
    },
    {
      ten: "Công viên APEC Đà Nẵng",
      diaChi: "Đường Bạch Đằng, Phường Bình Hiên, Hải Châu, TP. Đà Nẵng",
      lat: 16.0612,
      lng: 108.2255,
      quan: "Hải Châu",
    },
    {
      ten: "Nhà sinh hoạt cộng đồng KDC Số 3",
      diaChi: "15 Ông Ích Khiêm, Phường Thanh Bình, Hải Châu, TP. Đà Nẵng",
      lat: 16.0771,
      lng: 108.214,
      quan: "Hải Châu",
    },
    {
      ten: "Trung tâm Văn hóa Thể thao Quận Sơn Trà",
      diaChi: "01 Trần Hưng Đạo, Phường An Hải Tây, Sơn Trà, TP. Đà Nẵng",
      lat: 16.0655,
      lng: 108.2312,
      quan: "Sơn Trà",
    },
  ],
};

const emptyForm = {
  tenChienDich: "",
  loaiChienDich: "CODINH",
  maDiaDiem: "",
  newTenDiaDiem: "",
  newDiaChi: "",
  newLoaiDiaDiem: "TruongHoc",
  newMaPhuongXa: "PX00001",
  pinnedLat: null,
  pinnedLng: null,
  maNhanVien: "",
  thoiGianBD: "",
  thoiGianKT: "",
  soLuongDuKien: 100,
  trangThai: "ChuaBatDau",
  imageUrl: "",
  mucDoUuTien: "BinhThuong",
};

const PAGE_SIZE = 8;

export default function QuanLyChienDich() {
  const { searchQuery: headerSearch = "" } = useOutletContext() || {};
  const [campaigns, setCampaigns] = useState([]);
  const [diaDiems, setDiaDiems] = useState([]);
  const [phuongXas, setPhuongXas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignRegs, setCampaignRegs] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [searchReg, setSearchReg] = useState("");
  const [filterRegStatus, setFilterRegStatus] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    tenChienDich: "",
    nhomMauCanKhapCap: "O_positive",
    maDiaDiem: "",
    soLuongDuKien: 10,
  });
  const [emergencySubmitting, setEmergencySubmitting] = useState(false);
  const imageInputRef = useRef(null);

  const openEmergencyModal = () => {
    setEmergencyForm({
      tenChienDich: "🚨 KHẨN CẤP: Cần gấp máu O+ tại Bệnh viện",
      nhomMauCanKhapCap: "O_positive",
      maDiaDiem: diaDiems[0]?.maDiaDiem || "DD00001",
      soLuongDuKien: 10,
    });
    setShowEmergencyModal(true);
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!emergencyForm.tenChienDich.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập tên chiến dịch khẩn cấp", "error");
      return;
    }
    setEmergencySubmitting(true);
    try {
      const now = new Date();
      const endTime = new Date(Date.now() + 12 * 3600 * 1000); // 12h từ bây giờ

      const payload = {
        tenChienDich: emergencyForm.tenChienDich,
        maDiaDiem: emergencyForm.maDiaDiem || diaDiems[0]?.maDiaDiem || "DD00001",
        soLuongDuKien: parseInt(emergencyForm.soLuongDuKien) || 10,
        thoiGianBD: now.toISOString(),
        thoiGianKT: endTime.toISOString(),
        trangThai: "DangDienRa",
        mucDoUuTien: "KhanCap",
        nhomMauCanKhapCap: emergencyForm.nhomMauCanKhapCap,
        imageUrl: "hienmau.jpg",
      };

      await chienDichService.createChienDich(payload);
      setShowEmergencyModal(false);
      Swal.fire({
        icon: "success",
        title: "🚨 ĐÃ PHÁT LỆNH HUY ĐỘNG KHẨN CẤP!",
        html: `Chiến dịch khẩn cấp đã được kích hoạt thành công!<br/><small class="text-slate-500">Tự động đóng sau 12 giờ.</small>`,
        confirmButtonColor: "#dc2626",
      });
      loadData();
    } catch (err) {
      Swal.fire("Lỗi", getApiError(err, "Không thể tạo chiến dịch khẩn cấp"), "error");
    } finally {
      setEmergencySubmitting(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cdRes, ddRes, pxRes] = await Promise.all([
        chienDichService.getChienDichsList(),
        diaDiemService.getAll(),
        phuongXaService.getAll(),
      ]);
      setCampaigns(Array.isArray(cdRes) ? cdRes : []);
      setDiaDiems(Array.isArray(ddRes) ? ddRes : []);
      setPhuongXas(Array.isArray(pxRes) ? pxRes : []);
    } catch (err) {
      Swal.fire(
        "Lỗi",
        getApiError(err, "Không tải được danh sách chiến dịch"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const total = campaigns.length;
    const dangDienRa = campaigns.filter(
      (c) => getStatusLabel(c.trangThai) === "Đang diễn ra",
    ).length;
    const sapDienRa = campaigns.filter(
      (c) => getStatusLabel(c.trangThai) === "Đã mở đăng ký",
    ).length;
    const daThu = campaigns.reduce((sum, c) => sum + (c.luongMauDaThu || 0), 0);
    return { total, dangDienRa, sapDienRa, daThu };
  }, [campaigns]);

  const filtered = useMemo(() => {
    const q = (search || headerSearch).trim().toLowerCase();
    let res = campaigns.filter((c) => {
      const matchQ =
        !q ||
        (c.tenChienDich || "").toLowerCase().includes(q) ||
        (c.maChienDich || "").toLowerCase().includes(q) ||
        (c.diaDiem?.tenDiaDiem || "").toLowerCase().includes(q);
      const matchS =
        !filterStatus || toBackendStatus(c.trangThai) === filterStatus;
      return matchQ && matchS;
    });

    // 🏆 THUẬT TOÁN SẮP XẾP ADMIN:
    // 1. Đợt KHẨN CẤP ĐANG DIỄN RA xếp vị trí ĐẦU TIÊN
    // 2. Các đợt Khẩn cấp khác
    // 3. Xếp theo thời gian bắt đầu mới nhất giảm dần
    res.sort((a, b) => {
      const aIsEmergActive = (a.mucDoUuTien === "KhanCap" || a.mucDoUuTien === 1) && (a.trangThai === "DangDienRa" || toBackendStatus(a.trangThai) === "DangDienRa") ? 1 : 0;
      const bIsEmergActive = (b.mucDoUuTien === "KhanCap" || b.mucDoUuTien === 1) && (b.trangThai === "DangDienRa" || toBackendStatus(b.trangThai) === "DangDienRa") ? 1 : 0;
      if (aIsEmergActive !== bIsEmergActive) return bIsEmergActive - aIsEmergActive;

      const aIsEmerg = (a.mucDoUuTien === "KhanCap" || a.mucDoUuTien === 1) ? 1 : 0;
      const bIsEmerg = (b.mucDoUuTien === "KhanCap" || b.mucDoUuTien === 1) ? 1 : 0;
      if (aIsEmerg !== bIsEmerg) return bIsEmerg - aIsEmerg;

      return new Date(b.thoiGianBD) - new Date(a.thoiGianBD);
    });

    return res;
  }, [campaigns, search, filterStatus, headerSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openCreate = () => {
    setForm({ ...emptyForm, loaiChienDich: "CODINH" });
    setModal("create");
  };

  const openEdit = (c) => {
    const isMobile =
      c.diaDiem?.loaiDiaDiem &&
      c.diaDiem.loaiDiaDiem !== "BenhVien" &&
      c.diaDiem.loaiDiaDiem !== "DiaDiemCoDinh";
    setForm({
      tenChienDich: c.tenChienDich || "",
      loaiChienDich: isMobile ? "DIDONG" : "CODINH",
      maDiaDiem: c.diaDiem?.maDiaDiem || "",
      newTenDiaDiem: c.diaDiem?.tenDiaDiem || "",
      newDiaChi: c.diaDiem?.diaChi || c.diaDiem?.diaChiChiTiet || "",
      newLoaiDiaDiem: c.diaDiem?.loaiDiaDiem || "TruongHoc",
      newMaPhuongXa: c.diaDiem?.maPhuongXa || "PX00001",
      pinnedLat: null,
      pinnedLng: null,
      maNhanVien: c.maNhanVien || "",
      thoiGianBD: toDatetimeLocal(c.thoiGianBD),
      thoiGianKT: toDatetimeLocal(c.thoiGianKT),
      soLuongDuKien: c.soLuongDuKien || 100,
      trangThai: toBackendStatus(c.trangThai),
      imageUrl: c.imageUrl || "",
      mucDoUuTien: c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1 ? "KhanCap" : "BinhThuong",
    });
    setModal({ type: "edit", maChienDich: c.maChienDich });
  };

  const openDetail = async (c) => {
    setSelectedCampaign(c);
    setSearchReg("");
    setFilterRegStatus("");
    setModal("detail");
    setLoadingRegs(true);
    try {
      const res = await donDangKyService.getAll();
      const allRegs = Array.isArray(res) ? res : res?.content || [];
      const matched = allRegs.filter(
        (d) => String(d.maChienDich) === String(c.maChienDich),
      );
      setCampaignRegs(matched);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đăng ký:", err);
      setCampaignRegs([]);
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let targetMaDiaDiem = form.maDiaDiem;

      if (form.loaiChienDich === "DIDONG") {
        if (!form.newTenDiaDiem?.trim() || !form.newDiaChi?.trim()) {
          Swal.fire(
            "Cảnh báo",
            "Vui lòng nhập đầy đủ Tên điểm tổ chức và Địa chỉ chi tiết cho điểm lưu động!",
            "warning",
          );
          setSubmitting(false);
          return;
        }
        const newLocPayload = {
          maDiaDiem: `DD${Math.floor(10000 + Math.random() * 90000)}`,
          tenDiaDiem: form.newTenDiaDiem.trim(),
          diaChi: form.newDiaChi.trim(),
          loaiDiaDiem: form.newLoaiDiaDiem || "TruongHoc",
          maPhuongXa: form.newMaPhuongXa || "PX00001",
        };
        const createLocRes = await diaDiemService.createDiaDiem(newLocPayload);
        targetMaDiaDiem =
          createLocRes?.maDiaDiem ||
          createLocRes?.data?.maDiaDiem ||
          newLocPayload.maDiaDiem;

        try {
          const locs = await diaDiemService.getAll();
          setDiaDiems(Array.isArray(locs) ? locs : []);
        } catch (err) {
          console.error("Lỗi cập nhật ds địa điểm:", err);
        }
      } else if (!targetMaDiaDiem) {
        Swal.fire(
          "Cảnh báo",
          "Vui lòng chọn Bệnh viện / Trung tâm tiếp nhận máu!",
          "warning",
        );
        setSubmitting(false);
        return;
      }

      const payload = {
        tenChienDich: form.tenChienDich.trim(),
        maDiaDiem: targetMaDiaDiem,
        maNhanVien: form.maNhanVien || null,
        thoiGianBD: fromDatetimeLocal(form.thoiGianBD),
        thoiGianKT: fromDatetimeLocal(form.thoiGianKT),
        soLuongDuKien: Number(form.soLuongDuKien) || 100,
        trangThai: toBackendStatus(form.trangThai),
        imageUrl: form.imageUrl || null,
        mucDoUuTien: form.mucDoUuTien === "KhanCap" ? 1 : 0,
      };

      if (modal === "create") {
        await chienDichService.createChienDich(payload);
        Swal.fire(
          "Thành công",
          "Đã tạo chiến dịch và điểm hiến máu lưu động mới",
          "success",
        );
      } else {
        await chienDichService.updateChienDich(modal.maChienDich, payload);
        Swal.fire("Thành công", "Đã cập nhật chiến dịch", "success");
      }
      setModal(null);
      loadData();
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join("; ")
          : null) ||
        err?.response?.data?.title ||
        err?.message ||
        "Thao tác thất bại";
      Swal.fire("Lỗi", errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire("Lỗi", "Vui lòng chọn file ảnh hợp lệ", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Lỗi", "Ảnh không được vượt quá 5MB", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const filename = await uploadService.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: filename }));
      Swal.fire({
        icon: "success",
        title: "Đã thêm ảnh",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Lỗi", getApiError(err, "Không thể tải ảnh lên"), "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleDelete = async (c) => {
    const result = await Swal.fire({
      title: "Xóa chiến dịch?",
      html: `Xóa <b>${c.tenChienDich}</b>?<br/><small class="text-slate-500">Không thể xóa nếu đã có người đăng ký.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#af101a",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (!result.isConfirmed) return;
    try {
      await chienDichService.deleteChienDich(c.maChienDich);
      Swal.fire("Đã xóa", "Chiến dịch đã được xóa", "success");
      loadData();
    } catch (err) {
      Swal.fire(
        "Lỗi",
        err?.response?.data?.message || "Không thể xóa chiến dịch",
        "error",
      );
    }
  };

  const progressPct = (c) => {
    const target = c.soLuongDuKien || 0;
    const done = c.luongMauDaThu || 0;
    if (!target) return 0;
    return Math.min(100, Math.round((done / target) * 100));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* 🚀 ROW 1: ULTRA-COMPACT HEADER & MINI STATS STRIP (Siêu gọn gàng bớt tốn diện tích) */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white/80 backdrop-blur-xl p-3.5 px-5 rounded-2xl border border-white/80 shadow-md shadow-slate-900/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e62e43] to-red-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <span className="material-symbols-outlined text-lg">campaign</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                Quản lý Chiến dịch
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-[#e62e43] text-[9px] font-black uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[#e62e43] animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-slate-500 text-[11px] font-medium leading-none mt-0.5">
              Điều phối & theo dõi tiến độ hiến máu nhân đạo
            </p>
          </div>
        </div>

        {/* Mini Stats + Button in same row */}
        <div className="flex items-center flex-wrap gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm"
            title="Tổng chiến dịch"
          >
            <span className="material-symbols-outlined text-sm text-rose-400">
              event_available
            </span>
            <span>
              Tổng: <b>{stats.total}</b>
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-sm"
            title="Đang diễn ra"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Diễn ra: <b>{stats.dangDienRa}</b>
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shadow-sm"
            title="Sắp / phê duyệt"
          >
            <span className="material-symbols-outlined text-sm">upcoming</span>
            <span>
              Sắp tới: <b>{stats.sapDienRa}</b>
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-[#e62e43] border border-rose-200 text-xs font-bold shadow-sm"
            title="Đã thu nhận"
          >
            <span className="material-symbols-outlined text-sm">bloodtype</span>
            <span>
              Đã thu: <b>{stats.daThu}</b> đv
            </span>
          </div>

          <button
            onClick={openEmergencyModal}
            className="flex items-center gap-1.5 h-9 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xs rounded-xl hover:shadow-lg hover:shadow-red-600/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 animate-pulse border-2 border-red-400/50 shrink-0 shadow-md shadow-red-500/20"
          >
            <span className="material-symbols-outlined text-base text-amber-300 animate-bounce">
              warning
            </span>
            <span>🚨 Tạo Đợt Hiến Máu Khẩn Cấp</span>
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 h-9 px-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black text-xs rounded-xl hover:shadow-lg hover:shadow-slate-900/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 group ml-1 shrink-0"
          >
            <span className="material-symbols-outlined text-base group-hover:rotate-90 transition-transform duration-300">
              add_circle
            </span>
            <span>Tạo chiến dịch mới</span>
          </button>
        </div>
      </div>

      {/* 🚀 ROW 2: SEARCH & FILTER CONTROL BAR */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl p-2.5 px-4 shadow-md shadow-slate-900/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#e62e43]">
              list_alt
            </span>
            Danh sách chiến dịch
          </span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-black text-[11px] rounded-full border border-slate-200 shadow-2xs">
            {filtered.length} mục
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative w-full sm:w-60">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
              search
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm tên, mã, địa điểm..."
              className="w-full h-9 bg-slate-100 hover:bg-slate-50 border border-transparent rounded-xl pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43]/40 focus:ring-2 focus:ring-[#e62e43]/10 transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            className="h-9 px-3 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 outline-none focus:border-[#e62e43] focus:ring-2 focus:ring-[#e62e43]/10 shadow-sm transition-all cursor-pointer hover:border-slate-300"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="h-12 bg-slate-50/50 border-b border-slate-200">
                {[
                  "Tên chiến dịch",
                  "Thời gian",
                  "Địa điểm",
                  "Chỉ tiêu",
                  "Tiến độ",
                  "Trạng thái",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap text-center first:text-left last:text-right"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải...
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    Không có chiến dịch nào
                  </td>
                </tr>
              ) : (
                pageItems.map((c) => {
                  const pct = progressPct(c);
                  return (
                    <tr
                      key={c.maChienDich}
                      className={`h-[84px] transition-colors ${
                        c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1
                          ? "bg-red-50/50 hover:bg-red-50"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="px-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                              c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1
                                ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20"
                                : "bg-red-100 hover:bg-red-200"
                            }`}
                            onClick={() => openDetail(c)}
                            title="Xem chi tiết & danh sách đăng ký"
                          >
                            <span
                              className={`material-symbols-outlined ${
                                c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1
                                  ? "text-white animate-pulse"
                                  : "text-red-600"
                              }`}
                            >
                              {c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1 ? "campaign" : "volunteer_activism"}
                            </span>
                          </div>
                          <div className="truncate max-w-[260px]">
                            <p
                              onClick={() => openDetail(c)}
                              className={`text-sm font-black truncate cursor-pointer transition-colors flex items-center gap-2 ${
                                c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1
                                  ? "text-red-700 hover:text-red-800"
                                  : "text-slate-900 hover:text-[#e62e43]"
                              }`}
                              title="Nhấp để xem chi tiết & danh sách TNV đăng ký"
                            >
                              {c.tenChienDich}
                              {(c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1) && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-600 text-white uppercase shrink-0 tracking-wider">Khẩn</span>
                              )}
                            </p>
                            
                            {/* 🔴 NHÓM MÁU CẦN GẤP */}
                            {(c.mucDoUuTien === "KhanCap" || c.mucDoUuTien === 1 || c.nhomMauCanKhapCap) && (
                              <div className="mt-1">
                                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm inline-flex items-center gap-1">
                                  <span>🆘 CẦN GẤP MÁU:</span>
                                  <span className="text-amber-300 font-extrabold">{c.nhomMauCanKhapCap ? c.nhomMauCanKhapCap.replace('_positive','+').replace('_negative','-') : "O+"}</span>
                                </span>
                              </div>
                            )}

                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Mã CD: <b>{c.maChienDich}</b>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 text-center">
                        <div className="flex flex-col text-[11px] font-bold text-slate-600 leading-tight">
                          <span>
                            {toDatetimeLocal(c.thoiGianBD)
                              ?.slice(0, 10)
                              .replace(/-/g, "/")}
                          </span>
                          <span className="text-slate-300">to</span>
                          <span>
                            {toDatetimeLocal(c.thoiGianKT)
                              ?.slice(0, 10)
                              .replace(/-/g, "/")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6">
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[220px]">
                          🏥 {c.diaDiem?.tenDiaDiem || "Bệnh viện Đa Khoa Đà Nẵng"}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[220px] mt-0.5">
                          📍 {c.diaDiem?.diaChi || c.diaDiem?.diaChiChiTiet || "Đà Nẵng"}
                        </p>
                      </td>
                      <td className="px-6 text-center">
                        <span className="text-sm font-bold text-slate-900">
                          {c.soLuongDuKien || 0}
                        </span>
                      </td>
                      <td className="px-6 min-w-[140px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-red-700">
                              {c.luongMauDaThu || 0} đv
                            </span>
                            <span className="text-slate-400">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-red-600"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-[11px] font-black rounded-full border ${statusBadge(c.trangThai)}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusLabel(c.trangThai) === "Đang diễn ra" ? "bg-emerald-500 animate-pulse" : "bg-current"}`}
                          />
                          {getStatusLabel(c.trangThai).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openDetail(c)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                            title="Xem chi tiết & danh sách đăng ký"
                          >
                            <span className="material-symbols-outlined text-lg">
                              visibility
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-lg">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="h-16 px-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Hiển thị {page * PAGE_SIZE + 1} -{" "}
              {Math.min((page + 1) * PAGE_SIZE, filtered.length)} của{" "}
              {filtered.length} chiến dịch
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_left
                </span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-[11px] font-bold ${page === i ? "bg-red-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-400 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-lg">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 MODAL CHI TIẾT & DANH SÁCH TNV ĐĂNG KÝ (PREMIUM WOW DESIGN) */}
      {modal === "detail" && selectedCampaign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-100 animate-in zoom-in-95 duration-300">
            {/* 🌟 HERO BANNER & HEADER */}
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 px-8 py-7 text-white border-b border-slate-800 shrink-0 overflow-hidden">
              {/* Background decorative blur */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-5">
                  {/* Thumbnail Banner or Glass Icon */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shrink-0 bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center group">
                    {selectedCampaign.imageUrl ? (
                      <img
                        src={toImageSrc(selectedCampaign.imageUrl)}
                        alt="Campaign Banner"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-white drop-shadow-md animate-pulse">
                        volunteer_activism
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-rose-300">
                        ID: {selectedCampaign.maChienDich}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-black uppercase border shadow-md backdrop-blur-md ${statusBadge(selectedCampaign.trangThai)}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${getStatusLabel(selectedCampaign.trangThai) === "Đang diễn ra" ? "bg-emerald-500 animate-ping" : "bg-current"}`}
                        />
                        {getStatusLabel(selectedCampaign.trangThai)}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight drop-shadow-sm leading-snug">
                      {selectedCampaign.tenChienDich}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-base text-rose-400">
                        verified
                      </span>
                      Chiến dịch hiến máu tình nguyện được phê duyệt bởi Sở Y tế
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => openDetail(selectedCampaign)}
                    title="Làm mới dữ liệu đăng ký"
                    className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all backdrop-blur-md border border-white/10 active:scale-95 shadow-lg"
                  >
                    <span
                      className={`material-symbols-outlined text-base ${loadingRegs ? "animate-spin" : ""}`}
                    >
                      refresh
                    </span>
                    <span>Làm mới</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white transition-all backdrop-blur-md border border-rose-500/30 active:scale-95 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-xl">
                      close
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 🌟 MODAL BODY (SCROLLABLE & HIGH AESTHETIC) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50/50">
              {/* 4 STATS OVERVIEW CARDS (GLASSMORPHISM & GRADIENTS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">
                      location_on
                    </span>
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Địa điểm tổ chức
                    </p>
                    <p
                      className="text-sm font-black text-slate-800 mt-1 truncate"
                      title={selectedCampaign.diaDiem?.tenDiaDiem}
                    >
                      {selectedCampaign.diaDiem?.tenDiaDiem || "---"}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                      {selectedCampaign.diaDiem?.diaChi || "Đà Nẵng"}
                    </p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">
                      event_available
                    </span>
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Thời gian lịch trình
                    </p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Từ:{" "}
                        {toDatetimeLocal(selectedCampaign.thoiGianBD)?.replace(
                          "T",
                          " ",
                        ) || "---"}
                      </p>
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Đến:{" "}
                        {toDatetimeLocal(selectedCampaign.thoiGianKT)?.replace(
                          "T",
                          " ",
                        ) || "---"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blood Volume Progress */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">
                      bloodtype
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tiến độ thu máu
                      </p>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {progressPct(selectedCampaign)}%
                      </span>
                    </div>
                    <p className="text-base font-black text-slate-900 mt-1">
                      <span className="text-red-600 font-extrabold">
                        {selectedCampaign.luongMauDaThu || 0}
                      </span>{" "}
                      / {selectedCampaign.soLuongDuKien || 0}{" "}
                      <span className="text-xs font-semibold text-slate-500">
                        đv
                      </span>
                    </p>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-2 p-0.5 border border-slate-200/50">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${progressPct(selectedCampaign) >= 100 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-red-600 to-rose-500"}`}
                        style={{
                          width: `${Math.min(100, progressPct(selectedCampaign))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Volunteers Summary */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">
                      groups
                    </span>
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Đăng ký tham gia
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-900">
                        {campaignRegs.length}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Tình nguyện viên
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        check_circle
                      </span>
                      {
                        campaignRegs.filter(
                          (r) => r.trangThai === "DA_THU_NHAN",
                        ).length
                      }{" "}
                      đã hiến thành công
                    </p>
                  </div>
                </div>
              </div>

              {/* 🌟 REGISTRATION LIST TABLE SECTION */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden flex flex-col">
                {/* Table Header & Filters Bar */}
                <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                      <span className="material-symbols-outlined text-xl">
                        fact_check
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-base uppercase tracking-wider">
                        Danh sách Tình nguyện viên đăng ký
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">
                        Quản lý trạng thái khám và thu nhận máu của từng tình
                        nguyện viên
                      </p>
                    </div>
                  </div>

                  {/* Filter Status Tabs */}
                  <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full">
                    {[
                      { id: "", label: "Tất cả", count: campaignRegs.length },
                      {
                        id: "CHO_KHAM",
                        label: "Chờ khám",
                        count: campaignRegs.filter(
                          (r) => r.trangThai === "CHO_KHAM",
                        ).length,
                      },
                      {
                        id: "DA_KHAM",
                        label: "Đã khám",
                        count: campaignRegs.filter(
                          (r) => r.trangThai === "DA_KHAM",
                        ).length,
                      },
                      {
                        id: "DA_THU_NHAN",
                        label: "Đã thu máu",
                        count: campaignRegs.filter(
                          (r) => r.trangThai === "DA_THU_NHAN",
                        ).length,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilterRegStatus(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${filterRegStatus === tab.id ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-slate-300 hover:bg-slate-700/60"}`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterRegStatus === tab.id ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400"}`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar inside table section */}
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
                  <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                      search
                    </span>
                    <input
                      value={searchReg}
                      onChange={(e) => setSearchReg(e.target.value)}
                      placeholder="Tìm tên TNV, CCCD, số điện thoại, mã đơn..."
                      className="w-full h-10 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 shadow-xs transition-all"
                    />
                  </div>

                  <div className="text-xs font-bold text-slate-500">
                    Hiển thị{" "}
                    <span className="text-slate-900 font-black">
                      {campaignRegs.length}
                    </span>{" "}
                    đơn đăng ký
                  </div>
                </div>

                {/* Table Data Render */}
                <div className="overflow-x-auto min-h-[250px]">
                  {loadingRegs ? (
                    <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-lg" />
                      <span className="text-sm font-black text-slate-600">
                        Đang đồng bộ dữ liệu từ Sở Y tế...
                      </span>
                    </div>
                  ) : (
                    (() => {
                      const qReg = searchReg.trim().toLowerCase();
                      const filteredRegs = campaignRegs.filter((r) => {
                        const matchQ =
                          !qReg ||
                          (r.tinhNguyenVien?.hoVaTen || r.maTNV || "")
                            .toLowerCase()
                            .includes(qReg) ||
                          (r.tinhNguyenVien?.soCCCD || "")
                            .toLowerCase()
                            .includes(qReg) ||
                          (r.tinhNguyenVien?.soDienThoai || "")
                            .toLowerCase()
                            .includes(qReg) ||
                          (r.maDon || "").toLowerCase().includes(qReg);
                        const matchS =
                          !filterRegStatus || r.trangThai === filterRegStatus;
                        return matchQ && matchS;
                      });

                      if (filteredRegs.length === 0) {
                        return (
                          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-3xl">
                                inbox
                              </span>
                            </div>
                            <p className="text-sm font-black text-slate-600">
                              {searchReg || filterRegStatus
                                ? "Không tìm thấy tình nguyện viên nào phù hợp bộ lọc"
                                : "Chưa có tình nguyện viên nào đăng ký tham gia chiến dịch này"}
                            </p>
                            {(searchReg || filterRegStatus) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchReg("");
                                  setFilterRegStatus("");
                                }}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                              >
                                Xóa bộ lọc
                              </button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50/90 border-b border-slate-200 font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                              <th className="py-4 px-6">Mã đơn</th>
                              <th className="py-4 px-6">Tình nguyện viên</th>
                              <th className="py-4 px-6">CCCD / Liên hệ</th>
                              <th className="py-4 px-6 text-center">
                                Thể tích máu
                              </th>
                              <th className="py-4 px-6 text-center">
                                Trạng thái khám/hiến
                              </th>
                              <th className="py-4 px-6 text-right">
                                Người tiếp nhận
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredRegs.map((r) => (
                              <tr
                                key={r.maDon}
                                className="hover:bg-red-50/30 transition-colors group"
                              >
                                <td className="py-4 px-6 font-mono font-black text-red-600">
                                  <span className="px-2.5 py-1 bg-red-50 rounded-lg border border-red-100 shadow-2xs group-hover:bg-red-100 transition-colors">
                                    {r.maDon}
                                  </span>
                                </td>
                                <td className="py-4 px-6 font-black text-slate-900 text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                                      {(
                                        r.tinhNguyenVien?.hoTen ||
                                        r.tinhNguyenVien?.hoVaTen ||
                                        "T"
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">
                                        {r.tinhNguyenVien?.hoTen ||
                                          r.tinhNguyenVien?.hoVaTen ||
                                          r.maTNV ||
                                          "---"}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-normal">
                                        TNV ID: {r.maTNV}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <p className="font-mono font-bold text-slate-800">
                                    {r.tinhNguyenVien?.cccd ||
                                      r.tinhNguyenVien?.soCCCD ||
                                      "---"}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {r.tinhNguyenVien?.soDienThoai ||
                                      r.tinhNguyenVien?.sdt ||
                                      "Không có SĐT"}
                                  </p>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <span className="px-3 py-1 bg-blue-50 text-blue-700 font-black rounded-full border border-blue-200 shadow-2xs">
                                    {r.theTich || 250} ml
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-2xs
                                  ${
                                    r.trangThai === "DA_KHAM"
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                      : r.trangThai === "CHO_KHAM"
                                        ? "bg-amber-100 text-amber-800 border-amber-200"
                                        : r.trangThai === "DA_THU_NHAN"
                                          ? "bg-blue-600 text-white border-blue-700 shadow-blue-500/20"
                                          : r.trangThai === "HUY"
                                            ? "bg-rose-100 text-rose-800 border-rose-200"
                                            : "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${r.trangThai === "DA_THU_NHAN" ? "bg-white" : "bg-current"}`}
                                    />
                                    {r.trangThai === "CHO_KHAM"
                                      ? "Chờ khám sàng lọc"
                                      : r.trangThai === "DA_KHAM"
                                        ? "Đã đạt sức khỏe"
                                        : r.trangThai === "DA_THU_NHAN"
                                          ? "Đã thu máu thành công"
                                          : r.trangThai === "HUY"
                                            ? "Đã hủy / Không đạt"
                                            : r.trangThai || "Chờ xử lý"}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right font-mono">
                                  {r.maNV ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs">
                                      <span className="material-symbols-outlined text-sm text-blue-600">
                                        medical_services
                                      </span>
                                      {r.maNV}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">
                                      TNV đăng ký online
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 px-8 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs font-semibold text-slate-500">
                ⚡ Dữ liệu chiến dịch hiến máu được đồng bộ với{" "}
                <b className="text-slate-800">Sở Y tế Thành phố Đà Nẵng</b>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center gap-2"
              >
                <span>Đóng bảng chi tiết</span>
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL TẠO MỚI / CHỈNH SỬA CHIẾN DỊCH (CHUẨN TRANG GIẤY LỚN max-w-5xl) */}
      {(modal === "create" || modal?.type === "edit") && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#f8fafc] w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
            {/* TOP HEADER */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-700/60 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e62e43] to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30 shrink-0">
                  <span className="material-symbols-outlined text-2xl">
                    {modal === "create" ? "add_circle" : "edit_document"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black tracking-widest uppercase">
                      {modal === "create" ? "BIỂU MẪU ĐĂNG KÝ MỚI" : "BIỂU MẪU CHỈNH SỬA"}
                    </span>
                    <span className="text-slate-400 text-xs">• Chuẩn định danh Y tế</span>
                  </div>
                  <h3 className="font-black text-white text-lg sm:text-xl tracking-tight mt-0.5">
                    {modal === "create" ? "TẠO CHIẾN DỊCH HIẾN MÁU NHÂN ĐẠO MỚI" : "CẬP NHẬT THÔNG TIN CHIẾN DỊCH"}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    {modal === "create" ? "Thiết lập quy mô tổ chức, thời gian và định danh tọa độ điểm tiếp nhận máu chuẩn GIS" : `Đang hiệu chỉnh hồ sơ ID: ${modal.maChienDich}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* FORM BODY (MÔ PHỎNG TRANG GIẤY LỚN SANG TRỌNG) */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/70 space-y-8">
                
                {/* PHẦN I: THÔNG TIN CHUNG VÀ THỜI GIAN TỔ CHỨC */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-8 h-8 rounded-xl bg-red-50 text-[#e62e43] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-lg">info</span>
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                        I. Thông tin định danh chiến dịch & Thời gian
                      </h4>
                      <p className="text-[11px] text-slate-400">Tên gọi chính thức và khung thời gian tiếp nhận hiến máu</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Tên chiến dịch hiến máu *
                    </label>
                    <input
                      required
                      placeholder="Ví dụ: Ngày hội Hiến máu Giọt hồng Nhân ái 2026 - ĐH Bách Khoa..."
                      value={form.tenChienDich}
                      onChange={(e) => setForm({ ...form, tenChienDich: e.target.value })}
                      className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                    />
                    </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Tính chất / Mức độ ưu tiên *
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mucDoUuTien"
                          value="BinhThuong"
                          checked={form.mucDoUuTien === "BinhThuong"}
                          onChange={(e) => setForm({ ...form, mucDoUuTien: e.target.value })}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-slate-700">Bình thường</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                        <input
                          type="radio"
                          name="mucDoUuTien"
                          value="KhanCap"
                          checked={form.mucDoUuTien === "KhanCap"}
                          onChange={(e) => setForm({ ...form, mucDoUuTien: e.target.value })}
                          className="w-4 h-4 text-red-600 border-red-300 focus:ring-red-500"
                        />
                        <span className="text-sm font-bold text-red-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">campaign</span>
                          Khẩn cấp
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-emerald-600">play_circle</span>
                        Thời gian bắt đầu tiếp nhận *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={form.thoiGianBD}
                        onChange={(e) => {
                          const newBD = e.target.value;
                          const nextStatus =
                            form.trangThai === "DaHuy"
                              ? "DaHuy"
                              : calcStatusByTime(newBD, form.thoiGianKT);
                          setForm({
                            ...form,
                            thoiGianBD: newBD,
                            trangThai: nextStatus,
                          });
                        }}
                        className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 bg-white outline-none focus:border-[#e62e43] focus:ring-2 focus:ring-[#e62e43]/10 transition-colors"
                      />
                    </div>
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-rose-600">stop_circle</span>
                        Thời gian kết thúc (Dự kiến) *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={form.thoiGianKT}
                        onChange={(e) => {
                          const newKT = e.target.value;
                          const nextStatus =
                            form.trangThai === "DaHuy"
                              ? "DaHuy"
                              : calcStatusByTime(form.thoiGianBD, newKT);
                          setForm({
                            ...form,
                            thoiGianKT: newKT,
                            trangThai: nextStatus,
                          });
                        }}
                        className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 bg-white outline-none focus:border-[#e62e43] focus:ring-2 focus:ring-[#e62e43]/10 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Chỉ tiêu tiếp nhận (Đơn vị máu) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          required
                          value={form.soLuongDuKien}
                          onChange={(e) =>
                            setForm({ ...form, soLuongDuKien: e.target.value })
                          }
                          className="w-full h-11 pl-4 pr-16 border border-slate-200 rounded-xl text-base font-bold text-slate-800 bg-white outline-none focus:border-[#e62e43] focus:ring-2 focus:ring-[#e62e43]/10 transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                          Đơn vị
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                        <span>Trạng thái hoạt động</span>
                        <span className="text-[10px] text-red-500 font-semibold italic">⚡ Tự động theo giờ</span>
                      </label>
                      <select
                        value={form.trangThai}
                        onChange={(e) =>
                          setForm({ ...form, trangThai: e.target.value })
                        }
                        className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 bg-slate-50/80 outline-none focus:border-[#e62e43] focus:ring-2 focus:ring-[#e62e43]/10 transition-colors cursor-pointer"
                      >
                        {(form.mucDoUuTien === "KhanCap"
                          ? STATUS_OPTIONS.filter((s) => s.value === "DangDienRa" || s.value === "DaKetThuc")
                          : STATUS_OPTIONS
                        ).map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* PHẦN II: THIẾT LẬP VỊ TRÍ & ĐỊA ĐIỂM TIẾP NHẬN MÁU (GIS) */}
                <div className="space-y-5 pt-4 border-t-2 border-dashed border-slate-200">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-8 h-8 rounded-xl bg-red-50 text-[#e62e43] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-lg">share_location</span>
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <span>II. Định danh điểm hiến máu & Tích hợp bản đồ số GIS</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">GIS Đà Nẵng</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Chọn cơ sở cố định tại viện hoặc tổ chức lưu động ngoài cộng đồng</p>
                    </div>
                  </div>

                  {/* CHỌN CỐ ĐỊNH vs DI ĐỘNG */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, loaiChienDich: "CODINH" })}
                      className={`p-4 rounded-2xl font-bold text-left flex items-start gap-3.5 transition-all border-2 ${
                        form.loaiChienDich === "CODINH"
                          ? "bg-red-50/50 border-[#e62e43] text-[#e62e43] shadow-md shadow-[#e62e43]/5"
                          : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100/80 hover:border-slate-200"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${form.loaiChienDich === "CODINH" ? "bg-[#e62e43] text-white shadow-md" : "bg-white text-slate-500 border border-slate-200"}`}>
                        🏥
                      </div>
                      <div>
                        <div className="text-base font-black">Cố định tại Bệnh viện / TTYT</div>
                        <div className={`text-xs font-medium mt-0.5 ${form.loaiChienDich === "CODINH" ? "text-red-700/80" : "text-slate-400"}`}>
                          Tổ chức tại các bệnh viện lớn, cơ sở tiếp nhận máu chuyên nghiệp sẵn có.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, loaiChienDich: "DIDONG" })}
                      className={`p-4 rounded-2xl font-bold text-left flex items-start gap-3.5 transition-all border-2 ${
                        form.loaiChienDich === "DIDONG"
                          ? "bg-red-50/50 border-[#e62e43] text-[#e62e43] shadow-md shadow-[#e62e43]/5"
                          : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100/80 hover:border-slate-200"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${form.loaiChienDich === "DIDONG" ? "bg-[#e62e43] text-white shadow-md" : "bg-white text-slate-500 border border-slate-200"}`}>
                        🚑
                      </div>
                      <div>
                        <div className="text-base font-black">Linh động / Di động cộng đồng</div>
                        <div className={`text-xs font-medium mt-0.5 ${form.loaiChienDich === "DIDONG" ? "text-red-700/80" : "text-slate-400"}`}>
                          Tổ chức tại Trường học, Trạm y tế, Cơ quan, Khu công nghiệp hoặc KDC.
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* TRƯỜNG HỢP 1: CỐ ĐỊNH */}
                  {form.loaiChienDich === "CODINH" ? (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Chọn Bệnh viện / Trung tâm tiếp nhận máu trong hệ thống *
                      </label>
                      <select
                        required={form.loaiChienDich === "CODINH"}
                        value={form.maDiaDiem}
                        onChange={(e) =>
                          setForm({ ...form, maDiaDiem: e.target.value })
                        }
                        className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-base bg-white font-bold text-slate-800 outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all cursor-pointer"
                      >
                        <option value="">-- Bấm để chọn Bệnh viện / Cơ sở y tế cố định --</option>
                        {diaDiems.map((d) => (
                          <option key={d.maDiaDiem} value={d.maDiaDiem}>
                            🏥 {d.tenDiaDiem} ({d.diaChi || "Đà Nẵng"})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    /* TRƯỜNG HỢP 2: LINH ĐỘNG / DI ĐỘNG (GIS) */
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-6 animate-fadeIn">
                      {/* BƯỚC 1: CHỌN PHƯỜNG / XÃ (KHU VỰC ĐÀ NẴNG) */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                          <span>Bước 1: Chọn Phường/Xã / Khu vực tại TP. Đà Nẵng *</span>
                          <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">filter_alt</span>
                            Lọc gợi ý GIS theo khu vực
                          </span>
                        </label>
                        <select
                          required={form.loaiChienDich === "DIDONG"}
                          value={form.newMaPhuongXa}
                          onChange={(e) => setForm({ ...form, newMaPhuongXa: e.target.value })}
                          className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-sm bg-white font-bold text-slate-800 outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all cursor-pointer"
                        >
                          <option value="">-- Chọn Phường / Xã tại TP. Đà Nẵng --</option>
                          {phuongXas.map((px) => (
                            <option key={px.maPhuongXa} value={px.maPhuongXa}>
                              📍 {px.tenPhuongXa}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* BƯỚC 2: CHỌN LOẠI HÌNH TỔ CHỨC */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2.5 uppercase tracking-wider flex items-center justify-between">
                          <span>Bước 2: Phân loại địa điểm tổ chức lưu động *</span>
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            Tích hợp cơ sở dữ liệu GIS Đà Nẵng
                          </span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { id: "TruongHoc", label: "Trường học / ĐH", icon: "school" },
                            { id: "TramYTe", label: "Trạm xá / Trạm y tế", icon: "health_and_safety" },
                            { id: "CoQuan", label: "Cơ quan / Doanh nghiệp", icon: "domain" },
                            { id: "KhuDanCu", label: "Khu dân cư / Khác", icon: "groups" },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setForm({ ...form, newLoaiDiaDiem: cat.id })}
                              className={`h-12 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                                form.newLoaiDiaDiem === cat.id
                                  ? "bg-white border-[#e62e43] text-[#e62e43] shadow-md shadow-[#e62e43]/10"
                                  : "bg-slate-100/70 border-transparent text-slate-600 hover:bg-slate-200/60"
                              }`}
                            >
                              <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                              <span>{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* BƯỚC 3: TÊN ĐIỂM TỔ CHỨC & THANH GỢI Ý THÔNG MINH */}
                      <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                          Bước 3: Tên điểm tổ chức cụ thể * (Tự nhập hoặc bấm chọn gợi ý GIS bên dưới)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required={form.loaiChienDich === "DIDONG"}
                            placeholder="Ví dụ: Trường Đại học Bách Khoa - ĐH Đà Nẵng, Nhà văn hoá thôn 4..."
                            value={form.newTenDiaDiem}
                            onChange={(e) => setForm({ ...form, newTenDiaDiem: e.target.value })}
                            className="w-full h-12 pl-11 pr-4 border-2 border-slate-200 rounded-xl text-base font-bold text-slate-900 bg-white outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                          />
                          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-2xl">
                            location_on
                          </span>
                        </div>

                        {/* THANH GỢI Ý THÔNG MINH TỪ GOOGLE MAPS GIS HOẶC THÔNG BÁO TỰ NHẬP */}
                        {form.newLoaiDiaDiem === "KhuDanCu" ? (
                          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-2xs">
                            <span className="material-symbols-outlined text-amber-600 text-base shrink-0">info</span>
                            <span>Bạn đã chọn loại hình Khu dân cư / Khác. Vui lòng tự nhập Tên điểm tổ chức (vd: Nhà văn hoá thôn 4) và Địa chỉ cụ thể (vd: 114 Thanh Thủy), hoặc chọn trực tiếp trên Bản đồ GIS bên dưới.</span>
                          </div>
                        ) : (
                          <div className="bg-white p-3.5 rounded-xl border border-red-100 shadow-sm">
                            <div className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-amber-500 text-base">lightbulb</span>
                                <span>Gợi ý điểm lưu động ({form.newLoaiDiaDiem === "TruongHoc" ? "Trường học" : form.newLoaiDiaDiem === "TramYTe" ? "Trạm xá / Trạm y tế" : "Cơ quan / Doanh nghiệp"}):</span>
                              </div>
                              {(() => {
                                const selPx = phuongXas.find(p => p.maPhuongXa === form.newMaPhuongXa);
                                const selQuan = selPx ? selPx.tenPhuongXa.split(',').pop().trim() : "";
                                return selQuan ? (
                                  <span className="text-[11px] text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Khu vực: {selQuan}</span>
                                ) : null;
                              })()}
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                              {(() => {
                                const selPx = phuongXas.find(p => p.maPhuongXa === form.newMaPhuongXa);
                                const selQuan = selPx ? selPx.tenPhuongXa.split(',').pop().trim() : "";
                                const allPlaces = DANANG_GIS_PLACES[form.newLoaiDiaDiem] || [];
                                const filtered = selQuan ? allPlaces.filter(p => p.quan === selQuan) : allPlaces;
                                const listToShow = filtered.length > 0 ? filtered : allPlaces;
                                return listToShow.map((place, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setForm({
                                        ...form,
                                        newTenDiaDiem: place.ten,
                                        newDiaChi: place.diaChi,
                                        pinnedLat: place.lat,
                                        pinnedLng: place.lng,
                                      });
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#e62e43] text-xs font-bold transition-all flex items-center gap-1.5 text-left border border-transparent hover:border-red-200 shadow-2xs active:scale-95"
                                  >
                                    <span className="material-symbols-outlined text-sm text-red-500">add_location_alt</span>
                                    <span>{place.ten}</span>
                                  </button>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* BƯỚC 4: ĐỊA CHỈ CHI TIẾT */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                          <span>Bước 4: Địa chỉ chi tiết điểm tiếp nhận máu *</span>
                          {form.newDiaChi && (
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">check_circle</span>
                              Đã định vị & chuẩn hóa địa chỉ GIS
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          required={form.loaiChienDich === "DIDONG"}
                          placeholder="Ví dụ: 114 Thanh Thủy, Phường Thanh Bình, Hải Châu, TP. Đà Nẵng"
                          value={form.newDiaChi}
                          onChange={(e) => setForm({ ...form, newDiaChi: e.target.value })}
                          className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-base font-bold text-slate-900 bg-white outline-none focus:border-[#e62e43] focus:ring-4 focus:ring-[#e62e43]/10 transition-all"
                        />
                      </div>

                      {/* BƯỚC 5: TÍCH HỢP BẢN ĐỒ TƯƠNG TÁC GOOGLE MAPS / GIS PINNING */}
                      <div className="border-2 border-slate-200 rounded-2xl p-4 bg-white space-y-3 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-red-50 text-[#e62e43] flex items-center justify-center font-bold shrink-0 shadow-sm">
                              <span className="material-symbols-outlined text-2xl">map</span>
                            </span>
                            <div>
                              <div className="text-sm font-black text-slate-800">Bước 5: Bản đồ định vị vệ tinh GIS Đà Nẵng (Google Maps API)</div>
                              <div className="text-xs text-slate-500">Bấm trực tiếp vào các trạm ghim trên bản đồ để trích xuất tọa độ GPS và thông tin tự động</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowMapPicker(!showMapPicker)}
                            className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-[#e62e43] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shrink-0 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-lg">{showMapPicker ? "visibility_off" : "explore"}</span>
                            <span>{showMapPicker ? "Thu gọn bản đồ" : "🧭 Mở bản đồ ghim tọa độ"}</span>
                          </button>
                        </div>

                        {/* KHỐI HIỂN THỊ BẢN ĐỒ TƯƠNG TÁC */}
                        {showMapPicker && (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white p-5 space-y-4 animate-fadeIn shadow-inner">
                            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e62e43_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-300 border-b border-slate-700/80 pb-3">
                              <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                                <span className="text-sm text-white">Tọa độ GPS đang ghim:</span>
                                <span className="font-mono text-emerald-400 text-sm">{form.pinnedLat || "16.054400"}°N, {form.pinnedLng || "108.202200"}°E</span>
                              </span>
                              <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-lg font-black border border-red-500/30 w-fit">
                                📍 Khu vực: TP. Đà Nẵng
                              </span>
                            </div>

                            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                              {Object.entries(DANANG_GIS_PLACES).flatMap(([k, list]) => list).slice(0, 9).map((item, i) => (
                                <div
                                  key={i}
                                  onClick={() => {
                                    setForm({
                                      ...form,
                                      newTenDiaDiem: item.ten,
                                      newDiaChi: item.diaChi,
                                      pinnedLat: item.lat,
                                      pinnedLng: item.lng,
                                    });
                                    Swal.fire({
                                      icon: "success",
                                      title: "Đã ghim từ Bản đồ!",
                                      text: `Đã trích xuất thông tin: ${item.ten}`,
                                      timer: 1500,
                                      showConfirmButton: false,
                                    });
                                  }}
                                  className="p-3.5 rounded-xl bg-slate-800/90 hover:bg-red-600/30 border border-slate-700 hover:border-red-500 cursor-pointer transition-all group flex flex-col justify-between shadow-sm active:scale-95"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="text-xs font-black text-white group-hover:text-red-400 transition-colors line-clamp-1">
                                      {item.ten}
                                    </span>
                                    <span className="material-symbols-outlined text-red-500 text-base group-hover:scale-125 transition-transform shrink-0">
                                      location_on
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                    {item.diaChi}
                                  </div>
                                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-slate-400 group-hover:text-red-300">
                                    <span className="font-bold text-slate-300">📌 Q. {item.quan}</span>
                                    <span>{item.lat}, {item.lng}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="relative z-10 text-center pt-2 text-xs text-slate-400 italic font-medium">
                              💡 Mẹo: Bấm chọn vào các thẻ tọa độ phía trên để hệ thống tự động điền Tên điểm & Địa chỉ chính xác vào biểu mẫu.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* PHẦN III: HÌNH ẢNH TRUYỀN THÔNG & BANNER */}
                <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="w-8 h-8 rounded-xl bg-red-50 text-[#e62e43] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-lg">image</span>
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                        III. Banner truyền thông & Hình ảnh minh họa
                      </h4>
                      <p className="text-[11px] text-slate-400">Ảnh bìa hiển thị trên trang chủ và ứng dụng di động cho tình nguyện viên</p>
                    </div>
                  </div>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    <div className="sm:col-span-1">
                      {form.imageUrl ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 shadow-sm group">
                          <img
                            src={toImageSrc(form.imageUrl)}
                            alt="Xem trước ảnh chiến dịch"
                            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-lg"
                            title="Xóa ảnh"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => imageInputRef.current?.click()}
                          className="h-44 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 hover:bg-red-50/40 hover:border-[#e62e43]/60 flex flex-col items-center justify-center text-slate-400 hover:text-[#e62e43] cursor-pointer transition-all p-4 text-center group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-[#e62e43]">add_photo_alternate</span>
                          </div>
                          <p className="text-xs font-bold text-slate-600 group-hover:text-[#e62e43]">Bấm tải ảnh lên</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP (max 5MB)</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="sm:col-span-2 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="h-11 px-5 bg-slate-900 hover:bg-[#e62e43] text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-60 transition-all shadow-md active:scale-95"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {uploadingImage ? "progress_activity" : "upload"}
                          </span>
                          <span>{uploadingImage ? "Đang xử lý ảnh..." : form.imageUrl ? "Thay đổi hình ảnh khác" : "Chọn tệp hình ảnh"}</span>
                        </button>
                        {form.imageUrl && (
                          <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 truncate max-w-[280px]">
                            ✓ {form.imageUrl}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        💡 **Lời khuyên:** Sử dụng banner ngang độ phân giải cao (tỷ lệ 16:9 hoặc 4:3) để tạo ấn tượng mạnh mẽ cho tình nguyện viên đăng ký hiến máu.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </form>

            {/* BOTTOM FOOTER (ACTIONS) */}
            <div className="bg-slate-100 px-6 sm:px-8 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
                <span>Dữ liệu được mã hóa và đồng bộ trực tiếp với cơ sở dữ liệu Y tế Đà Nẵng.</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 sm:flex-initial h-12 px-6 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-white hover:border-slate-400 transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex-1 sm:flex-initial h-12 px-8 bg-gradient-to-r from-[#e62e43] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-black shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">
                    {submitting ? "progress_activity" : "save"}
                  </span>
                  <span>
                    {submitting
                      ? "ĐANG XỬ LÝ LƯU..."
                      : modal === "create"
                        ? "🚀 TẠO & PHÁT HÀNH CHIẾN DỊCH"
                        : "💾 LƯU THAY ĐỔI HỒ SƠ"}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🚨 MODAL HIẾN MÁU KHẨN CẤP (FAST-TRACK FORM TỐI GIẢN) */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-500 max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header Modal Khẩn cấp */}
            <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 p-6 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 text-2xl shadow-inner animate-pulse">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-red-950 font-black text-[10px] uppercase tracking-wider shadow-sm">
                        ⚡ QUY TRÌNH FAST-TRACK KHẨN CẤP
                      </span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight mt-1">
                      🚨 Kích Hoạt Đợt Hiến Máu Khẩn Cấp
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-all"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <p className="text-red-100 text-xs mt-3 leading-relaxed font-medium">
                Điền thông tin tối giản để phát hành lệnh ngay lập tức. Hệ thống sẽ tự động gán thời hạn <b>12 giờ</b> và mở cổng tiếp nhận.
              </p>
            </div>

            {/* Body Form */}
            <form onSubmit={handleEmergencySubmit} className="p-6 space-y-4">
              
              {/* 1. Tên chiến dịch khẩn cấp */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Tên Đợt Cấp Cứu Khẩn Cấp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={emergencyForm.tenChienDich}
                  onChange={(e) =>
                    setEmergencyForm((prev) => ({ ...prev, tenChienDich: e.target.value }))
                  }
                  placeholder="Ví dụ: Cần gấp máu O+ cho bệnh nhân cấp cứu tại BV Đà Nẵng"
                  className="w-full h-11 px-4 rounded-xl border border-red-200 bg-red-50/30 font-bold text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                />
              </div>

              {/* 2. Nhóm máu & Số lượng trong cùng 1 hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    2. Nhóm Máu Cần Gấp <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={emergencyForm.nhomMauCanKhapCap}
                    onChange={(e) =>
                      setEmergencyForm((prev) => ({
                        ...prev,
                        nhomMauCanKhapCap: e.target.value,
                        tenChienDich: `🚨 KHẨN CẤP: Cần gấp máu ${e.target.value.replace('_positive','+').replace('_negative','-')} tại Bệnh viện`
                      }))
                    }
                    className="w-full h-11 px-4 rounded-xl border border-red-300 bg-red-50 font-black text-sm text-red-700 focus:bg-white focus:border-red-500 outline-none transition-all"
                  >
                    <option value="O_positive">🔴 Nhóm O+</option>
                    <option value="A_positive">🅰️ Nhóm A+</option>
                    <option value="B_positive">🅱️ Nhóm B+</option>
                    <option value="AB_positive">🆎 Nhóm AB+</option>
                    <option value="O_negative">🆘 Nhóm O- (Hiếm)</option>
                    <option value="A_negative">🆘 Nhóm A- (Hiếm)</option>
                    <option value="B_negative">🆘 Nhóm B- (Hiếm)</option>
                    <option value="AB_negative">🆘 Nhóm AB- (Hiếm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    3. Số Đơn Vị Cần Gấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={emergencyForm.soLuongDuKien}
                    onChange={(e) =>
                      setEmergencyForm((prev) => ({ ...prev, soLuongDuKien: e.target.value }))
                    }
                    className="w-full h-11 px-4 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* 3. Địa điểm bệnh viện */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  4. Bệnh Viện / Địa Điểm Tiếp Nhận <span className="text-red-500">*</span>
                </label>
                <select
                  value={emergencyForm.maDiaDiem}
                  onChange={(e) =>
                    setEmergencyForm((prev) => ({ ...prev, maDiaDiem: e.target.value }))
                  }
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 font-semibold text-sm text-slate-900 focus:border-red-500 outline-none transition-all"
                >
                  {diaDiems.map((dd) => (
                    <option key={dd.maDiaDiem} value={dd.maDiaDiem}>
                      🏥 {dd.tenDiaDiem} ({dd.diaChiChiTiet})
                    </option>
                  ))}
                </select>
              </div>

              {/* Thông báo quy định thời gian */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
                <span className="material-symbols-outlined text-amber-600 text-xl shrink-0 mt-0.5 animate-bounce">timer</span>
                <div>
                  <b className="text-amber-950 font-extrabold">Quy trình tự động:</b> Thời gian bắt đầu được tính ngay từ <b>BÂY GIỜ</b> và đợt khẩn cấp sẽ <b>tự động đóng sau 12 giờ</b>.
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="h-11 px-5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={emergencySubmitting}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-base">
                    {emergencySubmitting ? "progress_activity" : "send"}
                  </span>
                  <span>
                    {emergencySubmitting ? "ĐANG PHÁT LỆNH..." : "🚨 PHÁT LỆNH KHẨN CẤP NGAY"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 MODAL XEM CHI TIẾT CHIẾN DỊCH & DANH SÁCH TNV ĐĂNG KÝ */}
      {modal === "detail" && selectedCampaign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header Modal */}
            <div className={`p-6 text-white relative ${
              selectedCampaign.mucDoUuTien === "KhanCap" || selectedCampaign.mucDoUuTien === 1
                ? "bg-gradient-to-r from-red-700 via-rose-600 to-red-800"
                : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] uppercase font-bold">
                      MÃ CD: {selectedCampaign.maChienDich}
                    </span>
                    {(selectedCampaign.mucDoUuTien === "KhanCap" || selectedCampaign.mucDoUuTien === 1) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-red-950 font-black text-[10px] uppercase tracking-wider animate-pulse">
                        🚨 CHIẾN DỊCH KHẨN CẤP (12H)
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black mt-2 leading-snug">
                    {selectedCampaign.tenChienDich}
                  </h2>
                  {(selectedCampaign.mucDoUuTien === "KhanCap" || selectedCampaign.mucDoUuTien === 1 || selectedCampaign.nhomMauCanKhapCap) && (
                    <div className="mt-2">
                      <span className="bg-white text-red-600 px-3 py-1 rounded-full font-black text-xs shadow-md inline-block">
                        🆘 CẦN GẤP MÁU: {selectedCampaign.nhomMauCanKhapCap ? selectedCampaign.nhomMauCanKhapCap.replace('_positive','+').replace('_negative','-') : "O+"}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Thông tin Địa điểm & Thời gian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/20 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-300">location_on</span>
                  <div className="truncate">
                    <p className="font-bold">{selectedCampaign.diaDiem?.tenDiaDiem || "Bệnh viện Đa Khoa Đà Nẵng"}</p>
                    <p className="text-slate-200 text-[11px] truncate">{selectedCampaign.diaDiem?.diaChi || selectedCampaign.diaDiem?.diaChiChiTiet || "Đà Nẵng"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-300">schedule</span>
                  <div>
                    <p className="font-bold">Thời gian diễn ra:</p>
                    <p className="text-slate-200 text-[11px]">
                      {new Date(selectedCampaign.thoiGianBD).toLocaleString('vi-VN')} - {new Date(selectedCampaign.thoiGianKT).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Body Modal: Danh sách TNV đăng ký */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600">group</span>
                  <span>Danh Sách Tình Nguyện Viên Đăng Ký ({campaignRegs.length})</span>
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Chỉ tiêu: {selectedCampaign.soLuongDuKien || 50} đơn vị
                </span>
              </div>

              {loadingRegs ? (
                <div className="py-12 text-center text-slate-400 font-medium">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Đang tải danh sách đăng ký...
                </div>
              ) : campaignRegs.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-1">person_off</span>
                  <p className="text-sm font-bold text-slate-600">Chưa có lượt đăng ký nào cho chiến dịch này</p>
                  <p className="text-xs text-slate-400 mt-1">Các thông tin đăng ký từ TNV sẽ xuất hiện ngay tại đây khi có người tham gia.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-black uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">Mã đơn</th>
                        <th className="p-3">Tình nguyện viên</th>
                        <th className="p-3">SĐT</th>
                        <th className="p-3 text-center">Nhóm máu</th>
                        <th className="p-3">Thời gian đăng ký</th>
                        <th className="p-3 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaignRegs.map((reg) => (
                        <tr key={reg.maDon} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-700">{reg.maDon}</td>
                          <td className="p-3 font-bold text-slate-900">{reg.tinhNguyenVien?.hoTen || reg.hoTen || "TNV"}</td>
                          <td className="p-3 text-slate-600">{reg.tinhNguyenVien?.soDienThoai || reg.soDienThoai || "—"}</td>
                          <td className="p-3 text-center font-black text-red-600 bg-red-50/50 rounded-lg">
                            {reg.tinhNguyenVien?.nhomMau ? reg.tinhNguyenVien.nhomMau.replace('_positive','+').replace('_negative','-') : (selectedCampaign.nhomMauCanKhapCap ? selectedCampaign.nhomMauCanKhapCap.replace('_positive','+').replace('_negative','-') : "Chưa rõ")}
                          </td>
                          <td className="p-3 text-slate-500">{new Date(reg.thoiGianDangKy || Date.now()).toLocaleString('vi-VN')}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                              {reg.trangThai || "ChoDuyet"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
              >
                Đóng cửa sổ
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
