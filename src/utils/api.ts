import { DatabaseState, Siswa, Kelas, MataPelajaran, Guru, GuruMapelKelas, AppSetting } from "../types";

const API_BASE = ""; // relative path (same-origin since Express hosts Vite)

// Default database structure for fallback mode
const DEFAULT_DB: DatabaseState = {
  settings: {
    tahun_ajaran: "2025/2026",
    semester: "Ganjil"
  },
  kelas: [
    {
      id: "k_9a",
      nama_kelas: "Kelas 9-A",
      wali_kelas: "Drs. Budi Santoso"
    }
  ],
  siswa: [
    { id: "s1", nama: "ADITYA", NISN: "0081234561", kelas_id: "k_9a", jenis_kelamin: "L", dibuat_oleh: "g_admin" },
    { id: "s2", nama: "ALFINO", NISN: "0081234562", kelas_id: "k_9a", jenis_kelamin: "L", dibuat_oleh: "g_admin" },
    { id: "s3", nama: "ANGGUN", NISN: "0081234563", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s4", nama: "BALQIS HUMAIRAO SINAGA", NISN: "0081234564", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s5", nama: "KHAIRANI SYAHVIRA", NISN: "0081234565", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s6", nama: "MUHAMMAD NAJRIL", NISN: "0081234566", kelas_id: "k_9a", jenis_kelamin: "L", dibuat_oleh: "g_admin" },
    { id: "s7", nama: "NURUL CIKYTA", NISN: "0081234567", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s8", nama: "SABRINA TASYA", NISN: "0081234568", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s9", nama: "ZURNI SOFIA", NISN: "0081234569", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" }
  ],
  mata_pelajaran: [
    { id: "mp_mat", nama: "Matematika", KKM: 75 },
    { id: "mp_ind", nama: "Bahasa Indonesia", KKM: 75 },
    { id: "mp_ipa", nama: "IPA (Sains)", KKM: 75 },
    { id: "mp_ips", nama: "IPS (Sosial)", KKM: 70 },
    { id: "mp_ing", nama: "Bahasa Inggris", KKM: 72 },
    { id: "mp_ppn", nama: "Pendidikan Pancasila", KKM: 75 }
  ],
  guru: [
    { id: "g_admin", nama: "Drs. Budi Santoso", username: "admin", password: "admin", role: "wali_kelas" },
    { id: "g_guru1", nama: "Siti Aminah, S.Pd.", username: "guru1", password: "guru1", role: "guru_mapel" },
    { id: "g_guru2", nama: "Rian Hidayat, M.Si.", username: "guru2", password: "guru2", role: "guru_mapel" },
    { id: "g_mira", nama: "Mirawati, S.Pd.I", username: "mira", password: "123", role: "guru_mapel" }
  ],
  guru_mapel_kelas: [
    { id: "gmk1", guru_id: "g_admin", mapel_id: "mp_ppn", kelas_id: "k_9a" },
    { id: "gmk2", guru_id: "g_admin", mapel_id: "mp_ind", kelas_id: "k_9a" },
    { id: "gmk3", guru_id: "g_guru1", mapel_id: "mp_mat", kelas_id: "k_9a" },
    { id: "gmk4", guru_id: "g_guru1", mapel_id: "mp_ing", kelas_id: "k_9a" },
    { id: "gmk5", guru_id: "g_guru2", mapel_id: "mp_ipa", kelas_id: "k_9a" },
    { id: "gmk6", guru_id: "g_guru2", mapel_id: "mp_ips", kelas_id: "k_9a" }
  ],
  absensi: [
    { id: "a1", siswa_id: "s1", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a2", siswa_id: "s2", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a3", siswa_id: "s3", tanggal: "2026-07-01", status: "Sakit" },
    { id: "a4", siswa_id: "s4", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a5", siswa_id: "s5", tanggal: "2026-07-01", status: "Izin" },
    { id: "a6", siswa_id: "s6", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a7", siswa_id: "s7", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a8", siswa_id: "s8", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a9", siswa_id: "s9", tanggal: "2026-07-01", status: "Hadir" }
  ],
  nilai: []
};

const STORAGE_KEY = "merdeka_db_state";

// Helpers for Local Fallback state
export function getUseLocalFallback(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("use_local_fallback") === "true";
}

export function setUseLocalFallback(val: boolean) {
  if (typeof window !== "undefined") {
    if (val) {
      sessionStorage.setItem("use_local_fallback", "true");
    } else {
      sessionStorage.removeItem("use_local_fallback");
    }
  }
}

export function getLocalDb(): DatabaseState {
  if (typeof window === "undefined") return DEFAULT_DB;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_DB;
  }
}

export function saveLocalDb(db: DatabaseState) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

// -------------------------------------------------------------
// TRANSPARENT MOCK API ROUTER (INTERCEPTOR)
// -------------------------------------------------------------
async function handleMockApi(url: string, init?: RequestInit): Promise<Response> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url, window.location.origin);
  } catch (e) {
    parsedUrl = new URL(url, "http://localhost");
  }
  
  const path = parsedUrl.pathname;
  const method = (init?.method || "GET").toUpperCase();

  const getBody = () => {
    if (!init?.body) return {};
    if (typeof init.body === "string") return JSON.parse(init.body);
    return {};
  };

  const db = getLocalDb();

  // 1. GET /api/db
  if (path === "/api/db" && method === "GET") {
    return new Response(JSON.stringify(db), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. POST /api/login
  if (path === "/api/login" && method === "POST") {
    const { username, password } = getBody();
    const found = db.guru.find(
      g => g.username.toLowerCase() === username.toLowerCase() && g.password === password
    );
    if (!found) {
      return new Response(JSON.stringify({ error: "Gagal masuk. Periksa kembali username dan password." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: found.id,
        nama: found.nama,
        username: found.username,
        role: found.role
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 3. /api/siswa
  if (path === "/api/siswa") {
    if (method === "POST") {
      const siswa = getBody();
      if (!siswa.id) {
        siswa.id = `s_${Date.now()}`;
        db.siswa.push(siswa);
      } else {
        const idx = db.siswa.findIndex(s => s.id === siswa.id);
        if (idx > -1) db.siswa[idx] = siswa;
        else db.siswa.push(siswa);
      }
      saveLocalDb(db);
      return new Response(JSON.stringify({ success: true, siswa }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  if (path.startsWith("/api/siswa/") && method === "DELETE") {
    const id = path.split("/").pop() || "";
    db.siswa = db.siswa.filter(s => s.id !== id);
    db.absensi = db.absensi.filter(a => a.siswa_id !== id);
    db.nilai = db.nilai.filter(n => n.siswa_id !== id);
    saveLocalDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 4. /api/kelas
  if (path === "/api/kelas") {
    if (method === "POST") {
      const kelas = getBody();
      if (!kelas.id) {
        kelas.id = `k_${Date.now()}`;
        db.kelas.push(kelas);
      } else {
        const idx = db.kelas.findIndex(k => k.id === kelas.id);
        if (idx > -1) db.kelas[idx] = kelas;
        else db.kelas.push(kelas);
      }
      saveLocalDb(db);
      return new Response(JSON.stringify({ success: true, kelas }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  if (path.startsWith("/api/kelas/") && method === "DELETE") {
    const id = path.split("/").pop() || "";
    db.kelas = db.kelas.filter(k => k.id !== id);
    const sIdsToDel = db.siswa.filter(s => s.kelas_id === id).map(s => s.id);
    db.siswa = db.siswa.filter(s => s.kelas_id !== id);
    db.absensi = db.absensi.filter(a => !sIdsToDel.includes(a.siswa_id));
    db.nilai = db.nilai.filter(n => !sIdsToDel.includes(n.siswa_id));
    db.guru_mapel_kelas = db.guru_mapel_kelas.filter(gmk => gmk.kelas_id !== id);
    saveLocalDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 5. /api/mapel
  if (path === "/api/mapel") {
    if (method === "POST") {
      const mapel = getBody();
      if (!mapel.id) {
        mapel.id = `mp_${Date.now()}`;
        db.mata_pelajaran.push(mapel);
      } else {
        const idx = db.mata_pelajaran.findIndex(m => m.id === mapel.id);
        if (idx > -1) db.mata_pelajaran[idx] = mapel;
        else db.mata_pelajaran.push(mapel);
      }
      saveLocalDb(db);
      return new Response(JSON.stringify({ success: true, mapel }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  if (path.startsWith("/api/mapel/") && method === "DELETE") {
    const id = path.split("/").pop() || "";
    db.mata_pelajaran = db.mata_pelajaran.filter(m => m.id !== id);
    db.guru_mapel_kelas = db.guru_mapel_kelas.filter(gmk => gmk.mapel_id !== id);
    db.nilai = db.nilai.filter(n => n.mapel_id !== id);
    saveLocalDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 6. /api/guru
  if (path === "/api/guru") {
    if (method === "POST") {
      const guru = getBody();
      if (!guru.id) {
        guru.id = `g_${Date.now()}`;
        db.guru.push(guru);
      } else {
        const idx = db.guru.findIndex(g => g.id === guru.id);
        if (idx > -1) db.guru[idx] = { ...db.guru[idx], ...guru };
        else db.guru.push(guru);
      }
      saveLocalDb(db);
      return new Response(JSON.stringify({ success: true, guru }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  if (path.startsWith("/api/guru/") && method === "DELETE") {
    const id = path.split("/").pop() || "";
    if (id === "g_admin") {
      return new Response(JSON.stringify({ error: "Akun Administrator utama tidak dapat dihapus!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    db.guru = db.guru.filter(g => g.id !== id);
    db.guru_mapel_kelas = db.guru_mapel_kelas.filter(gmk => gmk.guru_id !== id);
    saveLocalDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 7. /api/guru-mapel-kelas
  if (path === "/api/guru-mapel-kelas") {
    if (method === "POST") {
      const mapping = getBody();
      const exists = db.guru_mapel_kelas.some(
        g => g.guru_id === mapping.guru_id && g.mapel_id === mapping.mapel_id && g.kelas_id === mapping.kelas_id
      );
      if (exists) {
        return new Response(JSON.stringify({ error: "Pemetaan tugas mengajar ini sudah terdaftar!" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      mapping.id = `gmk_${Date.now()}`;
      db.guru_mapel_kelas.push(mapping);
      saveLocalDb(db);
      return new Response(JSON.stringify({ success: true, mapping }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  if (path.startsWith("/api/guru-mapel-kelas/") && method === "DELETE") {
    const id = path.split("/").pop() || "";
    db.guru_mapel_kelas = db.guru_mapel_kelas.filter(gmk => gmk.id !== id);
    saveLocalDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 8. /api/settings
  if (path === "/api/settings" && method === "POST") {
    const settings = getBody();
    db.settings = settings;
    saveLocalDb(db);
    return new Response(JSON.stringify({ success: true, settings }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 9. /api/absensi/bulk
  if (path === "/api/absensi/bulk" && method === "POST") {
    const { tanggal, items } = getBody();
    const siswaIds = items.map((it: any) => it.siswa_id);
    db.absensi = db.absensi.filter(a => !(a.tanggal === tanggal && siswaIds.includes(a.siswa_id)));
    items.forEach((it: any) => {
      db.absensi.push({
        id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        siswa_id: it.siswa_id,
        tanggal,
        status: it.status
      });
    });
    saveLocalDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 10. /api/nilai/bulk
  if (path === "/api/nilai/bulk" && method === "POST") {
    const { mapel_id, jenis, urutan_UH, input_oleh, items } = getBody();
    const siswaIds = items.map((it: any) => it.siswa_id);
    db.nilai = db.nilai.filter(n => {
      const matchMapel = n.mapel_id === mapel_id;
      const matchJenis = n.jenis === jenis;
      const matchUrutan = jenis === "UH" ? n.urutan_UH === urutan_UH : true;
      const matchSiswa = siswaIds.includes(n.siswa_id);
      return !(matchMapel && matchJenis && matchUrutan && matchSiswa);
    });
    items.forEach((it: any) => {
      db.nilai.push({
        id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        siswa_id: it.siswa_id,
        mapel_id,
        jenis,
        urutan_UH,
        nilai: Number(it.nilai),
        semester: db.settings.semester,
        tahun_ajaran: db.settings.tahun_ajaran,
        input_oleh
      });
    });
    saveLocalDb(db);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ error: "Endpoint tidak ditemukan di Mock API" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}

// -------------------------------------------------------------
// PATCH WINDOW.FETCH PROXY
// -------------------------------------------------------------
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    let url = "";
    if (typeof input === "string") {
      url = input;
    } else if (input && (input as any).url) {
      url = (input as any).url;
    } else {
      url = String(input);
    }

    // Check if the URL is an internal API route
    if (url.includes("/api/")) {
      const isInitialDbCheck = url.endsWith("/api/db") && (!init || !init.method || init.method.toUpperCase() === "GET");

      if (getUseLocalFallback()) {
        try {
          return await handleMockApi(url, init);
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
      }

      // If we haven't active fallback yet, do the real fetch
      try {
        const response = await originalFetch.apply(this, arguments as any);

        if (isInitialDbCheck) {
          const contentType = response.headers.get("content-type") || "";
          if (!response.ok || contentType.includes("text/html")) {
            console.warn("Real API is not available or returned HTML. Switching to LocalStorage Fallback.");
            setUseLocalFallback(true);
            return await handleMockApi(url, init);
          }

          // Check if body content is HTML (common on static routes fallback)
          const clone = response.clone();
          const text = await clone.text();
          if (text.trim().startsWith("<!DOCTYPE")) {
            console.warn("Real API returned HTML instead of JSON. Switching to LocalStorage Fallback.");
            setUseLocalFallback(true);
            return await handleMockApi(url, init);
          }
        }

        // Check if any general request returned HTML fallback (meaning backend server isn't serving this route)
        if (response.status === 200) {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("text/html")) {
            const clone = response.clone();
            const text = await clone.text();
            if (text.trim().startsWith("<!DOCTYPE")) {
              console.warn("Detected fallback HTML on API path. Switching to LocalStorage Fallback.");
              setUseLocalFallback(true);
              return await handleMockApi(url, init);
            }
          }
        }

        return response;
      } catch (err) {
        console.warn("Network error fetching API. Switching to LocalStorage Fallback.", err);
        setUseLocalFallback(true);
        return await handleMockApi(url, init);
      }
    }

    return originalFetch.apply(this, arguments as any);
  };
}

// -------------------------------------------------------------
// ORIGINAL API WRAPPERS (Automatic fallback via transparent fetch)
// -------------------------------------------------------------
export async function loginUser(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  
  let data: any = {};
  try {
    data = await res.json();
  } catch (err) {
    throw new Error("Gagal membaca respon dari server.");
  }

  if (!res.ok) {
    throw new Error(data.error || "Login gagal");
  }
  return data as { success: boolean; user: { id: string; nama: string; username: string; role: 'wali_kelas' | 'guru_mapel' } };
}

export async function fetchDatabaseState(): Promise<DatabaseState> {
  const res = await fetch(`${API_BASE}/api/db`);
  if (!res.ok) throw new Error("Gagal mengambil data dari server");
  try {
    return await res.json();
  } catch (e) {
    throw new Error("Format data database yang diterima dari server tidak valid.");
  }
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
