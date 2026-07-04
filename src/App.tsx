import React, { useState, useEffect } from "react";
import { DatabaseState, Role } from "./types";
import { fetchDatabaseState } from "./utils/api";
import Dashboard from "./components/Dashboard";
import DataMaster from "./components/DataMaster";
import AbsensiEditor from "./components/AbsensiEditor";
import NilaiEditor from "./components/NilaiEditor";
import RaporViewer from "./components/RaporViewer";
import Login from "./components/Login";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CheckCircle,
  Award,
  FileText,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Calendar
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    nama: string;
    username: string;
    role: Role;
  } | null>(null);

  const [db, setDb] = useState<DatabaseState | null>(null);
  const [activeScreen, setActiveScreen] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Fetch server database state
  const loadDb = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const state = await fetchDatabaseState();
      setDb(state);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load DB state:", err);
      setError("Gagal menghubungkan ke server. Pastikan server aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDb();
    } else {
      setDb(null);
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      setCurrentUser(null);
      setDb(null);
      localStorage.removeItem("user");
      setActiveScreen("dashboard");
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading && !db) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-gray-600">Memuat data dari server...</p>
      </div>
    );
  }

  if (error || !db) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white p-6 rounded-2xl border border-rose-100 shadow-soft space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-full flex items-center justify-center mx-auto">
            <X className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Koneksi Server Gagal</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{error || "Terjadi kesalahan internal."}</p>
          <button
            onClick={loadDb}
            className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      {/* SIDEBAR NAVIGATION - DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-green-900 text-white border-r border-green-850 shrink-0">
        <div className="p-6 border-b border-green-850 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white shadow-md border border-green-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-white tracking-tight leading-none">
                Sistem Guru <span className="text-green-400">Pro</span>
              </h1>
              <p className="text-[10px] text-green-200/80 font-medium mt-1">
                Kurikulum Merdeka
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveScreen("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeScreen === "dashboard"
                ? "bg-green-800 text-white shadow-sm font-semibold border-l-4 border-green-400"
                : "text-green-100 hover:bg-green-800/60"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>

          <button
            onClick={() => setActiveScreen("master")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeScreen === "master"
                ? "bg-green-800 text-white shadow-sm font-semibold border-l-4 border-green-400"
                : "text-green-100 hover:bg-green-800/60"
            }`}
          >
            <Users className="w-4 h-4" /> Data Master Siswa
          </button>

          <button
            onClick={() => setActiveScreen("absensi")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeScreen === "absensi"
                ? "bg-green-800 text-white shadow-sm font-semibold border-l-4 border-green-400"
                : "text-green-100 hover:bg-green-800/60"
            }`}
          >
            <CheckCircle className="w-4 h-4" /> Presensi Siswa
          </button>

          <button
            onClick={() => setActiveScreen("nilai")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeScreen === "nilai"
                ? "bg-green-800 text-white shadow-sm font-semibold border-l-4 border-green-400"
                : "text-green-100 hover:bg-green-800/60"
            }`}
          >
            <Award className="w-4 h-4" /> Penilaian Mapel
          </button>

          <button
            onClick={() => setActiveScreen("rapor")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeScreen === "rapor"
                ? "bg-green-800 text-white shadow-sm font-semibold border-l-4 border-green-400"
                : "text-green-100 hover:bg-green-800/60"
            }`}
          >
            <FileText className="w-4 h-4" /> E-Rapor
          </button>
        </nav>

        {/* User profile at the bottom */}
        <div className="p-4 border-t border-green-850 bg-green-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-full bg-green-700 flex items-center justify-center font-bold text-xs border border-green-400 text-white uppercase">
              {currentUser.nama.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.nama}</p>
              <p className="text-[10px] text-green-300 font-medium truncate uppercase tracking-wider">
                {currentUser.role === "wali_kelas" ? "Wali Kelas" : "Guru Mapel"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-green-800/40 hover:bg-rose-950/40 hover:text-rose-200 text-green-200 rounded-lg border border-green-800 hover:border-rose-900/30 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWERS */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden no-print">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <aside className="relative flex flex-col w-64 bg-green-900 text-white max-w-xs">
            <div className="p-5 border-b border-green-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-green-400" />
                <span className="font-bold text-white text-sm">Sistem Guru Pro</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-green-800 rounded text-green-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              <button
                onClick={() => {
                  setActiveScreen("dashboard");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  activeScreen === "dashboard" ? "bg-green-800 text-white font-bold" : "text-green-100 hover:bg-green-800/30"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>

              <button
                onClick={() => {
                  setActiveScreen("master");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  activeScreen === "master" ? "bg-green-800 text-white font-bold" : "text-green-100 hover:bg-green-800/30"
                }`}
              >
                <Users className="w-4 h-4" /> Data Master Siswa
              </button>

              <button
                onClick={() => {
                  setActiveScreen("absensi");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  activeScreen === "absensi" ? "bg-green-800 text-white font-bold" : "text-green-100 hover:bg-green-800/30"
                }`}
              >
                <CheckCircle className="w-4 h-4" /> Presensi Siswa
              </button>

              <button
                onClick={() => {
                  setActiveScreen("nilai");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  activeScreen === "nilai" ? "bg-green-800 text-white font-bold" : "text-green-100 hover:bg-green-800/30"
                }`}
              >
                <Award className="w-4 h-4" /> Penilaian Mapel
              </button>

              <button
                onClick={() => {
                  setActiveScreen("rapor");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  activeScreen === "rapor" ? "bg-green-800 text-white font-bold" : "text-green-100 hover:bg-green-800/30"
                }`}
              >
                <FileText className="w-4 h-4" /> E-Rapor
              </button>
            </nav>

            <div className="p-4 border-t border-green-850 bg-green-950/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8.5 h-8.5 rounded-full bg-green-700 flex items-center justify-center font-bold text-xs border border-green-400 text-white uppercase">
                  {currentUser.nama.substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser.nama}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs font-bold bg-green-800/60 text-green-200 rounded-lg hover:bg-rose-950/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-slate-50 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Header left: show context details */}
            <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="text-slate-400">Beranda</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-green-700" />
                TA {db.settings.tahun_ajaran}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Semester badge */}
            <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 uppercase">
              Semester {db.settings.semester}
            </div>

            {/* Sync Status Button */}
            <button
              onClick={loadDb}
              title="Sync status with server database"
              className="p-2 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-xl transition"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>

            {/* Profile info short */}
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-xs font-extrabold text-gray-800 leading-none">{currentUser.nama}</p>
                <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">
                  {currentUser.role === "wali_kelas" ? "Wali Kelas" : "Guru Mapel"}
                </span>
              </div>
              <div className="w-8.5 h-8.5 bg-green-50 text-green-800 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm border border-green-200">
                {currentUser.nama.substring(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {activeScreen === "dashboard" && (
            <Dashboard db={db} currentUser={currentUser} onNavigate={setActiveScreen} />
          )}
          {activeScreen === "master" && (
            <DataMaster db={db} currentUser={currentUser} onRefresh={loadDb} />
          )}
          {activeScreen === "absensi" && (
            <AbsensiEditor db={db} currentUser={currentUser} onRefresh={loadDb} />
          )}
          {activeScreen === "nilai" && (
            <NilaiEditor db={db} currentUser={currentUser} onRefresh={loadDb} />
          )}
          {activeScreen === "rapor" && (
            <RaporViewer db={db} currentUser={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
}
