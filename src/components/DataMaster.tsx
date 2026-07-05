import React, { useState } from "react";
import { DatabaseState, Siswa, Kelas, MataPelajaran, Guru, GuruMapelKelas, Role } from "../types";
import { Plus, Edit2, Trash2, Shield, Settings, UserPlus, BookOpen, Layers, Users, RefreshCw } from "lucide-react";

interface DataMasterProps {
  db: DatabaseState;
  currentUser: { id: string; nama: string; username: string; role: Role } | null;
  onRefresh: () => void;
}

export default function DataMaster({ db, currentUser, onRefresh }: DataMasterProps) {
  const isWaliKelas = currentUser?.role === "wali_kelas";
  const [activeTab, setActiveTab] = useState<"siswa" | "kelas" | "mapel" | "guru" | "pengaturan">("siswa");

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Siswa Form
  const [siswaNama, setSiswaNama] = useState("");
  const [siswaNISN, setSiswaNISN] = useState("");
  const [siswaKelas, setSiswaKelas] = useState("");
  const [siswaGender, setSiswaGender] = useState<"L" | "P">("L");

  // Kelas Form
  const [kelasNama, setKelasNama] = useState("");
  const [kelasWali, setKelasWali] = useState("");

  // Mapel Form
  const [mapelNama, setMapelNama] = useState("");
  const [mapelKKM, setMapelKKM] = useState(75);

  // Guru Form
  const [guruNama, setGuruNama] = useState("");
  const [guruUsername, setGuruUsername] = useState("");
  const [guruPassword, setGuruPassword] = useState("");
  const [guruRole, setGuruRole] = useState<Role>("guru_mapel");

  // Guru Mapel Kelas Mapping Form
  const [mappingGuru, setMappingGuru] = useState("");
  const [mappingMapel, setMappingMapel] = useState("");
  const [mappingKelas, setMappingKelas] = useState("");

  // Settings state
  const [tahunAjaran, setTahunAjaran] = useState(db.settings.tahun_ajaran);
  const [semester, setSemester] = useState<"Ganjil" | "Genap">(db.settings.semester);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setSiswaNama("");
    setSiswaNISN("");
    setSiswaKelas(db.kelas[0]?.id || "");
    setSiswaGender("L");

    setKelasNama("");
    setKelasWali("");

    setMapelNama("");
    setMapelKKM(75);

    setGuruNama("");
    setGuruUsername("");
    setGuruPassword("");
    setGuruRole("guru_mapel");

    setMappingGuru(db.guru[0]?.id || "");
    setMappingMapel(db.mata_pelajaran[0]?.id || "");
    setMappingKelas(db.kelas[0]?.id || "");

    setIsModalOpen(true);
  };

  const handleEditSiswa = (s: Siswa) => {
    setEditingId(s.id);
    setSiswaNama(s.nama);
    setSiswaNISN(s.NISN);
    setSiswaKelas(s.kelas_id);
    setSiswaGender(s.jenis_kelamin);
    setIsModalOpen(true);
  };

  const handleEditKelas = (k: Kelas) => {
    setEditingId(k.id);
    setKelasNama(k.nama_kelas);
    setKelasWali(k.wali_kelas);
    setIsModalOpen(true);
  };

  const handleEditMapel = (mp: MataPelajaran) => {
    setEditingId(mp.id);
    setMapelNama(mp.nama);
    setMapelKKM(mp.KKM);
    setIsModalOpen(true);
  };

  const handleEditGuru = (g: any) => {
    setEditingId(g.id);
    setGuruNama(g.nama);
    setGuruUsername(g.username);
    setGuruPassword(""); // keep empty to preserve unless changed
    setGuruRole(g.role);
    setIsModalOpen(true);
  };

  // Submit Operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === "siswa") {
        const finalKelas = siswaKelas || (db.kelas[0]?.id || "");
        const finalGender = siswaGender || "L";
        if (!siswaNama.trim() || !siswaNISN.trim() || !finalKelas) {
          throw new Error("Semua field (Nama, NISN, Kelas, Jenis Kelamin) harus diisi!");
        }
        const payload: Siswa = {
          id: editingId || "",
          nama: siswaNama.trim(),
          NISN: siswaNISN.trim(),
          kelas_id: finalKelas,
          jenis_kelamin: finalGender,
          dibuat_oleh: currentUser?.id || "g_admin",
        };
        const res = await fetch("/api/siswa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal menyimpan data siswa");
        showMsg(editingId ? "Data siswa berhasil diperbarui!" : "Siswa baru berhasil ditambahkan!");
      } else if (activeTab === "kelas") {
        if (!kelasNama || !kelasWali) throw new Error("Semua field harus diisi!");
        const payload: Kelas = {
          id: editingId || "",
          nama_kelas: kelasNama,
          wali_kelas: kelasWali,
        };
        const res = await fetch("/api/kelas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal menyimpan kelas");
        showMsg("Kelas berhasil disimpan!");
      } else if (activeTab === "mapel") {
        if (!mapelNama || !mapelKKM) throw new Error("Semua field harus diisi!");
        const payload: MataPelajaran = {
          id: editingId || "",
          nama: mapelNama,
          KKM: Number(mapelKKM),
        };
        const res = await fetch("/api/mapel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal menyimpan mata pelajaran");
        showMsg("Mata pelajaran berhasil disimpan!");
      } else if (activeTab === "guru") {
        if (!guruNama || !guruUsername) throw new Error("Nama dan username wajib diisi!");
        const payload: any = {
          id: editingId || "",
          nama: guruNama,
          username: guruUsername,
          role: guruRole,
        };
        if (guruPassword) {
          payload.password = guruPassword;
        }
        const res = await fetch("/api/guru", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal menyimpan data guru");
        showMsg("Data guru berhasil disimpan!");
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showMsg(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: "siswa" | "kelas" | "mapel" | "guru" | "gmk", id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini? Semua data nilai dan presensi terkait mungkin juga akan ikut terhapus.")) {
      return;
    }
    try {
      let endpoint = `/api/${type}/${id}`;
      if (type === "gmk") {
        endpoint = `/api/guru-mapel-kelas/${id}`;
      }
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        let errorMsg = "Gagal menghapus data";
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Fallback if not valid JSON
        }
        throw new Error(errorMsg);
      }
      showMsg("Data berhasil dihapus!");
      onRefresh();
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  // Mapping Add Submit
  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingGuru || !mappingMapel || !mappingKelas) {
      showMsg("Lengkapi seluruh pemetaan!", "error");
      return;
    }
    try {
      const payload: GuruMapelKelas = {
        id: "",
        guru_id: mappingGuru,
        mapel_id: mappingMapel,
        kelas_id: mappingKelas,
      };
      const res = await fetch("/api/guru-mapel-kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pemetaan");
      showMsg("Pemetaan guru berhasil ditambahkan!");
      onRefresh();
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  // Save Settings Submit
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tahun_ajaran: tahunAjaran, semester }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
      showMsg("Pengaturan aktif berhasil disimpan!");
      onRefresh();
    } catch (err: any) {
      showMsg(err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with active user notifications */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Data Master Administrasi</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Kelola data fundamental sekolah untuk keperluan presensi, penilaian, dan rapor siswa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-green-800 bg-green-50 border border-green-200/40 rounded-lg hover:bg-green-100 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Segarkan
          </button>
          {!isWaliKelas && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/50">
              <Shield className="w-3.5 h-3.5" /> Mode Baca Saja (Guru Mapel)
            </span>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm font-semibold ${
            message.type === "success" ? "bg-green-50 text-green-800 border border-green-150" : "bg-rose-50 text-rose-800 border border-rose-150"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
        <button
          onClick={() => setActiveTab("siswa")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
            activeTab === "siswa" ? "bg-green-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4" /> Data Siswa ({db.siswa.length})
        </button>
        <button
          onClick={() => setActiveTab("kelas")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
            activeTab === "kelas" ? "bg-green-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" /> Kelas ({db.kelas.length})
        </button>
        <button
          onClick={() => setActiveTab("mapel")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
            activeTab === "mapel" ? "bg-green-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Mata Pelajaran ({db.mata_pelajaran.length})
        </button>
        <button
          onClick={() => setActiveTab("guru")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
            activeTab === "guru" ? "bg-green-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Shield className="w-4 h-4" /> Guru & Pemetaan ({db.guru.length})
        </button>
        {isWaliKelas && (
          <button
            onClick={() => setActiveTab("pengaturan")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
              activeTab === "pengaturan" ? "bg-green-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Settings className="w-4 h-4" /> Pengaturan Semester
          </button>
        )}
      </div>

      {/* Main Grid Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {/* TAB 1: SISWA */}
        {activeTab === "siswa" && (
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg">Siswa Terdaftar</h3>
              {isWaliKelas && (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Siswa
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">L/P</th>
                    <th className="py-3 px-4">Kelas</th>
                    {isWaliKelas && <th className="py-3 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {db.siswa.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                        Belum ada siswa terdaftar. Klik 'Tambah Siswa' untuk mengisi.
                      </td>
                    </tr>
                  ) : (
                    db.siswa.map((s, idx) => {
                      const kelasNamaStr = db.kelas.find((k) => k.id === s.kelas_id)?.nama_kelas || "-";
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono text-xs">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{s.nama}</td>
                          <td className="py-3.5 px-4 font-mono text-xs">{s.NISN}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                s.jenis_kelamin === "L" ? "bg-sky-50 text-sky-700 border border-sky-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}
                            >
                              {s.jenis_kelamin}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-green-800">{kelasNamaStr}</td>
                          {isWaliKelas && (
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditSiswa(s)}
                                  className="p-1.5 text-slate-500 hover:text-green-750 hover:bg-green-50 rounded transition-all"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete("siswa", s.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: KELAS */}
        {activeTab === "kelas" && (
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg">Daftar Kelas</h3>
              {isWaliKelas && (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Kelas
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Nama Kelas</th>
                    <th className="py-3 px-4">Wali Kelas</th>
                    {isWaliKelas && <th className="py-3 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {db.kelas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                        Belum ada kelas terdaftar.
                      </td>
                    </tr>
                  ) : (
                    db.kelas.map((k, idx) => (
                      <tr key={k.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-mono text-xs">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{k.nama_kelas}</td>
                        <td className="py-3.5 px-4 font-bold text-green-800">{k.wali_kelas}</td>
                        {isWaliKelas && (
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditKelas(k)}
                                className="p-1.5 text-slate-500 hover:text-green-750 hover:bg-green-50 rounded transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete("kelas", k.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MATA PELAJARAN */}
        {activeTab === "mapel" && (
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg">Mata Pelajaran & KKM</h3>
              {isWaliKelas && (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Mata Pelajaran
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Nama Mata Pelajaran</th>
                    <th className="py-3 px-4">Kriteria Ketuntasan Minimal (KKM)</th>
                    {isWaliKelas && <th className="py-3 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {db.mata_pelajaran.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                        Belum ada mata pelajaran terdaftar.
                      </td>
                    </tr>
                  ) : (
                    db.mata_pelajaran.map((mp, idx) => (
                      <tr key={mp.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-mono text-xs">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{mp.nama}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-green-50 text-green-800 font-mono text-xs font-bold px-2.5 py-1 rounded border border-green-200/50">
                            {mp.KKM}
                          </span>
                        </td>
                        {isWaliKelas && (
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditMapel(mp)}
                                className="p-1.5 text-slate-500 hover:text-green-750 hover:bg-green-50 rounded transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete("mapel", mp.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GURU & PEMETAAN */}
        {activeTab === "guru" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
            {/* Left list: Teachers */}
            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-slate-850 text-base">Daftar Guru Terdaftar</h4>
                {isWaliKelas && (
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-1 text-xs text-green-800 font-bold bg-green-50 hover:bg-green-100 border border-green-200/50 py-1.5 px-3 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Guru
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="py-2.5 px-3">Nama</th>
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">Role</th>
                      {isWaliKelas && <th className="py-2.5 px-3 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                    {db.guru.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/30 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-950">{g.nama}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{g.username}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              g.role === "wali_kelas" ? "bg-green-100 text-green-800 border border-green-200/50" : "bg-slate-150 text-slate-750 border border-slate-200/50"
                            }`}
                          >
                            {g.role === "wali_kelas" ? "Wali Kelas / Admin" : "Guru Mapel"}
                          </span>
                        </td>
                        {isWaliKelas && (
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleEditGuru(g)}
                                className="p-1 text-slate-500 hover:text-green-700 rounded transition"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              {g.id !== "g_admin" && (
                                <button
                                  onClick={() => handleDelete("guru", g.id)}
                                  className="p-1 text-slate-500 hover:text-rose-600 rounded transition"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right list: Mapping */}
            <div className="space-y-4 lg:col-span-5">
              <h4 className="font-display font-bold text-slate-850 text-base">
                Pemetaan Tugas Mengajar (Guru ke Mapel & Kelas)
              </h4>

              {isWaliKelas && (
                <form onSubmit={handleAddMapping} className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Guru</label>
                      <select
                        value={mappingGuru}
                        onChange={(e) => setMappingGuru(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
                      >
                        {db.guru.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Mata Pelajaran</label>
                      <select
                        value={mappingMapel}
                        onChange={(e) => setMappingMapel(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
                      >
                        {db.mata_pelajaran.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nama} (KKM {m.KKM})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Kelas Diampu</label>
                      <select
                        value={mappingKelas}
                        onChange={(e) => setMappingKelas(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
                      >
                        {db.kelas.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.nama_kelas}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-lg transition shadow-sm"
                  >
                    Tambah Pemetaan
                  </button>
                </form>
              )}

              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs">
                      <th className="py-2 px-3">Guru</th>
                      <th className="py-2 px-3">Mapel & Kelas</th>
                      {isWaliKelas && <th className="py-2 px-3 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 text-xs">
                    {db.guru_mapel_kelas.map((gmk) => {
                      const teacher = db.guru.find((g) => g.id === gmk.guru_id)?.nama || "-";
                      const subject = db.mata_pelajaran.find((m) => m.id === gmk.mapel_id)?.nama || "-";
                      const klass = db.kelas.find((k) => k.id === gmk.kelas_id)?.nama_kelas || "-";
                      return (
                        <tr key={gmk.id} className="hover:bg-slate-50/30 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{teacher}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-green-800">{subject}</span>
                            <span className="mx-1 text-slate-300">|</span>
                            <span className="text-slate-500 font-semibold">{klass}</span>
                          </td>
                          {isWaliKelas && (
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => handleDelete("gmk", gmk.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PENGATURAN SEMESTER (Wali Kelas / Admin only) */}
        {activeTab === "pengaturan" && isWaliKelas && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="font-display font-bold text-gray-800 text-lg">Pengaturan Sistem Aktif</h3>
              <p className="text-sm text-gray-500 mt-1">
                Ganti tahun ajaran atau semester aktif. Semua input nilai UH/UTS/PAS yang baru akan direkam di semester terpilih.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                <select
                  value={tahunAjaran}
                  onChange={(e) => setTahunAjaran(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-sm rounded-lg px-3 py-2.5 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition font-medium"
                  required
                >
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Semester Aktif</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="semester"
                      value="Ganjil"
                      checked={semester === "Ganjil"}
                      onChange={() => setSemester("Ganjil")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-800">Ganjil (1)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="semester"
                      value="Genap"
                      checked={semester === "Genap"}
                      onChange={() => setSemester("Genap")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-800">Genap (2)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition"
              >
                Simpan Konfigurasi
              </button>
            </form>
          </div>
        )}
      </div>

      {/* FORM MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-luxury border border-gray-100 max-w-md w-full overflow-hidden">
            <div className="bg-emerald-900 text-white p-5">
              <h3 className="font-display font-bold text-lg">
                {editingId ? "Edit" : "Tambah"} Data {activeTab.toUpperCase()}
              </h3>
              <p className="text-xs text-emerald-100 mt-1">Isi formulir berikut dengan benar.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Form Siswa */}
              {activeTab === "siswa" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nama Lengkap Siswa</label>
                    <input
                      type="text"
                      value={siswaNama}
                      onChange={(e) => setSiswaNama(e.target.value)}
                      placeholder="e.g. Aditya Pratama"
                      className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">NISN (10 Digit)</label>
                    <input
                      type="text"
                      value={siswaNISN}
                      onChange={(e) => setSiswaNISN(e.target.value)}
                      maxLength={10}
                      placeholder="e.g. 0081234561"
                      className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Jenis Kelamin</label>
                      <select
                        value={siswaGender}
                        onChange={(e) => setSiswaGender(e.target.value as "L" | "P")}
                        className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500"
                      >
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Kelas</label>
                      <select
                        value={siswaKelas}
                        onChange={(e) => setSiswaKelas(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500"
                      >
                        {db.kelas.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.nama_kelas}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Kelas */}
              {activeTab === "kelas" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nama Kelas</label>
                    <input
                      type="text"
                      value={kelasNama}
                      onChange={(e) => setKelasNama(e.target.value)}
                      placeholder="e.g. Kelas 9-A"
                      className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Wali Kelas</label>
                    <input
                      type="text"
                      value={kelasWali}
                      onChange={(e) => setKelasWali(e.target.value)}
                      placeholder="e.g. Drs. Budi Santoso"
                      className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Form Mata Pelajaran */}
              {activeTab === "mapel" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nama Mata Pelajaran</label>
                    <input
                      type="text"
                      value={mapelNama}
                      onChange={(e) => setMapelNama(e.target.value)}
                      placeholder="e.g. Matematika"
                      className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Kriteria Ketuntasan Minimal (KKM)</label>
                    <input
                      type="number"
                      value={mapelKKM}
                      onChange={(e) => setMapelKKM(Number(e.target.value))}
                      min={0}
                      max={100}
                      className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Form Guru */}
              {activeTab === "guru" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nama Guru + Gelar</label>
                    <input
                      type="text"
                      value={guruNama}
                      onChange={(e) => setGuruNama(e.target.value)}
                      placeholder="e.g. Siti Aminah, S.Pd."
                      className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Username Login</label>
                      <input
                        type="text"
                        value={guruUsername}
                        onChange={(e) => setGuruUsername(e.target.value)}
                        placeholder="e.g. guru1"
                        className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Password</label>
                      <input
                        type="password"
                        value={guruPassword}
                        onChange={(e) => setGuruPassword(e.target.value)}
                        placeholder={editingId ? "Abaikan jika tidak diubah" : "Password login"}
                        className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500"
                        required={!editingId}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Akses Role</label>
                    <select
                      value={guruRole}
                      onChange={(e) => setGuruRole(e.target.value as Role)}
                      className="w-full bg-white border border-gray-200 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500"
                    >
                      <option value="guru_mapel">Guru Mapel</option>
                      <option value="wali_kelas">Wali Kelas / Admin</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Form buttons */}
              <div className="flex gap-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition"
                >
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
