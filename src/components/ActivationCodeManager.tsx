import React, { useState, useEffect } from "react";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Building, 
  Calendar, 
  Search, 
  RefreshCw,
  Sparkles,
  ExternalLink,
  Lock
} from "lucide-react";
import { getActivationCodes, generateActivationCodes, deleteActivationCode } from "../utils/api";

interface CodeItem {
  id: string;
  code: string;
  status: "active" | "used";
  created_at?: string;
  used_at?: string;
  used_by_sekolah?: string;
  used_by_nama_sekolah?: string;
}

export default function ActivationCodeManager() {
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genCount, setGenCount] = useState(5);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "used">("all");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActivationCodes();
      // Sort by creation date descending
      const sorted = (data as CodeItem[]).sort((a, b) => {
        const dateA = a.created_at || "";
        const dateB = b.created_at || "";
        return dateB.localeCompare(dateA);
      });
      setCodes(sorted);
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat daftar kode aktivasi. Layanan cloud Firestore harus aktif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      await generateActivationCodes(genCount);
      await fetchCodes();
    } catch (err: any) {
      setError(err.message || "Gagal membuat kode aktivasi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!window.confirm(`Hapus kode aktivasi ${code}?`)) return;
    setActionLoading(true);
    try {
      await deleteActivationCode(code);
      setCodes(prev => prev.filter(c => c.code !== code));
    } catch (err: any) {
      setError(err.message || "Gagal menghapus kode aktivasi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter & Search
  const filteredCodes = codes.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.used_by_nama_sekolah && c.used_by_nama_sekolah.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.used_by_sekolah && c.used_by_sekolah.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  const activeCount = codes.filter(c => c.status === "active").length;
  const usedCount = codes.filter(c => c.status === "used").length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Section */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-amber-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-600/40 rounded-lg border border-amber-500/30">
                <Lock className="w-5 h-5 text-amber-300" />
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight">
                Panel Kontrol Lisensi Owner
              </h2>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-amber-200 font-medium max-w-xl">
              Gunakan panel ini untuk mengontrol lisensi pendaftaran aplikasi. Hanya Anda sebagai Developer yang dapat memantau pendaftaran sekolah.
            </p>
          </div>
          <button
            onClick={fetchCodes}
            className="flex items-center gap-1.5 text-xs font-bold bg-amber-800/80 hover:bg-amber-800 border border-amber-600/50 px-3.5 py-2 rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </button>
        </div>

        {/* Info stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-6 pt-6 border-t border-amber-800/60 text-center">
          <div className="bg-amber-950/20 py-2 sm:py-3.5 px-2 rounded-xl border border-amber-800/30">
            <span className="block text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider">Total Lisensi</span>
            <span className="text-xl sm:text-3xl font-black mt-0.5 block font-mono">{codes.length}</span>
          </div>
          <div className="bg-amber-950/20 py-2 sm:py-3.5 px-2 rounded-xl border border-amber-800/30">
            <span className="block text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider">Aktif (Unused)</span>
            <span className="text-xl sm:text-3xl font-black text-emerald-300 mt-0.5 block font-mono">{activeCount}</span>
          </div>
          <div className="bg-amber-950/20 py-2 sm:py-3.5 px-2 rounded-xl border border-amber-800/30">
            <span className="block text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-wider">Telah Digunakan</span>
            <span className="text-xl sm:text-3xl font-black text-amber-300 mt-0.5 block font-mono">{usedCount}</span>
          </div>
        </div>
      </div>

      {/* Error block */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-semibold flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Gagal sinkronisasi panel</p>
            <p className="text-xs text-rose-700/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Control Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft h-fit">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Buat Kode Lisensi Baru
          </h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Jumlah Kode</label>
              <select
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-white focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition"
              >
                <option value={1}>1 Kode</option>
                <option value={5}>5 Kode</option>
                <option value={10}>10 Kode</option>
                <option value={20}>20 Kode</option>
                <option value={50}>50 Kode</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={actionLoading || loading}
              className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-sm shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Generate Sekarang
            </button>
          </form>

          {/* Integration Tip */}
          <div className="mt-5 bg-amber-50/70 rounded-xl p-3.5 border border-amber-100 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> Cara Jual di Lynk.id
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              1. Buat produk digital di <strong className="font-semibold text-slate-800">lynk.id</strong>.<br />
              2. Gunakan tipe produk <strong className="font-semibold text-slate-800">"Redeem Code / Custom File"</strong>.<br />
              3. Ambil kode berstatus <span className="text-emerald-700 font-bold">Aktif</span> dari tabel, masukkan ke daftar kode redeem di lynk.id.<br />
              4. Ketika pembeli membayar, lynk.id otomatis memberikan kode unik tersebut kepada mereka untuk didaftarkan!
            </p>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              Database Kode Lisensi
            </h3>
            {/* Filter buttons */}
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              {(["all", "active", "used"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md capitalize transition ${
                    statusFilter === filter
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {filter === "all" ? "Semua" : filter === "active" ? "Aktif" : "Used"}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode atau nama sekolah..."
              className="pl-9 block w-full bg-slate-50 border border-slate-200 rounded-lg py-2 text-xs focus:bg-white focus:border-amber-600 outline-none transition"
            />
          </div>

          {/* Table list */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 font-semibold flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-700" />
              <span>Memuat data...</span>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              Tidak ada kode lisensi yang cocok dengan kriteria.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[420px] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Kode Lisensi</th>
                    <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">Detail Penggunaan</th>
                    <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredCodes.map((item) => (
                    <tr key={item.code} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold px-2 py-1 rounded text-xs">
                            {item.code}
                          </code>
                          <button
                            onClick={() => handleCopy(item.code)}
                            title="Copy code"
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition"
                          >
                            {copiedCode === item.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.status === "active" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Telah Digunakan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.status === "used" ? (
                          <div className="space-y-0.5 text-[11px] max-w-[200px]">
                            <div className="flex items-center gap-1 font-bold text-slate-800">
                              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate" title={item.used_by_nama_sekolah}>
                                {item.used_by_nama_sekolah}
                              </span>
                            </div>
                            <div className="text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              <span>{item.used_at ? new Date(item.used_at).toLocaleDateString("id-ID", { dateStyle: "short" }) : "-"}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px] bg-slate-50 border border-slate-100 px-1 rounded">@{item.used_by_sekolah}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-normal">Belum digunakan</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(item.code)}
                          disabled={actionLoading}
                          title="Hapus Kode"
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
