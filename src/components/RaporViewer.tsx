import React, { useState, useEffect } from "react";
import { DatabaseState, Siswa, MataPelajaran, Role } from "../types";
import { Printer, GraduationCap, FileText, FileDown, BookOpen, User } from "lucide-react";

interface RaporViewerProps {
  db: DatabaseState;
  currentUser: { id: string; nama: string; username: string; role: Role } | null;
}

export default function RaporViewer({ db, currentUser }: RaporViewerProps) {
  const [selectedKelasId, setSelectedKelasId] = useState<string>(db.kelas[0]?.id || "");
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>("");

  // Manual competency override descriptions
  const [customDescriptions, setCustomDescriptions] = useState<{ [mapel_id: string]: string }>({});

  const filteredSiswa = db.siswa.filter((s) => s.kelas_id === selectedKelasId);
  const selectedSiswa = db.siswa.find((s) => s.id === selectedSiswaId);
  const selectedKelas = db.kelas.find((k) => k.id === selectedKelasId);

  // Set default student when class changes
  useEffect(() => {
    if (filteredSiswa.length > 0) {
      setSelectedSiswaId(filteredSiswa[0].id);
    } else {
      setSelectedSiswaId("");
    }
    setCustomDescriptions({}); // reset override on student change
  }, [selectedKelasId, db.siswa]);

  // Helper: Calculate final grade & auto description
  const getMapelRaporData = (siswaId: string, mapel: MataPelajaran) => {
    const studentGrades = db.nilai.filter(
      (n) =>
        n.siswa_id === siswaId &&
        n.mapel_id === mapel.id &&
        n.semester === db.settings.semester &&
        n.tahun_ajaran === db.settings.tahun_ajaran
    );

    // Calculate Average UH
    const uhGrades = studentGrades.filter((g) => g.jenis === "UH");
    const avgUH =
      uhGrades.length > 0 ? uhGrades.reduce((sum, g) => sum + g.nilai, 0) / uhGrades.length : 0;

    // UTS
    const utsMatch = studentGrades.find((g) => g.jenis === "UTS");
    const uts = utsMatch ? utsMatch.nilai : 0;

    // PAS
    const pasMatch = studentGrades.find((g) => g.jenis === "PAS");
    const pas = pasMatch ? pasMatch.nilai : 0;

    // Final Grade Formula: 40% UH + 30% UTS + 30% PAS
    const finalGradeRaw = avgUH * 0.4 + uts * 0.3 + pas * 0.3;
    const finalGrade = Math.round(finalGradeRaw);

    // Predicate
    let predikat = "D";
    if (finalGrade >= 90) predikat = "A";
    else if (finalGrade >= 80) predikat = "B";
    else if (finalGrade >= 70) predikat = "C";

    // Auto Competency Description template
    let autoDesc = "";
    if (finalGrade === 0) {
      autoDesc = "Data nilai belum lengkap untuk mata pelajaran ini.";
    } else if (finalGrade >= 90) {
      autoDesc = `Sangat menonjol dalam menunjukkan pemahaman yang sangat baik terhadap seluruh lingkup materi pembelajaran ${mapel.nama}.`;
    } else if (finalGrade >= 80) {
      autoDesc = `Menunjukkan penguasaan kompetensi yang baik dan tuntas dalam mengaplikasikan konsep-konsep utama materi ${mapel.nama}.`;
    } else if (finalGrade >= 70) {
      autoDesc = `Menunjukkan pemahaman yang cukup dalam materi ${mapel.nama}, perlu penguatan dan latihan tambahan pada bagian evaluasi harian.`;
    } else {
      autoDesc = `Memerlukan bimbingan intensif serta perhatian khusus untuk meningkatkan ketuntasan materi kompetensi ${mapel.nama}.`;
    }

    // Use manual description if edited, otherwise fallback to auto
    const currentDesc = customDescriptions[mapel.id] !== undefined ? customDescriptions[mapel.id] : autoDesc;

    return {
      avgUH,
      uts,
      pas,
      finalGrade,
      predikat,
      description: currentDesc,
      hasSomeGrade: studentGrades.length > 0,
    };
  };

  const handleDescChange = (mapelId: string, text: string) => {
    setCustomDescriptions((prev) => ({
      ...prev,
      [mapelId]: text,
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Simple Word/HTML export trigger
  const handleExportWord = () => {
    if (!selectedSiswa) return;
    const docHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><title>Rapor Merdeka</title><style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; margin-top: 15px; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; font-size: 11pt; }
        th { background-color: #f2f2f2; }
        .header { margin-bottom: 20px; }
      </style></head>
      <body>
        <div class="header">
          <h2>LAPORAN HASIL BELAJAR (RAPOR)</h2>
          <p><b>Nama Siswa:</b> ${selectedSiswa.nama} &nbsp;&nbsp;|&nbsp;&nbsp; <b>NISN:</b> ${selectedSiswa.NISN}</p>
          <p><b>Kelas:</b> ${selectedKelas?.nama_kelas || "-"} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Semester:</b> ${db.settings.semester} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Tahun Ajaran:</b> ${db.settings.tahun_ajaran}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Mata Pelajaran</th>
              <th>KKM</th>
              <th>Nilai Akhir</th>
              <th>Predikat</th>
              <th>Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody>
            ${db.mata_pelajaran
              .map((mp, idx) => {
                const data = getMapelRaporData(selectedSiswa.id, mp);
                return `
                <tr>
                  <td>${idx + 1}</td>
                  <td><b>${mp.nama}</b></td>
                  <td>${mp.KKM}</td>
                  <td><b>${data.finalGrade}</b></td>
                  <td><b>${data.predikat}</b></td>
                  <td>${data.description}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([docHTML], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rapor_${selectedSiswa.nama.replace(/\s+/g, "_")}_Merdeka.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 no-print font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Cetak & Preview E-Rapor</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Penghitungan nilai akhir otomatis (40% Rata-rata UH + 30% UTS + 30% PAS) sesuai Kurikulum Merdeka.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedSiswa && (
            <>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition"
              >
                <Printer className="w-4 h-4" /> Cetak Rapor (PDF)
              </button>
              <button
                onClick={handleExportWord}
                className="flex items-center gap-1.5 bg-green-50 text-green-800 hover:bg-green-100 text-xs font-bold py-2.5 px-4 rounded-lg border border-green-200/60 transition"
              >
                <FileDown className="w-4 h-4" /> Download format Word
              </button>
            </>
          )}
        </div>
      </div>

      {/* Selector Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Siswa</label>
            <select
              value={selectedSiswaId}
              onChange={(e) => setSelectedSiswaId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-green-600 focus:bg-white transition"
            >
              {filteredSiswa.length === 0 ? (
                <option value="">Belum ada siswa di kelas ini</option>
              ) : (
                filteredSiswa.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} (NISN: {s.NISN})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* PRINT-READY PREVIEW CARD PANEL */}
      {selectedSiswa ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-10 max-w-4xl mx-auto space-y-6">
          {/* Printable container starts here */}
          <div id="printable-rapor" className="print-card space-y-8 text-black">
            {/* Header Sekolah */}
            <div className="text-center border-b-2 border-double border-black pb-4 space-y-1">
              <h1 className="text-lg md:text-xl font-bold tracking-wide uppercase">
                PEMERINTAH KABUPATEN ADMINISTRASI SEKOLAH
              </h1>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-normal uppercase">
                DINAS PENDIDIKAN DAN KEBUDAYAAN
              </h2>
              <p className="text-xs font-mono font-medium tracking-tight">
                Alamat: Jl. Pendidikan No. 45, Kecamatan Merdeka, Kode Pos 12345
              </p>
            </div>

            {/* Title Rapor */}
            <div className="text-center space-y-1">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider">
                LAPORAN HASIL BELAJAR (RAPOR)
              </h3>
              <p className="text-sm font-semibold text-gray-700">KURIKULUM MERDEKA</p>
            </div>

            {/* Student metadata grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 font-medium">Nama Peserta Didik</span>
                  <span className="mr-2">:</span>
                  <span className="font-bold uppercase text-gray-950">{selectedSiswa.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-medium">Nomor Induk / NISN</span>
                  <span className="mr-2">:</span>
                  <span className="font-mono">{selectedSiswa.NISN}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-medium">Sekolah</span>
                  <span className="mr-2">:</span>
                  <span className="font-semibold">SMP Negeri Merdeka Utama</span>
                </div>
              </div>

              <div className="space-y-1 md:text-right">
                <div className="flex md:justify-end">
                  <span className="w-32 text-left font-medium">Kelas</span>
                  <span className="mr-2">:</span>
                  <span className="font-semibold text-green-950">{selectedKelas?.nama_kelas || "-"}</span>
                </div>
                <div className="flex md:justify-end">
                  <span className="w-32 text-left font-medium">Semester</span>
                  <span className="mr-2">:</span>
                  <span className="font-semibold">{db.settings.semester} (Ganjil)</span>
                </div>
                <div className="flex md:justify-end">
                  <span className="w-32 text-left font-medium">Tahun Ajaran</span>
                  <span className="mr-2">:</span>
                  <span className="font-semibold">{db.settings.tahun_ajaran}</span>
                </div>
              </div>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm border-collapse border-2 border-black">
                <thead>
                  <tr className="bg-gray-100 text-black border-b-2 border-black font-bold">
                    <th className="py-2.5 px-3 border border-black text-center" style={{ width: "5%" }}>No</th>
                    <th className="py-2.5 px-3 border border-black" style={{ width: "25%" }}>Mata Pelajaran</th>
                    <th className="py-2.5 px-3 border border-black text-center" style={{ width: "10%" }}>KKM</th>
                    <th className="py-2.5 px-3 border border-black text-center" style={{ width: "12%" }}>Nilai Akhir</th>
                    <th className="py-2.5 px-3 border border-black text-center" style={{ width: "10%" }}>Predikat</th>
                    <th className="py-2.5 px-3 border border-black">Capaian Kompetensi (Bisa diedit manual)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black text-black">
                  {db.mata_pelajaran.map((mp, idx) => {
                    const data = getMapelRaporData(selectedSiswa.id, mp);
                    return (
                      <tr key={mp.id}>
                        <td className="py-3 px-3 border border-black text-center font-mono">{idx + 1}</td>
                        <td className="py-3 px-3 border border-black font-bold">{mp.nama}</td>
                        <td className="py-3 px-3 border border-black text-center font-mono font-medium">{mp.KKM}</td>
                        <td className="py-3 px-3 border border-black text-center font-mono font-bold text-base">
                          {data.finalGrade === 0 ? "-" : data.finalGrade}
                        </td>
                        <td className="py-3 px-3 border border-black text-center font-bold text-base">
                          {data.finalGrade === 0 ? "-" : data.predikat}
                        </td>
                        <td className="py-2 px-2.5 border border-black">
                          {/* Rich inline-editable text box for custom descriptions */}
                          <textarea
                            value={data.description}
                            onChange={(e) => handleDescChange(mp.id, e.target.value)}
                            rows={2}
                            className="w-full bg-transparent text-xs text-gray-800 leading-relaxed border-0 focus:bg-green-50/50 p-1 rounded resize-none focus:ring-1 focus:ring-green-600 outline-none no-print"
                          />
                          {/* For printable sheet, hide textarea, show plain text */}
                          <p className="hidden print:block text-xs leading-relaxed text-black">
                            {data.description}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Attendance rekap card section */}
            <div className="space-y-2 max-w-sm">
              <h4 className="text-sm font-bold border-b border-black pb-1 uppercase">Rekapitulasi Kehadiran</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="border border-black p-2 rounded">
                  <p className="font-semibold">Sakit (S)</p>
                  <p className="font-bold font-mono mt-1 text-sm">
                    {db.absensi.filter((a) => a.siswa_id === selectedSiswa.id && a.status === "Sakit").length} hari
                  </p>
                </div>
                <div className="border border-black p-2 rounded">
                  <p className="font-semibold">Izin (I)</p>
                  <p className="font-bold font-mono mt-1 text-sm">
                    {db.absensi.filter((a) => a.siswa_id === selectedSiswa.id && a.status === "Izin").length} hari
                  </p>
                </div>
                <div className="border border-black p-2 rounded">
                  <p className="font-semibold">Alpa (A)</p>
                  <p className="font-bold font-mono mt-1 text-sm">
                    {db.absensi.filter((a) => a.siswa_id === selectedSiswa.id && a.status === "Alpa").length} hari
                  </p>
                </div>
              </div>
            </div>

            {/* Signature section */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs md:text-sm pt-8">
              <div className="space-y-16">
                <p>Mengetahui<br />Orang Tua/Wali</p>
                <p className="border-b border-black mx-auto max-w-[160px] font-bold py-1"></p>
              </div>

              <div className="space-y-16">
                <p>Mengetahui<br />Kepala Sekolah</p>
                <div>
                  <p className="font-bold">H. Ahmad Dahlan, M.Pd.</p>
                  <p className="text-[10px] text-gray-500">NIP. 197402122003121002</p>
                </div>
              </div>

              <div className="space-y-16">
                <p>Merdeka Utama, 18 Juni 2026<br />Wali Kelas</p>
                <div>
                  <p className="font-bold">{selectedKelas?.wali_kelas || "Drs. Budi Santoso"}</p>
                  <p className="text-[10px] text-gray-500">NIP. 196805141994031005</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 font-semibold">
          Harap pilih siswa terlebih dahulu untuk menghasilkan lembar rapor semester.
        </div>
      )}
    </div>
  );
}
