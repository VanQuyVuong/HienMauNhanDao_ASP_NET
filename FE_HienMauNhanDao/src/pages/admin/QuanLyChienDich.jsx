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
  "Đang lập kế hoạch",
  "Đã phê duyệt",
  "Đang diễn ra",
  "Đã kết thúc",
];

const statusBadge = (status) => {
  const s = status || "";
  if (s.includes("diễn ra") && !s.includes("kết")) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (s.includes("phê duyệt") || s.includes("Sắp")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  if (s.includes("kết thúc")) {
    return "bg-slate-100 text-slate-600 border-slate-200";
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

const emptyForm = {
  tenChienDich: "",
  maDiaDiem: "",
  maNhanVien: "",
  thoiGianBD: "",
  thoiGianKT: "",
  soLuongDuKien: 100,
  trangThai: "Đang lập kế hoạch",
  imageUrl: "",
};

const PAGE_SIZE = 8;

export default function QuanLyChienDich() {
  const { searchQuery: headerSearch = "" } = useOutletContext() || {};
  const [campaigns, setCampaigns] = useState([]);
  const [diaDiems, setDiaDiems] = useState([]);
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
  const imageInputRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cdRes, ddRes] = await Promise.all([
        chienDichService.getChienDichsList(),
        diaDiemService.getAll(),
      ]);
      setCampaigns(Array.isArray(cdRes) ? cdRes : []);
      setDiaDiems(Array.isArray(ddRes) ? ddRes : []);
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
      (c) =>
        (c.trangThai || "").includes("diễn ra") &&
        !(c.trangThai || "").includes("kết"),
    ).length;
    const sapDienRa = campaigns.filter((c) =>
      (c.trangThai || "").includes("phê duyệt"),
    ).length;
    const daThu = campaigns.reduce((sum, c) => sum + (c.luongMauDaThu || 0), 0);
    return { total, dangDienRa, sapDienRa, daThu };
  }, [campaigns]);

  const filtered = useMemo(() => {
    const q = (search || headerSearch).trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchQ =
        !q ||
        (c.tenChienDich || "").toLowerCase().includes(q) ||
        (c.maChienDich || "").toLowerCase().includes(q) ||
        (c.diaDiem?.tenDiaDiem || "").toLowerCase().includes(q);
      const matchS = !filterStatus || c.trangThai === filterStatus;
      return matchQ && matchS;
    });
  }, [campaigns, search, filterStatus, headerSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openCreate = () => {
    setForm(emptyForm);
    setModal("create");
  };

  const openEdit = (c) => {
    setForm({
      tenChienDich: c.tenChienDich || "",
      maDiaDiem: c.diaDiem?.maDiaDiem || "",
      maNhanVien: c.maNhanVien || "",
      thoiGianBD: toDatetimeLocal(c.thoiGianBD),
      thoiGianKT: toDatetimeLocal(c.thoiGianKT),
      soLuongDuKien: c.soLuongDuKien || 100,
      trangThai: c.trangThai || "Đang lập kế hoạch",
      imageUrl: c.imageUrl || "",
    });
    setModal({ type: "edit", maChienDich: c.maChienDich });
  };

  const openDetail = async (c) => {
    setSelectedCampaign(c);
    setSearchReg("");
    setModal("detail");
    setLoadingRegs(true);
    try {
      const res = await donDangKyService.getAll();
      const allRegs = Array.isArray(res) ? res : (res?.content || []);
      const matched = allRegs.filter(d => String(d.maChienDich) === String(c.maChienDich));
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
    const payload = {
      tenChienDich: form.tenChienDich.trim(),
      maDiaDiem: form.maDiaDiem,
      maNhanVien: form.maNhanVien || null,
      thoiGianBD: fromDatetimeLocal(form.thoiGianBD),
      thoiGianKT: fromDatetimeLocal(form.thoiGianKT),
      soLuongDuKien: Number(form.soLuongDuKien) || 100,
      trangThai: form.trangThai,
      imageUrl: form.imageUrl || null,
    };
    setSubmitting(true);
    try {
      if (modal === "create") {
        await chienDichService.createChienDich(payload);
        Swal.fire("Thành công", "Đã tạo chiến dịch mới", "success");
      } else {
        await chienDichService.updateChienDich(modal.maChienDich, payload);
        Swal.fire("Thành công", "Đã cập nhật chiến dịch", "success");
      }
      setModal(null);
      loadData();
    } catch (err) {
      Swal.fire(
        "Lỗi",
        err?.response?.data?.message || "Thao tác thất bại",
        "error",
      );
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
              <h1 className="text-base font-black text-slate-900 tracking-tight">Quản lý Chiến dịch</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-[#e62e43] text-[9px] font-black uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[#e62e43] animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-slate-500 text-[11px] font-medium leading-none mt-0.5">Điều phối & theo dõi tiến độ hiến máu nhân đạo</p>
          </div>
        </div>

        {/* Mini Stats + Button in same row */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm" title="Tổng chiến dịch">
            <span className="material-symbols-outlined text-sm text-rose-400">event_available</span>
            <span>Tổng: <b>{stats.total}</b></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-sm" title="Đang diễn ra">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Diễn ra: <b>{stats.dangDienRa}</b></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shadow-sm" title="Sắp / phê duyệt">
            <span className="material-symbols-outlined text-sm">upcoming</span>
            <span>Sắp tới: <b>{stats.sapDienRa}</b></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-[#e62e43] border border-rose-200 text-xs font-bold shadow-sm" title="Đã thu nhận">
            <span className="material-symbols-outlined text-sm">bloodtype</span>
            <span>Đã thu: <b>{stats.daThu}</b> đv</span>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 h-9 px-4 bg-gradient-to-r from-[#e62e43] via-red-600 to-[#c01b30] text-white font-black text-xs rounded-xl hover:shadow-lg hover:shadow-[#e62e43]/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 group ml-1 shrink-0"
          >
            <span className="material-symbols-outlined text-base group-hover:rotate-90 transition-transform duration-300">add_circle</span>
            <span>Tạo chiến dịch mới</span>
          </button>
        </div>
      </div>

      {/* 🚀 ROW 2: SEARCH & FILTER CONTROL BAR */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl p-2.5 px-4 shadow-md shadow-slate-900/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#e62e43]">list_alt</span>
            Danh sách chiến dịch
          </span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-black text-[11px] rounded-full border border-slate-200 shadow-2xs">
            {filtered.length} mục
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative w-full sm:w-60">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
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
              <option key={s} value={s}>
                {s}
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
                      className="h-[84px] hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0 cursor-pointer hover:bg-red-200 transition-colors" onClick={() => openDetail(c)} title="Xem chi tiết & danh sách đăng ký">
                            <span className="material-symbols-outlined text-red-600">
                              volunteer_activism
                            </span>
                          </div>
                          <div className="truncate max-w-[200px]">
                            <p
                              onClick={() => openDetail(c)}
                              className="text-sm font-bold text-slate-900 truncate cursor-pointer hover:text-[#e62e43] transition-colors"
                              title="Nhấp để xem chi tiết & danh sách TNV đăng ký"
                            >
                              {c.tenChienDich}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              ID: {c.maChienDich}
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
                        <p className="text-sm text-slate-600 truncate max-w-[180px]">
                          {c.diaDiem?.tenDiaDiem || "—"}
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
                            className={`w-1.5 h-1.5 rounded-full mr-2 ${(c.trangThai || "").includes("diễn ra") ? "bg-green-600 animate-pulse" : "bg-current"}`}
                          />
                          {(c.trangThai || "—").toUpperCase()}
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

      {/* 🚀 MODAL CHI TIẾT & DANH SÁCH TNV ĐĂNG KÝ */}
      {modal === "detail" && selectedCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-7 py-5 flex items-center justify-between border-b border-slate-700/50 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e62e43] to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20 shrink-0">
                  <span className="material-symbols-outlined text-xl">event_note</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-black text-white text-base sm:text-lg tracking-tight">Chi tiết & Danh sách Đăng ký</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${statusBadge(selectedCampaign.trangThai)}`}>
                      {selectedCampaign.trangThai || "—"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5 font-medium">
                    <span>Mã ID: <b>{selectedCampaign.maChienDich}</b></span>
                    <span>•</span>
                    <span className="truncate max-w-[300px]">{selectedCampaign.tenChienDich}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-7 overflow-y-auto space-y-7 flex-1">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-inner">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-100/80 text-[#e62e43] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Địa điểm tổ chức</p>
                    <p className="text-sm font-bold text-slate-800 mt-1 truncate" title={selectedCampaign.diaDiem?.tenDiaDiem}>
                      {selectedCampaign.diaDiem?.tenDiaDiem || "---"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{selectedCampaign.diaDiem?.diaChi || "Đà Nẵng"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thời gian diễn ra</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      Bắt đầu: {toDatetimeLocal(selectedCampaign.thoiGianBD)?.replace("T", " ") || "---"}
                    </p>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">
                      Kết thúc: {toDatetimeLocal(selectedCampaign.thoiGianKT)?.replace("T", " ") || "---"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-xl">bloodtype</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tiến độ thu máu</p>
                      <span className="text-xs font-black text-emerald-600">{progressPct(selectedCampaign)}%</span>
                    </div>
                    <p className="text-sm font-black text-slate-800">
                      <span className="text-[#e62e43]">{selectedCampaign.luongMauDaThu || 0}</span> / {selectedCampaign.soLuongDuKien || 0} <span className="text-xs font-normal text-slate-500">đv</span>
                    </p>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full ${progressPct(selectedCampaign) >= 100 ? "bg-emerald-500" : "bg-[#e62e43]"}`}
                        style={{ width: `${progressPct(selectedCampaign)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Registrations Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-[#e62e43]">group</span>
                      Danh sách Tình nguyện viên đăng ký
                    </h4>
                    <span className="px-2.5 py-0.5 bg-rose-100 text-[#e62e43] font-black text-xs rounded-full border border-rose-200">
                      {campaignRegs.length} người
                    </span>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                    <input
                      value={searchReg}
                      onChange={(e) => setSearchReg(e.target.value)}
                      placeholder="Tìm tên TNV, CCCD, mã đơn..."
                      className="w-full h-9 bg-slate-100 hover:bg-slate-50 border border-transparent rounded-xl pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#e62e43]/40 focus:ring-2 focus:ring-[#e62e43]/10 transition-all"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {loadingRegs ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-[3px] border-[#e62e43] border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải dữ liệu đăng ký...</span>
                    </div>
                  ) : (() => {
                    const qReg = searchReg.trim().toLowerCase();
                    const filteredRegs = campaignRegs.filter((r) => {
                      if (!qReg) return true;
                      const ten = (r.tinhNguyenVien?.hoVaTen || r.maTNV || "").toLowerCase();
                      const cccd = (r.tinhNguyenVien?.soCCCD || "").toLowerCase();
                      const ma = (r.maDon || "").toLowerCase();
                      const stt = (r.trangThai || "").toLowerCase();
                      return ten.includes(qReg) || cccd.includes(qReg) || ma.includes(qReg) || stt.includes(qReg);
                    });

                    if (filteredRegs.length === 0) {
                      return (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          {searchReg ? "Không tìm thấy tình nguyện viên phù hợp" : "Chưa có tình nguyện viên nào đăng ký tham gia chiến dịch này"}
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                              <th className="py-3 px-4">Mã đơn</th>
                              <th className="py-3 px-4">Tình nguyện viên</th>
                              <th className="py-3 px-4">Số CCCD / SĐT</th>
                              <th className="py-3 px-4 text-center">Thể tích</th>
                              <th className="py-3 px-4 text-center">Trạng thái</th>
                              <th className="py-3 px-4 text-right">Xử lý bởi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredRegs.map((r) => (
                              <tr key={r.maDon} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-[#e62e43]">
                                  <span className="px-2 py-0.5 bg-rose-50 rounded border border-rose-100">{r.maDon}</span>
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  {r.tinhNguyenVien?.hoVaTen || r.maTNV || "---"}
                                </td>
                                <td className="py-3 px-4 text-slate-500 font-mono">
                                  {r.tinhNguyenVien?.soCCCD || r.tinhNguyenVien?.soDienThoai || "---"}
                                </td>
                                <td className="py-3 px-4 text-center font-bold">
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg">{r.theTich || 250} ml</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase
                                    ${r.trangThai === "DA_KHAM" ? "bg-green-100 text-green-700" :
                                      r.trangThai === "CHO_KHAM" ? "bg-amber-100 text-amber-700" :
                                      r.trangThai === "DA_THU_NHAN" ? "bg-blue-100 text-blue-700" :
                                      "bg-slate-100 text-slate-600"}`}>
                                    {r.trangThai === "CHO_KHAM" ? "Chờ khám" :
                                      r.trangThai === "DA_KHAM" ? "Đã khám" :
                                      r.trangThai === "DA_THU_NHAN" ? "Đã thu máu" :
                                      r.trangThai === "HUY" ? "Đã hủy" :
                                      r.trangThai || "Chờ xử lý"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-slate-500 font-mono">
                                  {r.maNV ? (
                                    <span className="text-blue-600 font-bold flex items-center justify-end gap-1">
                                      <span className="material-symbols-outlined text-xs">badge</span>
                                      {r.maNV}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">TNV tự đăng ký</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-7 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="h-10 px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 MODAL TẠO MỚI / CHỈNH SỬA CHIẾN DỊCH */}
      {(modal === "create" || modal?.type === "edit") && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-7 py-5 flex items-center justify-between border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e62e43] to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                  <span className="material-symbols-outlined text-xl">
                    {modal === "create" ? "add_circle" : "edit_document"}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg tracking-tight">
                    {modal === "create" ? "Tạo chiến dịch mới" : "Chỉnh sửa chiến dịch"}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">
                    {modal === "create" ? "Thiết lập thông tin điểm hiến máu mới" : `Cập nhật thông tin ID: ${modal.maChienDich}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">
                  close
                </span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Tên chiến dịch *
                </label>
                <input
                  required
                  value={form.tenChienDich}
                  onChange={(e) =>
                    setForm({ ...form, tenChienDich: e.target.value })
                  }
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Địa điểm *
                </label>
                <select
                  required
                  value={form.maDiaDiem}
                  onChange={(e) =>
                    setForm({ ...form, maDiaDiem: e.target.value })
                  }
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white outline-none"
                >
                  <option value="">-- Chọn địa điểm --</option>
                  {diaDiems.map((d) => (
                    <option key={d.maDiaDiem} value={d.maDiaDiem}>
                      {d.tenDiaDiem}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Bắt đầu *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.thoiGianBD}
                    onChange={(e) =>
                      setForm({ ...form, thoiGianBD: e.target.value })
                    }
                    className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Kết thúc *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.thoiGianKT}
                    onChange={(e) =>
                      setForm({ ...form, thoiGianKT: e.target.value })
                    }
                    className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Chỉ tiêu (đv)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.soLuongDuKien}
                    onChange={(e) =>
                      setForm({ ...form, soLuongDuKien: e.target.value })
                    }
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Trạng thái
                  </label>
                  <select
                    value={form.trangThai}
                    onChange={(e) =>
                      setForm({ ...form, trangThai: e.target.value })
                    }
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Hình ảnh
                </label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <div className="flex flex-col gap-3">
                  {form.imageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={toImageSrc(form.imageUrl)}
                        alt="Xem trước ảnh chiến dịch"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                        title="Xóa ảnh"
                      >
                        <span className="material-symbols-outlined text-base">
                          close
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-3xl mb-1">
                        image
                      </span>
                      <p className="text-xs font-medium">
                        Chưa có ảnh chiến dịch
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {uploadingImage
                          ? "progress_activity"
                          : "add_photo_alternate"}
                      </span>
                      {uploadingImage ? "Đang tải ảnh..." : "Thêm ảnh"}
                    </button>
                    {form.imageUrl && (
                      <span
                        className="text-xs text-slate-500 truncate max-w-[220px]"
                        title={form.imageUrl}
                      >
                        {form.imageUrl}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ảnh được lưu vào thư mục public/images (JPG, PNG, WEBP, GIF
                    — tối đa 5MB).
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 h-11 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 disabled:opacity-60"
                >
                  {submitting
                    ? "Đang lưu..."
                    : modal === "create"
                      ? "Tạo chiến dịch"
                      : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
