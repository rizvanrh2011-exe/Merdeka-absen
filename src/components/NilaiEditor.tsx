import React, { useState, useEffect } from "react";
import { DatabaseState, JenisNilai, Role, Nilai } from "../types";
import { Award, BookOpen, Layers, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface NilaiEditorProps {
  db: DatabaseState;
  currentUser: { id: string; nama: string; username: string; role: Role } | null;
  onRefresh: () => void;
}

export default function NilaiEditor({ db, currentUser, onRefresh }: NilaiEditorProps) {
  const isWaliKelas = currentUser?.role === "wali_kelas";

  // Filter allowed classes and subjects based on guru role mappings
  const myMappings = db.guru_mapel_kelas.filter(
    (gmk) => isWaliKelas || gmk.guru_id === currentUser?.id
  );

  const allowedKelasIds = Array.from(new Set(myMappings.map((m) => m.kelas_id)));
  const allowedMapelIds = Array.from(new Set(myMappings.map((m) => m.mapel_id)));

  const filteredKelas = db.kelas.filter((k) => allowedKelasIds.includes(k.id));
  const filteredMapel = db.mata_pelajaran.filter((mp) => allowedMapelIds.includes(mp.id));

  // Active filter selectors
  const [selectedKelasId, setSelectedKelasId] = useState<string>("");
  const [selectedMapelId, setSelectedMapelId] = useState<string>("");
  const [selectedJenis, setSelectedJenis] = useState<JenisNilai>("UH");
  const [urutanUH, setUrutanUH] = useState<number>(1); // e.g. 1 for UH1

  // Dynamic values inputted by teacher
  const [tempGrades, setTempGrades] = useState<{ [siswa_id: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Set default filters on mount
  useEffect(() => {
    if (filteredKelas.length > 0) {
      setSelectedKelasId(filteredKelas[0].id);
    }
    if (filteredMapel.length > 0) {
      setSelectedMapelId(filteredMapel[0].id);
    }
  }, [db.kelas, db.mata_pelajaran, currentUser]);

  const selectedMapel = db.mata_pelajaran.find((m) => m.id === selectedMapelId);
  const activeKKM = selectedMapel?.KKM || 75;
  const filteredSiswa = db.siswa.filter((s) => s.kelas_id === selectedKelasId);

  // Load existing grades whenever filters change
  useEffect(() => {
    const freshGrades: { [siswa_id: string]: number } = {};
    filteredSiswa.forEach((s) => {
      const match = db.nilai.find(
        (n) =>
          n.siswa_id === s.id &&
          n.mapel_id === selectedMapelId &&
          n.jenis === selectedJenis &&
          (selectedJenis !== "UH" || n.urutan_UH === urutanUH) &&
          n.semester === db.settings.semester &&
          n.tahun_ajaran === db.settings.tahun_ajaran
      );
      // Initialize with matched grade or 0 if empty
      freshGrades[s.id] = match ? match.nilai : 0;
    });
    setTempGrades(freshGrades);
  }, [selectedKelasId, selectedMapelId, selectedJenis, urutanUH, db.nilai, db.settings]);

  const handleGradeChange = (siswaId: string, value: string) => {
    const valNum = value === "" ? 0 : Math.min(100, Math.max(0, Number(value)));
    setTempGrades((prev) => ({
      ...prev,
      [siswaId]: valNum,
    }));
  };

  const handleSave = async () => {
    if (!selectedKelasId || !selectedMapelId) {
      setMessage({ text: "Harap pilih Kelas dan Mata Pelajaran terlebih dahulu", type: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      const items = Object.entries(tempGrades).map(([siswa_id, nilai]) => ({
        siswa_id,
        nilai,
      }));

      const res = await fetch("/api/nilai/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapel_id: selectedMapelId,
          jenis: selectedJenis,
          urutan_UH: selectedJenis === "UH" ? urutanUH : undefined,
          input_oleh: currentUser?.id || "g_admin",
          items,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data nilai");

      setMessage({
        text: `Nilai ${selectedJenis}${selectedJenis === "UH" ? urutanUH : ""} mapel ${
          selectedMapel?.nama
        } berhasil disimpan!`,
        type: "success",
      });
      onRefresh();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Modul Penilaian Siswa</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Input nilai Ulangan Harian (UH), Ujian Tengah Semester (UTS), dan Penilaian Akhir Semester (PAS).
        </p>
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

      {/* Grid Filter selectors */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Filter Penilaian Aktif
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1 uppercase tracking-wide">
              <Layers className="w-3.5 h-3.5 text-green-700" /> Pilih Kelas
            </label>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-green-600 focus:bg-white transition"
            >
              {filteredKelas.length === 0 ? (
                <option value="">Tidak ada kelas diampu</option>
              ) : (
                filteredKelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1 uppercase tracking-wide">
              <BookOpen className="w-3.5 h-3.5 text-green-700" /> Mata Pelajaran
            </label>
            <select
              value={selectedMapelId}
              onChange={(e) => setSelectedMapelId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-green-600 focus:bg-white transition"
            >
              {filteredMapel.length === 0 ? (
                <option value="">Tidak ada mapel diampu</option>
              ) : (
                filteredMapel.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} (KKM: {m.KKM})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1 uppercase tracking-wide">
              <Award className="w-3.5 h-3.5 text-green-700" /> Jenis Penilaian
            </label>
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value as JenisNilai)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-green-600 focus:bg-white transition"
            >
              <option value="UH">Ulangan Harian (UH)</option>
              <option value="UTS">Ujian Tengah Semester (UTS)</option>
              <option value="PAS">Penilaian Akhir Semester (PAS)</option>
            </select>
          </div>

          {selectedJenis === "UH" && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                <Award className="w-3.5 h-3.5 text-green-700" /> Urutan Ke- (UH)
              </label>
              <select
                value={urutanUH}
                onChange={(e) => setUrutanUH(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none focus:border-green-600 focus:bg-white transition"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    Ulangan Harian {num} (UH{num})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* SPREADSHEET INPUT GRID TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Lembar Penilaian:{" "}
            <span className="text-green-800 font-extrabold uppercase">
              {selectedJenis}
              {selectedJenis === "UH" ? urutanUH : ""}
            </span>{" "}
            | KKM: <span className="bg-green-100 text-green-800 font-mono px-2.5 py-0.5 rounded text-xs font-bold">{activeKKM}</span>
          </span>
          <span className="text-xs font-semibold text-slate-400">Tahun Ajaran {db.settings.tahun_ajaran}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold bg-slate-50/50">
                <th className="py-3.5 px-6">No</th>
                <th className="py-3.5 px-6">Nama Lengkap Siswa</th>
                <th className="py-3.5 px-6">NISN</th>
                <th className="py-3.5 px-6 text-center" style={{ width: "160px" }}>
                  Nilai (0-100)
                </th>
                <th className="py-3.5 px-6 text-center">Status Kelulusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                    Belum ada siswa terdaftar di kelas terpilih. Silakan tambahkan data di menu Master.
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((siswa, idx) => {
                  const val = tempGrades[siswa.id] !== undefined ? tempGrades[siswa.id] : 0;
                  const isTuntas = val >= activeKKM;

                  return (
                    <tr key={siswa.id} className="hover:bg-slate-50/30 transition">
                      <td className="py-3 px-6 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3 px-6 font-bold text-slate-900">{siswa.nama}</td>
                      <td className="py-3 px-6 font-mono text-xs text-slate-400">{siswa.NISN}</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            value={val === 0 ? "" : val}
                            onChange={(e) => handleGradeChange(siswa.id, e.target.value)}
                            placeholder="0"
                            min={0}
                            max={100}
                            className="w-24 text-center bg-slate-50 border border-slate-200 font-mono font-bold text-sm text-slate-800 rounded-lg py-1.5 outline-none focus:bg-white focus:border-green-600 transition"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        {val === 0 ? (
                          <span className="text-xs text-slate-400 font-semibold">- Belum Diisi -</span>
                        ) : isTuntas ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-800 bg-green-50 px-3 py-1 rounded-full border border-green-200/50">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tuntas (≥{activeKKM})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/50">
                            <AlertCircle className="w-3.5 h-3.5" /> Belum Tuntas (&lt;{activeKKM})
                          </span>
                        )}
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
              <Save className="w-4 h-4" /> {isSubmitting ? "Menyimpan..." : "Simpan Lembar Nilai"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
