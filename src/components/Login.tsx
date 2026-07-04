import React, { useState } from "react";
import { 
  GraduationCap, 
  User, 
  Key, 
  AlertCircle, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  School
} from "lucide-react";
import { loginUser, registerSekolah } from "../utils/api";

interface LoginProps {
  onLoginSuccess: (user: { 
    id: string; 
    nama: string; 
    username: string; 
    role: 'wali_kelas' | 'guru_mapel'; 
    sekolah_id: string;
  }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login State
  const [loginKodeSekolah, setLoginKodeSekolah] = useState("default");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register State
  const [regNamaSekolah, setRegNamaSekolah] = useState("");
  const [regKodeSekolah, setRegKodeSekolah] = useState("");
  const [regNamaAdmin, setRegNamaAdmin] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regKodeAktivasi, setRegKodeAktivasi] = useState("");
  
  // Status State
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!loginUsername.trim() || !loginPassword) {
        throw new Error("Username dan Password harus diisi.");
      }
      const data = await loginUser(
        loginUsername.trim(), 
        loginPassword, 
        loginKodeSekolah.trim().toLowerCase()
      );
      
      // Pass up the user object
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Gagal masuk ke sistem.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!regNamaSekolah.trim() || !regKodeSekolah.trim() || !regNamaAdmin.trim() || !regUsername.trim() || !regPassword || !regKodeAktivasi.trim()) {
        throw new Error("Semua kolom pendaftaran termasuk Kode Aktivasi wajib diisi!");
      }
      
      if (regPassword !== regConfirmPassword) {
        throw new Error("Konfirmasi password tidak cocok!");
      }

      const cleanKode = regKodeSekolah.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (cleanKode.length < 3 || cleanKode.length > 20) {
        throw new Error("Kode Sekolah harus berupa 3-20 karakter alfanumerik (huruf kecil & angka).");
      }

      const res = await registerSekolah({
        nama_sekolah: regNamaSekolah.trim(),
        kode_sekolah: cleanKode,
        nama_admin: regNamaAdmin.trim(),
        username: regUsername.trim(),
        password: regPassword,
        kode_aktivasi: regKodeAktivasi.trim()
      });

      setSuccessMessage(`Sekolah '${regNamaSekolah}' berhasil terdaftar! Gunakan Kode Sekolah '${res.sekolah_id}' untuk masuk.`);
      
      // Auto-populate the login fields for convenience
      setLoginKodeSekolah(res.sekolah_id);
      setLoginUsername(regUsername.trim());
      setLoginPassword("");
      
      // Reset registration form
      setRegNamaSekolah("");
      setRegKodeSekolah("");
      setRegNamaAdmin("");
      setRegUsername("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegKodeAktivasi("");
      
      // Switch tab
      setActiveTab("login");
    } catch (err: any) {
      setError(err.message || "Gagal mendaftarkan sekolah.");
    } finally {
      setLoading(false);
    }
  };

  // Auto slugify code input
  const handleKodeChange = (val: string) => {
    const slugified = val.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setRegKodeSekolah(slugified);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-700 text-white rounded-2xl flex items-center justify-center shadow-md border border-green-600 animate-pulse">
            <GraduationCap className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Sistem Guru <span className="text-green-700">Pro</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          Portal Administrasi & E-Rapor Multi-Tenant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow-soft rounded-2xl border border-slate-250 overflow-hidden">
          {/* TABS HEADER */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setActiveTab("login");
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-center text-sm font-bold transition ${
                activeTab === "login"
                  ? "bg-white text-green-700 border-b-2 border-green-600"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100/70"
              }`}
            >
              Masuk Sistem
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-center text-sm font-bold transition ${
                activeTab === "register"
                  ? "bg-white text-green-700 border-b-2 border-green-600"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100/70"
              }`}
            >
              Daftarkan Sekolah
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* ALERT NOTIFICATIONS */}
            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB: LOGIN FORM */}
            {activeTab === "login" && (
              <form className="space-y-5" onSubmit={handleLoginSubmit}>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Kode Sekolah
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginKodeSekolah}
                      onChange={(e) => setLoginKodeSekolah(e.target.value)}
                      className="pl-10 block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg py-2.5 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                      placeholder="Contoh: default, smpn1"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Masukkan <span className="font-semibold text-green-700">"default"</span> untuk mengakses database demo percontohan.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="pl-10 block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg py-2.5 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                      placeholder="Masukkan username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg py-2.5 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition disabled:opacity-50"
                  >
                    {loading ? "Menghubungkan..." : "Masuk ke Sistem"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB: REGISTER FORM */}
            {activeTab === "register" && (
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600" /> Kode Aktivasi Aplikasi (Lisensi)
                  </label>
                  <input
                    type="text"
                    required
                    value={regKodeAktivasi}
                    onChange={(e) => setRegKodeAktivasi(e.target.value.toUpperCase())}
                    className="block w-full bg-amber-50/40 border border-amber-300 text-slate-850 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition font-mono uppercase placeholder:text-amber-300"
                    placeholder="GP-XXXX-XXXX-XXXX"
                  />
                  <p className="mt-1 text-[10px] text-amber-700">
                    Masukkan kode lisensi resmi yang Anda beli melalui <span className="font-bold underline text-amber-800">lynk.id</span> atau dari Developer.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Nama Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    value={regNamaSekolah}
                    onChange={(e) => setRegNamaSekolah(e.target.value)}
                    className="block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                    placeholder="Contoh: SMP Negeri 2 Bandung"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Kode Sekolah (Unik)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-400">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      value={regKodeSekolah}
                      onChange={(e) => handleKodeChange(e.target.value)}
                      className="pl-8 block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg py-2 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition font-mono"
                      placeholder="smpn2bdg"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Hanya huruf kecil, angka, strip, tanpa spasi. Ini akan menjadi URL pengenal sekolah Anda.
                  </p>
                </div>

                <div className="border-t border-slate-100 my-4 pt-3">
                  <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">
                    Akun Administrator Sekolah
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Nama Lengkap Admin / Kepala Sekolah
                      </label>
                      <input
                        type="text"
                        required
                        value={regNamaAdmin}
                        onChange={(e) => setRegNamaAdmin(e.target.value)}
                        className="block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                        placeholder="Contoh: H. Ahmad Yani, M.Pd."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Username Admin
                      </label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                        placeholder="admin"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Ulangi Password
                        </label>
                        <input
                          type="password"
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Daftarkan & Inisialisasi Data"}
                    <Building2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Cheat sheet for demo */}
        {activeTab === "login" && (
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              Butuh akun demo? Gunakan Kode Sekolah <span className="text-green-700 font-bold">"default"</span>
            </p>
            <div className="mt-2 inline-flex gap-4 justify-center text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span>Admin: <strong className="font-mono text-slate-700 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">admin / admin</strong></span>
              <span>Guru: <strong className="font-mono text-slate-700 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">guru1 / guru1</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
