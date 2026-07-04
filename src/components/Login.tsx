import React, { useState } from "react";
import { GraduationCap, Shield, User, Key, AlertCircle } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: { id: string; nama: string; username: string; role: 'wali_kelas' | 'guru_mapel' }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Gagal membaca respon dari server. Silakan coba lagi.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk. Periksa kembali username dan password.");
      }

      // Successful login! Pass up user info
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-700 text-white rounded-2xl flex items-center justify-center shadow-sm border border-green-600">
            <GraduationCap className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Sistem Guru Pro
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          Kelola Presensi, Penilaian, & Cetak E-Rapor Terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg py-2.5 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full bg-slate-50 border border-slate-200 text-slate-850 rounded-lg py-2.5 text-sm focus:bg-white focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition"
              >
                {loading ? "Menghubungkan..." : "Masuk ke Sistem"}
              </button>
            </div>
          </form>

          {/* Teacher accounts cheat sheet */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Akun Demonstrasi / Pengujian:
            </h4>
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between bg-green-50/50 p-2.5 rounded-lg border border-green-100">
                <span>Wali Kelas (Admin):</span>
                <span className="font-mono text-green-800 font-bold bg-green-100 px-1.5 py-0.5 rounded">
                  admin / admin
                </span>
              </div>
              <div className="flex justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                <span>Guru Matematika:</span>
                <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                  guru1 / guru1
                </span>
              </div>
              <div className="flex justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                <span>Guru IPA (Sains):</span>
                <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                  guru2 / guru2
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
