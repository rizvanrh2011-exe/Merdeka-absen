import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { DatabaseState, Siswa, Kelas, MataPelajaran, Guru, GuruMapelKelas, Absensi, Nilai } from "./src/types";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to load or initialize DB
function loadDatabase(): DatabaseState {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data) as DatabaseState;
    } catch (e) {
      console.error("Error parsing database, resetting to default...", e);
    }
  }

  // Preseeded Data
  const defaultDB: DatabaseState = {
    settings: {
      tahun_ajaran: "2025/2026",
      semester: "Ganjil"
    },
    kelas: [
      { id: "k_9a", nama_kelas: "Kelas 9-A", wali_kelas: "Drs. Budi Santoso" }
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
      { id: "g_guru2", nama: "Rian Hidayat, M.Si.", username: "guru2", password: "guru2", role: "guru_mapel" }
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
      { id: "a9", siswa_id: "s9", tanggal: "2026-07-01", status: "Hadir" },

      { id: "a10", siswa_id: "s1", tanggal: "2026-07-02", status: "Hadir" },
      { id: "a11", siswa_id: "s2", tanggal: "2026-07-02", status: "Hadir" },
      { id: "a12", siswa_id: "s3", tanggal: "2026-07-02", status: "Hadir" },
      { id: "a13", siswa_id: "s4", tanggal: "2026-07-02", status: "Hadir" },
      { id: "a14", siswa_id: "s5", tanggal: "2026-07-02", status: "Hadir" },
      { id: "a15", siswa_id: "s6", tanggal: "2026-07-02", status: "Sakit" },
      { id: "a16", siswa_id: "s7", tanggal: "2026-07-02", status: "Hadir" },
      { id: "a17", siswa_id: "s8", tanggal: "2026-07-02", status: "Alpa" },
      { id: "a18", siswa_id: "s9", tanggal: "2026-07-02", status: "Hadir" }
    ],
    nilai: [
      // Matematika grades
      { id: "n1", siswa_id: "s1", mapel_id: "mp_mat", jenis: "UH", nilai: 85, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n2", siswa_id: "s2", mapel_id: "mp_mat", jenis: "UH", nilai: 72, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n3", siswa_id: "s3", mapel_id: "mp_mat", jenis: "UH", nilai: 90, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n4", siswa_id: "s4", mapel_id: "mp_mat", jenis: "UH", nilai: 68, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n5", siswa_id: "s5", mapel_id: "mp_mat", jenis: "UH", nilai: 80, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n6", siswa_id: "s6", mapel_id: "mp_mat", jenis: "UH", nilai: 74, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n7", siswa_id: "s7", mapel_id: "mp_mat", jenis: "UH", nilai: 95, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n8", siswa_id: "s8", mapel_id: "mp_mat", jenis: "UH", nilai: 60, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n9", siswa_id: "s9", mapel_id: "mp_mat", jenis: "UH", nilai: 88, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },

      { id: "n10", siswa_id: "s1", mapel_id: "mp_mat", jenis: "UH", nilai: 78, urutan_UH: 2, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n11", siswa_id: "s2", mapel_id: "mp_mat", jenis: "UH", nilai: 80, urutan_UH: 2, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n12", siswa_id: "s3", mapel_id: "mp_mat", jenis: "UH", nilai: 88, urutan_UH: 2, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n13", siswa_id: "s4", mapel_id: "mp_mat", jenis: "UH", nilai: 70, urutan_UH: 2, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n14", siswa_id: "s5", mapel_id: "mp_mat", jenis: "UH", nilai: 85, urutan_UH: 2, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n15", siswa_id: "s6", mapel_id: "mp_mat", jenis: "UH", nilai: 80, urutan_UH: 2, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n16", siswa_id: "s7", mapel_id: "mp_mat", jenis: "UH", nilai: 92, urutan_UH: 2, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n17", siswa_id: "s8", mapel_id: "mp_mat", jenis: "UH", nilai: 65, urutan_UH: 2, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n18", siswa_id: "s9", mapel_id: "mp_mat", jenis: "UH", nilai: 82, urutan_UH: 2, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },

      { id: "n19", siswa_id: "s1", mapel_id: "mp_mat", jenis: "UTS", nilai: 82, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },
      { id: "n20", siswa_id: "s1", mapel_id: "mp_mat", jenis: "PAS", nilai: 80, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_guru1" },

      // Bahasa Indonesia grades
      { id: "n21", siswa_id: "s1", mapel_id: "mp_ind", jenis: "UH", nilai: 90, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_admin" },
      { id: "n22", siswa_id: "s2", mapel_id: "mp_ind", jenis: "UH", nilai: 85, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_admin" },
      { id: "n23", siswa_id: "s3", mapel_id: "mp_ind", jenis: "UH", nilai: 88, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_admin" },
      { id: "n24", siswa_id: "s4", mapel_id: "mp_ind", jenis: "UH", nilai: 78, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_admin" },
      { id: "n25", siswa_id: "s5", mapel_id: "mp_ind", jenis: "UH", nilai: 82, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_admin" },
      { id: "n26", siswa_id: "s6", mapel_id: "mp_ind", jenis: "UH", nilai: 80, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_admin" },
      { id: "n27", siswa_id: "s7", mapel_id: "mp_ind", jenis: "UH", nilai: 90, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_admin" },
      { id: "n28", siswa_id: "s8", mapel_id: "mp_ind", jenis: "UH", nilai: 72, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_admin" },
      { id: "n29", siswa_id: "s9", mapel_id: "mp_ind", jenis: "UH", nilai: 85, urutan_UH: 1, semester: "Ganjil", tahun_ajaran: "2025/2026", input_oleh: "g_admin" }
    ]
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf-8");
  return defaultDB;
}

// Write helper
function saveDatabase(db: DatabaseState) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize DB on start
  let dbState = loadDatabase();

  // API: Authentication
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password harus diisi" });
    }

    const matchedGuru = dbState.guru.find(
      (g) => g.username.toLowerCase() === username.toLowerCase() && g.password === password
    );

    if (!matchedGuru) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    // Return profile without sensitive password
    const profile = {
      id: matchedGuru.id,
      nama: matchedGuru.nama,
      username: matchedGuru.username,
      role: matchedGuru.role,
    };

    res.json({ success: true, user: profile });
  });

  // API: Fetch Database State
  app.get("/api/db", (req, res) => {
    // Return DB state (optionally strip passwords for safety)
    const safetyState = {
      ...dbState,
      guru: dbState.guru.map(({ password, ...rest }) => rest),
    };
    res.json(safetyState);
  });

  // API: Save state for specific entity (Wali Kelas / Admin only for master entities)
  app.post("/api/siswa", (req, res) => {
    const siswaData = req.body as Siswa;
    if (!siswaData.id) {
      siswaData.id = "s_" + Date.now();
    }
    const idx = dbState.siswa.findIndex((s) => s.id === siswaData.id);
    if (idx >= 0) {
      dbState.siswa[idx] = siswaData;
    } else {
      dbState.siswa.push(siswaData);
    }
    saveDatabase(dbState);
    res.json({ success: true, siswa: siswaData });
  });

  app.delete("/api/siswa/:id", (req, res) => {
    const { id } = req.params;
    dbState.siswa = dbState.siswa.filter((s) => s.id !== id);
    // clean up associated attendance and grades
    dbState.absensi = dbState.absensi.filter((a) => a.siswa_id !== id);
    dbState.nilai = dbState.nilai.filter((n) => n.siswa_id !== id);
    saveDatabase(dbState);
    res.json({ success: true });
  });

  app.post("/api/kelas", (req, res) => {
    const kelasData = req.body as Kelas;
    if (!kelasData.id) {
      kelasData.id = "k_" + Date.now();
    }
    const idx = dbState.kelas.findIndex((k) => k.id === kelasData.id);
    if (idx >= 0) {
      dbState.kelas[idx] = kelasData;
    } else {
      dbState.kelas.push(kelasData);
    }
    saveDatabase(dbState);
    res.json({ success: true, kelas: kelasData });
  });

  app.delete("/api/kelas/:id", (req, res) => {
    const { id } = req.params;
    dbState.kelas = dbState.kelas.filter((k) => k.id !== id);
    saveDatabase(dbState);
    res.json({ success: true });
  });

  app.post("/api/mapel", (req, res) => {
    const mapelData = req.body as MataPelajaran;
    if (!mapelData.id) {
      mapelData.id = "mp_" + Date.now();
    }
    const idx = dbState.mata_pelajaran.findIndex((m) => m.id === mapelData.id);
    if (idx >= 0) {
      dbState.mata_pelajaran[idx] = mapelData;
    } else {
      dbState.mata_pelajaran.push(mapelData);
    }
    saveDatabase(dbState);
    res.json({ success: true, mata_pelajaran: mapelData });
  });

  app.delete("/api/mapel/:id", (req, res) => {
    const { id } = req.params;
    dbState.mata_pelajaran = dbState.mata_pelajaran.filter((m) => m.id !== id);
    dbState.nilai = dbState.nilai.filter((n) => n.mapel_id !== id);
    dbState.guru_mapel_kelas = dbState.guru_mapel_kelas.filter((gmk) => gmk.mapel_id !== id);
    saveDatabase(dbState);
    res.json({ success: true });
  });

  app.post("/api/guru", (req, res) => {
    const guruData = req.body as Guru;
    if (!guruData.id) {
      guruData.id = "g_" + Date.now();
    }
    const idx = dbState.guru.findIndex((g) => g.id === guruData.id);
    if (idx >= 0) {
      // Preserve existing password if not provided
      const existingGuru = dbState.guru[idx];
      if (!guruData.password) {
        guruData.password = existingGuru.password;
      }
      dbState.guru[idx] = guruData;
    } else {
      if (!guruData.password) {
        guruData.password = "password123"; // default password
      }
      dbState.guru.push(guruData);
    }
    saveDatabase(dbState);
    res.json({ success: true });
  });

  app.delete("/api/guru/:id", (req, res) => {
    const { id } = req.params;
    if (id === "g_admin") {
      return res.status(400).json({ error: "Admin utama tidak boleh dihapus!" });
    }
    dbState.guru = dbState.guru.filter((g) => g.id !== id);
    dbState.guru_mapel_kelas = dbState.guru_mapel_kelas.filter((gmk) => gmk.guru_id !== id);
    saveDatabase(dbState);
    res.json({ success: true });
  });

  app.post("/api/guru-mapel-kelas", (req, res) => {
    const mapping = req.body as GuruMapelKelas;
    if (!mapping.id) {
      mapping.id = "gmk_" + Date.now();
    }
    const idx = dbState.guru_mapel_kelas.findIndex((gmk) => gmk.id === mapping.id);
    if (idx >= 0) {
      dbState.guru_mapel_kelas[idx] = mapping;
    } else {
      dbState.guru_mapel_kelas.push(mapping);
    }
    saveDatabase(dbState);
    res.json({ success: true, guru_mapel_kelas: mapping });
  });

  app.delete("/api/guru-mapel-kelas/:id", (req, res) => {
    const { id } = req.params;
    dbState.guru_mapel_kelas = dbState.guru_mapel_kelas.filter((gmk) => gmk.id !== id);
    saveDatabase(dbState);
    res.json({ success: true });
  });

  app.post("/api/settings", (req, res) => {
    dbState.settings = req.body;
    saveDatabase(dbState);
    res.json({ success: true, settings: dbState.settings });
  });

  // API: Bulk Save Attendance
  app.post("/api/absensi/bulk", (req, res) => {
    const { tanggal, items } = req.body as { tanggal: string; items: { siswa_id: string; status: "Hadir" | "Sakit" | "Izin" | "Alpa" }[] };
    if (!tanggal || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Data absensi tidak valid" });
    }

    // Update or insert records
    items.forEach((item) => {
      const idx = dbState.absensi.findIndex((a) => a.siswa_id === item.siswa_id && a.tanggal === tanggal);
      if (idx >= 0) {
        dbState.absensi[idx].status = item.status;
      } else {
        dbState.absensi.push({
          id: "abs_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          siswa_id: item.siswa_id,
          tanggal,
          status: item.status,
        });
      }
    });

    saveDatabase(dbState);
    res.json({ success: true });
  });

  // API: Bulk Save Grades
  app.post("/api/nilai/bulk", (req, res) => {
    const { mapel_id, jenis, urutan_UH, input_oleh, items } = req.body as {
      mapel_id: string;
      jenis: "UH" | "UTS" | "PAS";
      urutan_UH?: number;
      input_oleh: string;
      items: { siswa_id: string; nilai: number }[];
    };

    if (!mapel_id || !jenis || !input_oleh || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Data nilai tidak lengkap" });
    }

    const currentSettings = dbState.settings;

    items.forEach((item) => {
      // Find matching grade entry to update
      const idx = dbState.nilai.findIndex(
        (n) =>
          n.siswa_id === item.siswa_id &&
          n.mapel_id === mapel_id &&
          n.jenis === jenis &&
          (jenis !== "UH" || n.urutan_UH === urutan_UH) &&
          n.semester === currentSettings.semester &&
          n.tahun_ajaran === currentSettings.tahun_ajaran
      );

      if (idx >= 0) {
        dbState.nilai[idx].nilai = item.nilai;
        dbState.nilai[idx].input_oleh = input_oleh;
      } else {
        dbState.nilai.push({
          id: "nil_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          siswa_id: item.siswa_id,
          mapel_id,
          jenis,
          nilai: item.nilai,
          urutan_UH: jenis === "UH" ? urutan_UH : undefined,
          semester: currentSettings.semester,
          tahun_ajaran: currentSettings.tahun_ajaran,
          input_oleh,
        });
      }
    });

    saveDatabase(dbState);
    res.json({ success: true });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
