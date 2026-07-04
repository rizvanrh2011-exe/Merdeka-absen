import React from "react";
import { DatabaseState, Guru, Role } from "../types";
import { Users, BookOpen, UserCheck, Award, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface DashboardProps {
  db: DatabaseState;
  currentUser: { id: string; nama: string; username: string; role: Role } | null;
  onNavigate: (screen: string) => void;
}

export default function Dashboard({ db, currentUser, onNavigate }: DashboardProps) {
  const totalSiswa = db.siswa.length;
  const totalKelas = db.kelas.length;
  const totalMapel = db.mata_pelajaran.length;
  const totalGuru = db.guru.length;

  // Calculate today's attendance stats (using most recent date in attendance list, or fallback)
  const todayStr = new Date().toISOString().split("T")[0]; // "2026-07-02"
  const attendanceToday = db.absensi.filter((a) => a.tanggal === todayStr);

  const statsAttendance = {
    Hadir: 0,
    Sakit: 0,
    Izin: 0,
    Alpa: 0,
  };

  if (attendanceToday.length > 0) {
    attendanceToday.forEach((a) => {
      if (a.status in statsAttendance) {
        statsAttendance[a.status]++;
      }
    });
  } else {
    // If no attendance for today, use the most recent day as an example
    const dates = Array.from(new Set(db.absensi.map((a) => a.tanggal))).sort();
    const mostRecentDate = dates[dates.length - 1] || "";
    const recentAttendance = db.absensi.filter((a) => a.tanggal === mostRecentDate);
    recentAttendance.forEach((a) => {
      if (a.status in statsAttendance) {
        statsAttendance[a.status]++;
      }
    });
  }

  const attendanceTotalCount = statsAttendance.Hadir + statsAttendance.Sakit + statsAttendance.Izin + statsAttendance.Alpa;
  const presencePercentage = attendanceTotalCount > 0 ? Math.round((statsAttendance.Hadir / attendanceTotalCount) * 100) : 0;

  // Grade progress calculation
  // "Progress input nilai (persentase siswa yang sudah punya nilai UH/UTS/PAS per mapel)"
  // Let's find, for each subject, how many students have at least one of UH, UTS, or PAS. Or average completeness.
  // Completeness = (number of students with (UH avg, UTS, and PAS) defined) / totalSiswa
  const mapelProgress = db.mata_pelajaran.map((mp) => {
    let studentWithGrades = 0;
    db.siswa.forEach((s) => {
      const studentGrades = db.nilai.filter((n) => n.siswa_id === s.id && n.mapel_id === mp.id);
      const hasUH = studentGrades.some((g) => g.jenis === "UH");
      const hasUTS = studentGrades.some((g) => g.jenis === "UTS");
      const hasPAS = studentGrades.some((g) => g.jenis === "PAS");

      let scoreCount = 0;
      if (hasUH) scoreCount++;
      if (hasUTS) scoreCount++;
      if (hasPAS) scoreCount++;

      // Weight completion
      if (scoreCount === 3) {
        studentWithGrades += 1; // Fully filled
      } else if (scoreCount > 0) {
        studentWithGrades += scoreCount / 3; // Partially filled
      }
    });

    const percentage = totalSiswa > 0 ? Math.round((studentWithGrades / totalSiswa) * 100) : 0;
    return {
      nama: mp.nama,
      percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 md:p-8 shadow-luxury relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full filter blur-3xl opacity-30 -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <span className="bg-emerald-800/80 text-emerald-200 text-xs px-3 py-1.5 rounded-full font-medium tracking-wide uppercase">
            {currentUser?.role === "wali_kelas" ? "Wali Kelas / Admin" : "Guru Mata Pelajaran"}
          </span>
          <h1 className="text-2xl md:text-3.5xl font-display font-bold mt-3 tracking-tight">
            Selamat Datang, {currentUser?.nama || "Guru"}!
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-base mt-2 max-w-2xl font-light">
            Sistem Administrasi Guru Terpadu - Kurikulum Merdeka. Tahun Ajaran {db.settings.tahun_ajaran} ({db.settings.semester}).
          </p>
        </div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-soft hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs md:text-sm font-medium">Total Siswa</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-display font-bold text-gray-800 mt-2">{totalSiswa}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Aktif Semester Ini</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-soft hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs md:text-sm font-medium">Kelas</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-display font-bold text-gray-800 mt-2">{totalKelas}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {db.kelas[0]?.nama_kelas || "Belum ada"}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-soft hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs md:text-sm font-medium">Mata Pelajaran</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-display font-bold text-gray-800 mt-2">{totalMapel}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Kurikulum Merdeka</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-soft hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs md:text-sm font-medium">Guru Aktif</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-display font-bold text-gray-800 mt-2">{totalGuru}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Multi-Role Terdaftar</p>
        </div>
      </div>

      {/* Main Content Dashboard Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl border border-emerald-100 shadow-soft p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-display font-bold text-gray-800 text-lg">Kehadiran Siswa</h3>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
                Hari Ini / Terkini
              </span>
            </div>

            {attendanceTotalCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
                <p className="text-gray-500 text-sm font-medium">Belum ada presensi diisi hari ini</p>
                <button
                  onClick={() => onNavigate("absensi")}
                  className="mt-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-3 rounded-lg transition"
                >
                  Isi Presensi Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Circular ring style representation */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative flex items-center justify-center">
                    {/* Simple dynamic SVG ring */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="50" stroke="#f0fdf4" strokeWidth="10" fill="transparent" />
                      <circle
                        cx="64"
                        cy="64"
                        r="50"
                        stroke="#059669"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={314}
                        strokeDashoffset={314 - (314 * presencePercentage) / 100}
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-bold font-display text-gray-800">{presencePercentage}%</span>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Hadir</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <p className="text-emerald-700 text-lg font-bold">{statsAttendance.Hadir}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">Hadir</p>
                  </div>
                  <div className="bg-sky-50 p-2 rounded-lg">
                    <p className="text-sky-700 text-lg font-bold">{statsAttendance.Sakit}</p>
                    <p className="text-[10px] text-sky-600 font-semibold">Sakit</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg">
                    <p className="text-amber-700 text-lg font-bold">{statsAttendance.Izin}</p>
                    <p className="text-[10px] text-amber-600 font-semibold">Izin</p>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg">
                    <p className="text-rose-700 text-lg font-bold">{statsAttendance.Alpa}</p>
                    <p className="text-[10px] text-rose-600 font-semibold">Alpa</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate("absensi")}
            className="w-full mt-4 text-center py-2.5 text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
          >
            Lihat Detail Presensi
          </button>
        </div>

        {/* Grade Progress Completion */}
        <div className="bg-white rounded-xl border border-emerald-100 shadow-soft p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-display font-bold text-gray-800 text-lg">Progress Input Nilai</h3>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
                Siswa Tuntas & Terisi
              </span>
            </div>

            {mapelProgress.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">Belum ada mata pelajaran terdaftar.</p>
            ) : (
              <div className="space-y-4">
                {mapelProgress.map((mp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{mp.nama}</span>
                      <span className="text-emerald-600">{mp.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${mp.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={() => onNavigate("nilai")}
              className="flex-1 py-2 text-xs bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
            >
              Input Nilai Baru
            </button>
            <button
              onClick={() => onNavigate("rapor")}
              className="flex-1 py-2 text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"
            >
              Lihat Rapor Rangkuman
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Menu / Core Tasks */}
      <div className="bg-white rounded-xl border border-emerald-100 shadow-soft p-6">
        <h3 className="font-display font-bold text-gray-800 text-lg border-b border-gray-100 pb-3 mb-4">
          Aktivitas & Navigasi Cepat
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate("master")}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 cursor-pointer transition group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm group-hover:text-emerald-800 transition">
                Kelola Data Master
              </h4>
              <p className="text-xs text-gray-400 mt-1">Data Siswa, Kelas, Guru, Mapel, KKM, Semester</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate("absensi")}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 cursor-pointer transition group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm group-hover:text-emerald-800 transition">
                Input Presensi Siswa
              </h4>
              <p className="text-xs text-gray-400 mt-1">Isi kehadiran harian & download spreadsheet bulanan</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate("rapor")}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 cursor-pointer transition group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm group-hover:text-emerald-800 transition">
                Lihat & Cetak Rapor
              </h4>
              <p className="text-xs text-gray-400 mt-1">Sintesis nilai UTS, PAS & UH untuk rapor Kurikulum Merdeka</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
