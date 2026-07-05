import React, { useState, useEffect } from "react";
import { DatabaseState, StatusAbsensi, Role } from "../types";
import { Calendar, Save, FileSpreadsheet, Check, RefreshCw, AlertCircle, Users } from "lucide-react";

interface AbsensiEditorProps {
  db: DatabaseState;
  currentUser: { id: string; nama: string; username: string; role: Role } | null;
  onRefresh: () => void;
}

export default function AbsensiEditor({ db, currentUser, onRefresh }: AbsensiEditorProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] // default to today's date
  );
  const [selectedKelasId, setSelectedKelasId] = useState<string>(
    db.kelas[0]?.id || ""
  );

  // Active inputs state
  const [tempAbsensi, setTempAbsensi] = useState<{ [siswa_id: string]: StatusAbsensi }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"input" | "rekap" | "rekap-bulanan">("input");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  const selectedKelas = db.kelas.find((k) => k.id === selectedKelasId);
  const filteredSiswa = db.siswa.filter((s) => s.kelas_id === selectedKelasId);

  // When date or class changes, fetch existing attendance from the local dbState
  useEffect(() => {
    const freshTemp: { [siswa_id: string]: StatusAbsensi } = {};
    filteredSiswa.forEach((s) => {
      // Find if there is an existing record
      const match = db.absensi.find((a) => a.siswa_id === s.id && a.tanggal === selectedDate);
      freshTemp[s.id] = match ? match.status : "Hadir"; // default to "Hadir"
    });
    setTempAbsensi(freshTemp);
  }, [selectedDate, selectedKelasId, db.absensi]);

  const handleStatusChange = (siswaId: string, status: StatusAbsensi) => {
    setTempAbsensi((prev) => ({
      ...prev,
      [siswaId]: status,
    }));
  };

  const handleSetAllPresent = () => {
    const updated = { ...tempAbsensi };
    filteredSiswa.forEach((s) => {
      updated[s.id] = "Hadir";
    });
    setTempAbsensi(updated);
    setMessage({ text: "Semua siswa diatur ke Hadir. Klik 'Simpan Presensi' untuk menyimpan.", type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const items = Object.entries(tempAbsensi).map(([siswa_id, status]) => ({
        siswa_id,
        status,
      }));

      const res = await fetch("/api/absensi/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: selectedDate,
          items,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan presensi.");

      setMessage({ text: `Presensi tanggal ${selectedDate} berhasil disimpan!`, type: "success" });
      onRefresh();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rekap summary calculator
  const rekapData = filteredSiswa.map((s) => {
    const studentAbsensi = db.absensi.filter((a) => a.siswa_id === s.id);
    const counts = {
      Hadir: 0,
      Sakit: 0,
      Izin: 0,
      Alpa: 0,
    };
    studentAbsensi.forEach((a) => {
      if (a.status in counts) {
        counts[a.status]++;
      }
    });
    const totalDays = counts.Hadir + counts.Sakit + counts.Izin + counts.Alpa;
    const kehadiranPersen = totalDays > 0 ? Math.round((counts.Hadir / totalDays) * 100) : 100;

    return {
      siswa: s,
      counts,
      kehadiranPersen,
    };
  });

  // Export spreadsheet as CSV
  const handleExportCSV = () => {
    const headers = ["No", "Nama Siswa", "NISN", "Hadir (H)", "Sakit (S)", "Izin (I)", "Alpa (A)", "% Kehadiran"];
    const rows = rekapData.map((r, idx) => [
      idx + 1,
      r.siswa.nama,
      `'${r.siswa.NISN}`, // single quote to preserve string in excel
      r.counts.Hadir,
      r.counts.Sakit,
      r.counts.Izin,
      r.counts.Alpa,
      `${r.kehadiranPersen}%`,
    ]);

    const csvContent =
      "\uFEFF" + // UTF-8 BOM so Excel opens indonesian characters correctly
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Kehadiran_${selectedKelas?.nama_kelas || "Kelas"}_Semester_${db.settings.semester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Monthly Rekap summary calculator
  const monthlyRekapData = filteredSiswa.map((s) => {
    const studentAbsensi = db.absensi.filter((a) => {
      if (a.siswa_id !== s.id) return false;
      const [yearStr, monthStr] = a.tanggal.split("-");
      return Number(yearStr) === selectedYear && Number(monthStr) === selectedMonth;
    });

    const statusByDay: { [day: number]: StatusAbsensi } = {};
    const counts = {
      Hadir: 0,
      Sakit: 0,
      Izin: 0,
      Alpa: 0,
    };

    studentAbsensi.forEach((a) => {
      const parts = a.tanggal.split("-");
      if (parts.length === 3) {
        const dayNum = Number(parts[2]);
        statusByDay[dayNum] = a.status;
        if (a.status in counts) {
          counts[a.status]++;
        }
      }
    });

    const totalDays = counts.Hadir + counts.Sakit + counts.Izin + counts.Alpa;
    const kehadiranPersen = totalDays > 0 ? Math.round((counts.Hadir / totalDays) * 100) : 100;

    return {
      siswa: s,
      statusByDay,
      counts,
      kehadiranPersen,
    };
  });

  // Export Monthly spreadsheet as CSV
  const handleExportMonthlyCSV = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const headers = [
      "No",
      "Nama Siswa",
      "NISN",
      ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1)),
      "Hadir (H)",
      "Sakit (S)",
      "Izin (I)",
      "Alpa (A)",
      "% Kehadiran"
    ];

    const rows = monthlyRekapData.map((r, idx) => {
      const dayStatuses = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        const status = r.statusByDay[d];
        if (!status) return "-";
        if (status === "Hadir") return "H";
        if (status === "Sakit") return "S";
        if (status === "Izin") return "I";
        if (status === "Alpa") return "A";
        return "-";
      });

      return [
        idx + 1,
        r.siswa.nama,
        `'${r.siswa.NISN}`,
        ...dayStatuses,
        r.counts.Hadir,
        r.counts.Sakit,
        r.counts.Izin,
        r.counts.Alpa,
        `${r.kehadiranPersen}%`
      ];
    });

    const csvContent =
      "\uFEFF" + // UTF-8 BOM so Excel opens indonesian characters correctly
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const monthName = months.find(m => m.value === selectedMonth)?.label || "Bulan";
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Bulanan_${selectedKelas?.nama_kelas || "Kelas"}_${monthName}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Modul Presensi Siswa</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Kelola kehadiran harian siswa untuk Semester {db.settings.semester} TA {db.settings.tahun_ajaran}.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap gap-1">
          <button
            onClick={() => setViewMode("input")}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
              viewMode === "input" ? "bg-green-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Input Presensi Harian
          </button>
          <button
            onClick={() => setViewMode("rekap-bulanan")}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
              viewMode === "rekap-bulanan" ? "bg-green-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rekap Bulanan
          </button>
          <button
            onClick={() => setViewMode("rekap")}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
              viewMode === "rekap" ? "bg-green-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rekap Semester
          </button>
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

      {/* Filter Options */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Kelas</label>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-green-600 focus:bg-white transition"
            >
              {db.kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kelas} (Wali: {k.wali_kelas})
                </option>
              ))}
            </select>
          </div>

          {viewMode === "rekap-bulanan" && (
            <>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-green-600 focus:bg-white transition"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-green-600 focus:bg-white transition font-mono"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {viewMode === "input" && (
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal Presensi</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-green-600 focus:bg-white font-mono transition"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: DAILY INPUT SPREADSHEET */}
      {viewMode === "input" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Action header inside grid */}
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-850" />
              <span className="text-sm font-bold text-slate-800">
                Presensi: {filteredSiswa.length} Siswa Terdaftar
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSetAllPresent}
                className="flex items-center gap-1.5 bg-green-50 border border-green-200 hover:bg-green-100 text-green-800 text-xs font-bold py-2 px-3.5 rounded-lg transition"
              >
                <Check className="w-3.5 h-3.5" /> Set Semua Hadir
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold bg-slate-50/50">
                  <th className="py-3 px-6">No</th>
                  <th className="py-3 px-6">Nama Lengkap Siswa</th>
                  <th className="py-3 px-6">NISN</th>
                  <th className="py-3 px-6">L/P</th>
                  <th className="py-3 px-6 text-center">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                      Belum ada siswa di kelas ini. Kelola data siswa di menu 'Data Master Siswa'.
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map((siswa, idx) => {
                    const currentStatus = tempAbsensi[siswa.id] || "Hadir";
                    return (
                      <tr key={siswa.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-mono text-xs">{idx + 1}</td>
                        <td className="py-4 px-6 font-bold text-slate-900">{siswa.nama}</td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-400">{siswa.NISN}</td>
                        <td className="py-4 px-6 text-xs font-bold text-slate-500">{siswa.jenis_kelamin}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-3 max-w-xs mx-auto">
                            {(["Hadir", "Sakit", "Izin", "Alpa"] as StatusAbsensi[]).map((status) => {
                              const colorMap = {
                                Hadir: { active: "bg-green-700 text-white shadow-sm border-green-700", inactive: "text-green-800 border-green-100 hover:bg-green-50" },
                                Sakit: { active: "bg-sky-650 text-white shadow-sm border-sky-650", inactive: "text-sky-700 border-sky-100 hover:bg-sky-50" },
                                Izin: { active: "bg-amber-500 text-white shadow-sm border-amber-500", inactive: "text-amber-700 border-amber-100 hover:bg-amber-50" },
                                Alpa: { active: "bg-rose-655 text-white shadow-sm border-rose-655", inactive: "text-rose-700 border-rose-100 hover:bg-rose-50" },
                              };
                              const isSelected = currentStatus === status;
                              const currentColors = colorMap[status];

                              return (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(siswa.id, status)}
                                  className={`flex-1 text-center py-1.5 px-2 sm:px-3 rounded-lg border text-xs font-bold transition whitespace-nowrap ${
                                    isSelected ? currentColors.active : currentColors.inactive
                                  }`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredSiswa.length > 0 && (
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition"
              >
                <Save className="w-4 h-4" /> {isSubmitting ? "Menyimpan..." : "Simpan Presensi"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SEMESTER SUMMARY & REKAP */}
      {viewMode === "rekap" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-800">
                Laporan Kehadiran Kelas - Semester {db.settings.semester}
              </span>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export ke Excel (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold bg-slate-50/50">
                  <th className="py-3.5 px-6">No</th>
                  <th className="py-3.5 px-6">Nama Siswa</th>
                  <th className="py-3.5 px-4">NISN</th>
                  <th className="py-3.5 px-4 text-center">Hadir (H)</th>
                  <th className="py-3.5 px-4 text-center">Sakit (S)</th>
                  <th className="py-3.5 px-4 text-center">Izin (I)</th>
                  <th className="py-3.5 px-4 text-center">Alpa (A)</th>
                  <th className="py-3.5 px-6 text-center">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rekapData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold">
                      Belum ada siswa terdaftar.
                    </td>
                  </tr>
                ) : (
                  rekapData.map((row, idx) => (
                    <tr key={row.siswa.id} className="hover:bg-slate-50/30 transition">
                      <td className="py-3.5 px-6 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-slate-900">{row.siswa.nama}</td>
                      <td className="py-3.5 px-4 font-mono text-xs">{row.siswa.NISN}</td>
                      <td className="py-3.5 px-4 text-center text-green-700 font-bold">{row.counts.Hadir}</td>
                      <td className="py-3.5 px-4 text-center text-sky-600 font-bold">{row.counts.Sakit}</td>
                      <td className="py-3.5 px-4 text-center text-amber-500 font-bold">{row.counts.Izin}</td>
                      <td className="py-3.5 px-4 text-center text-rose-600 font-bold">{row.counts.Alpa}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            row.kehadiranPersen >= 90
                              ? "bg-green-50 text-green-800"
                              : row.kehadiranPersen >= 75
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          {row.kehadiranPersen}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: MONTHLY REKAP GRID */}
      {viewMode === "rekap-bulanan" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-800">
                Laporan Kehadiran Bulanan: {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
              </span>
            </div>
            <button
              onClick={handleExportMonthlyCSV}
              className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Bulanan ke Excel (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-3 px-4 border-r border-slate-200">No</th>
                  <th className="py-3 px-4 border-r border-slate-200 min-w-[150px]">Nama Siswa</th>
                  <th className="py-3 px-3 border-r border-slate-200">NISN</th>
                  {Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, i) => i + 1).map((day) => (
                    <th key={day} className="py-3 px-1 text-center border-r border-slate-200 min-w-[28px] max-w-[32px]">
                      {day}
                    </th>
                  ))}
                  <th className="py-3 px-2 text-center border-r border-slate-200 bg-green-50/50 text-green-800">H</th>
                  <th className="py-3 px-2 text-center border-r border-slate-200 bg-sky-50/50 text-sky-850">S</th>
                  <th className="py-3 px-2 text-center border-r border-slate-200 bg-amber-50/50 text-amber-800">I</th>
                  <th className="py-3 px-2 text-center border-r border-slate-200 bg-rose-50/50 text-rose-800">A</th>
                  <th className="py-3 px-3 text-center">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {monthlyRekapData.length === 0 ? (
                  <tr>
                    <td colSpan={3 + 31 + 5} className="py-8 text-center text-slate-400 font-semibold">
                      Belum ada siswa terdaftar.
                    </td>
                  </tr>
                ) : (
                  monthlyRekapData.map((row, idx) => {
                    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                    return (
                      <tr key={row.siswa.id} className="hover:bg-slate-50/30 transition">
                        <td className="py-2.5 px-4 font-mono border-r border-slate-100">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-100 min-w-[150px]">{row.siswa.nama}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 border-r border-slate-100">{row.siswa.NISN}</td>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                          const status = row.statusByDay[day];
                          let badgeClass = "text-slate-300 font-normal";
                          let displayText = "-";

                          if (status === "Hadir") {
                            badgeClass = "bg-green-100 text-green-800 font-bold rounded";
                            displayText = "H";
                          } else if (status === "Sakit") {
                            badgeClass = "bg-sky-100 text-sky-800 font-bold rounded";
                            displayText = "S";
                          } else if (status === "Izin") {
                            badgeClass = "bg-amber-100 text-amber-800 font-bold rounded";
                            displayText = "I";
                          } else if (status === "Alpa") {
                            badgeClass = "bg-rose-100 text-rose-800 font-bold rounded";
                            displayText = "A";
                          }

                          return (
                            <td key={day} className="py-2 px-0.5 text-center border-r border-slate-100 font-mono">
                              <div className={`w-5 h-5 mx-auto flex items-center justify-center text-[10px] ${badgeClass}`}>
                                {displayText}
                              </div>
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-2 text-center text-green-700 font-bold border-r border-slate-100 bg-green-50/10">{row.counts.Hadir}</td>
                        <td className="py-2.5 px-2 text-center text-sky-600 font-bold border-r border-slate-100 bg-sky-50/10">{row.counts.Sakit}</td>
                        <td className="py-2.5 px-2 text-center text-amber-500 font-bold border-r border-slate-100 bg-amber-50/10">{row.counts.Izin}</td>
                        <td className="py-2.5 px-2 text-center text-rose-600 font-bold border-r border-slate-100 bg-rose-50/10">{row.counts.Alpa}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                              row.kehadiranPersen >= 90
                                ? "bg-green-50 text-green-800"
                                : row.kehadiranPersen >= 75
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-800"
                            }`}
                          >
                            {row.kehadiranPersen}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center font-bold text-[9px] text-green-800">H</span> Hadir
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-sky-100 border border-sky-200 rounded flex items-center justify-center font-bold text-[9px] text-sky-800">S</span> Sakit
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-amber-100 border border-amber-200 rounded flex items-center justify-center font-bold text-[9px] text-amber-800">I</span> Izin
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-rose-100 border border-rose-200 rounded flex items-center justify-center font-bold text-[9px] text-rose-800">A</span> Alpa
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono text-slate-300">-</span> Belum ada data
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
