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
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Chiến dịch
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý và theo dõi tiến độ các hoạt động hiến máu tình nguyện.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add_circle
          </span>
          Tạo chiến dịch mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Tổng chiến dịch",
            value: stats.total,
            icon: "event_available",
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Đang diễn ra",
            value: stats.dangDienRa,
            icon: "running_with_errors",
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Sắp / phê duyệt",
            value: stats.sapDienRa,
            icon: "upcoming",
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Đã thu nhận",
            value: stats.daThu,
            icon: "bloodtype",
            color: "bg-red-50 text-red-600",
            suffix: " đv",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}
            >
              <span className="material-symbols-outlined text-2xl">
                {s.icon}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-2xl font-black text-slate-900">
                {s.value}
                {s.suffix && (
                  <span className="text-sm font-medium text-slate-400">
                    {s.suffix}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-slate-900">
              Danh sách chiến dịch
            </span>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[11px] font-bold rounded-full">
              {filtered.length} MỤC
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm tên, mã, địa điểm..."
              className="h-9 w-52 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
              className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white outline-none"
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
                          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-red-600">
                              volunteer_activism
                            </span>
                          </div>
                          <div className="truncate max-w-[200px]">
                            <p className="text-sm font-bold text-slate-900 truncate">
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

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-700 to-red-900 px-7 py-6 flex items-center justify-between">
              <h3 className="font-black text-white text-lg">
                {modal === "create"
                  ? "Tạo chiến dịch mới"
                  : "Chỉnh sửa chiến dịch"}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <span className="material-symbols-outlined text-white">
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
