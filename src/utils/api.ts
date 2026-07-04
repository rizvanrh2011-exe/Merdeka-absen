import { DatabaseState, Siswa, Kelas, MataPelajaran, Guru, GuruMapelKelas, Absensi, Nilai, AppSetting } from "../types";

const API_BASE = ""; // relative path (same-origin since Express hosts Vite)

export async function loginUser(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Login gagal");
  }
  return res.json() as Promise<{ success: boolean; user: { id: string; nama: string; username: string; role: 'wali_kelas' | 'guru_mapel' } }>;
}

export async function fetchDatabaseState(): Promise<DatabaseState> {
  const res = await fetch(`${API_BASE}/api/db`);
  if (!res.ok) throw new Error("Gagal mengambil data dari server");
  return res.json();
}

export async function saveSiswa(siswa: Siswa) {
  const res = await fetch(`${API_BASE}/api/siswa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(siswa),
  });
  if (!res.ok) throw new Error("Gagal menyimpan data siswa");
  return res.json();
}

export async function deleteSiswa(id: string) {
  const res = await fetch(`${API_BASE}/api/siswa/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus data siswa");
  return res.json();
}

export async function saveKelas(kelas: Kelas) {
  const res = await fetch(`${API_BASE}/api/kelas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(kelas),
  });
  if (!res.ok) throw new Error("Gagal menyimpan data kelas");
  return res.json();
}

export async function deleteKelas(id: string) {
  const res = await fetch(`${API_BASE}/api/kelas/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus data kelas");
  return res.json();
}

export async function saveMapel(mapel: MataPelajaran) {
  const res = await fetch(`${API_BASE}/api/mapel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapel),
  });
  if (!res.ok) throw new Error("Gagal menyimpan data mata pelajaran");
  return res.json();
}

export async function deleteMapel(id: string) {
  const res = await fetch(`${API_BASE}/api/mapel/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus data mata pelajaran");
  return res.json();
}

export async function saveGuru(guru: Guru) {
  const res = await fetch(`${API_BASE}/api/guru`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(guru),
  });
  if (!res.ok) throw new Error("Gagal menyimpan data guru");
  return res.json();
}

export async function deleteGuru(id: string) {
  const res = await fetch(`${API_BASE}/api/guru/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Gagal menghapus data guru");
  }
  return res.json();
}

export async function saveGuruMapelKelas(mapping: GuruMapelKelas) {
  const res = await fetch(`${API_BASE}/api/guru-mapel-kelas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapping),
  });
  if (!res.ok) throw new Error("Gagal menyimpan pemetaan guru");
  return res.json();
}

export async function deleteGuruMapelKelas(id: string) {
  const res = await fetch(`${API_BASE}/api/guru-mapel-kelas/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus pemetaan guru");
  return res.json();
}

export async function saveSettings(settings: AppSetting) {
  const res = await fetch(`${API_BASE}/api/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
  return res.json();
}

export async function saveAbsensiBulk(tanggal: string, items: { siswa_id: string; status: "Hadir" | "Sakit" | "Izin" | "Alpa" }[]) {
  const res = await fetch(`${API_BASE}/api/absensi/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tanggal, items }),
  });
  if (!res.ok) throw new Error("Gagal menyimpan presensi");
  return res.json();
}

export async function saveNilaiBulk(payload: {
  mapel_id: string;
  jenis: "UH" | "UTS" | "PAS";
  urutan_UH?: number;
  input_oleh: string;
  items: { siswa_id: string; nilai: number }[];
}) {
  const res = await fetch(`${API_BASE}/api/nilai/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal menyimpan nilai");
  return res.json();
}
