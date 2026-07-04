import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from "firebase/firestore";
import { DatabaseState, Siswa, Kelas, MataPelajaran, Guru, GuruMapelKelas, Absensi, Nilai } from "./src/types";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Load Firebase Configuration
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firestoreDb: any = null;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    const app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    });
    
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)") {
      firestoreDb = getFirestore(app, config.firestoreDatabaseId);
    } else {
      firestoreDb = getFirestore(app);
    }
    console.log("Firestore initialized successfully on backend with db ID:", config.firestoreDatabaseId || "default");
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
  }
}

// Helper to load or initialize local DB (as fallback)
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
      { id: "a9", siswa_id: "s9", tanggal: "2026-07-01", status: "Hadir" }
    ],
    nilai: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf-8");
  return defaultDB;
}

// Write helper
function saveDatabase(db: DatabaseState) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

// -------------------------------------------------------------
// FIRESTORE SEEDER & MIGRATOR FOR MULTI-TENANCY
// -------------------------------------------------------------
async function seedDefaultSchoolData(sekolahId: string, namaAdmin: string) {
  if (!firestoreDb) return;
  
  // 1. Settings
  await setDoc(doc(firestoreDb, "sekolah", sekolahId, "settings", "current"), {
    tahun_ajaran: "2025/2026",
    semester: "Ganjil"
  });

  // 2. Kelas
  await setDoc(doc(firestoreDb, "sekolah", sekolahId, "kelas", "k_9a"), {
    id: "k_9a",
    nama_kelas: "Kelas 9-A",
    wali_kelas: namaAdmin
  });

  // 3. Siswa
  const siswaData = [
    { id: "s1", nama: "ADITYA", NISN: "0081234561", kelas_id: "k_9a", jenis_kelamin: "L", dibuat_oleh: "g_admin" },
    { id: "s2", nama: "ALFINO", NISN: "0081234562", kelas_id: "k_9a", jenis_kelamin: "L", dibuat_oleh: "g_admin" },
    { id: "s3", nama: "ANGGUN", NISN: "0081234563", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s4", nama: "BALQIS HUMAIRAO SINAGA", NISN: "0081234564", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s5", nama: "KHAIRANI SYAHVIRA", NISN: "0081234565", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s6", nama: "MUHAMMAD NAJRIL", NISN: "0081234566", kelas_id: "k_9a", jenis_kelamin: "L", dibuat_oleh: "g_admin" },
    { id: "s7", nama: "NURUL CIKYTA", NISN: "0081234567", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s8", nama: "SABRINA TASYA", NISN: "0081234568", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" },
    { id: "s9", nama: "ZURNI SOFIA", NISN: "0081234569", kelas_id: "k_9a", jenis_kelamin: "P", dibuat_oleh: "g_admin" }
  ];
  for (const s of siswaData) {
    await setDoc(doc(firestoreDb, "sekolah", sekolahId, "siswa", s.id), s);
  }

  // 4. Mata Pelajaran
  const mapelData = [
    { id: "mp_mat", nama: "Matematika", KKM: 75 },
    { id: "mp_ind", nama: "Bahasa Indonesia", KKM: 75 },
    { id: "mp_ipa", nama: "IPA (Sains)", KKM: 75 },
    { id: "mp_ips", nama: "IPS (Sosial)", KKM: 70 },
    { id: "mp_ing", nama: "Bahasa Inggris", KKM: 72 },
    { id: "mp_ppn", nama: "Pendidikan Pancasila", KKM: 75 }
  ];
  for (const m of mapelData) {
    await setDoc(doc(firestoreDb, "sekolah", sekolahId, "mata_pelajaran", m.id), m);
  }

  // 5. Guru demo
  const extraGurus = [
    { id: "g_guru1", nama: "Siti Aminah, S.Pd.", username: "guru1", password: "guru1", role: "guru_mapel" },
    { id: "g_guru2", nama: "Rian Hidayat, M.Si.", username: "guru2", password: "guru2", role: "guru_mapel" }
  ];
  for (const g of extraGurus) {
    await setDoc(doc(firestoreDb, "sekolah", sekolahId, "guru", g.id), g);
  }

  // 6. Guru Mapel Kelas mapping
  const mappings = [
    { id: "gmk1", guru_id: "g_admin", mapel_id: "mp_ppn", kelas_id: "k_9a" },
    { id: "gmk2", guru_id: "g_admin", mapel_id: "mp_ind", kelas_id: "k_9a" },
    { id: "gmk3", guru_id: "g_guru1", mapel_id: "mp_mat", kelas_id: "k_9a" },
    { id: "gmk4", guru_id: "g_guru1", mapel_id: "mp_ing", kelas_id: "k_9a" },
    { id: "gmk5", guru_id: "g_guru2", mapel_id: "mp_ipa", kelas_id: "k_9a" },
    { id: "gmk6", guru_id: "g_guru2", mapel_id: "mp_ips", kelas_id: "k_9a" }
  ];
  for (const m of mappings) {
    await setDoc(doc(firestoreDb, "sekolah", sekolahId, "guru_mapel_kelas", m.id), m);
  }

  // 7. Absensi
  const absensiData = [
    { id: "a1", siswa_id: "s1", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a2", siswa_id: "s2", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a3", siswa_id: "s3", tanggal: "2026-07-01", status: "Sakit" },
    { id: "a4", siswa_id: "s4", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a5", siswa_id: "s5", tanggal: "2026-07-01", status: "Izin" },
    { id: "a6", siswa_id: "s6", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a7", siswa_id: "s7", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a8", siswa_id: "s8", tanggal: "2026-07-01", status: "Hadir" },
    { id: "a9", siswa_id: "s9", tanggal: "2026-07-01", status: "Hadir" }
  ];
  for (const a of absensiData) {
    await setDoc(doc(firestoreDb, "sekolah", sekolahId, "absensi", a.id), a);
  }
}

async function migrateLocalDbToFirestore() {
  if (!firestoreDb) return;
  try {
    const defSchoolRef = doc(firestoreDb, "sekolah", "default");
    const defSchoolSnap = await getDoc(defSchoolRef);
    
    if (!defSchoolSnap.exists()) {
      console.log("Seeding 'default' school in Firestore from local db.json/default state...");
      await setDoc(defSchoolRef, {
        id: "default",
        nama_sekolah: "Sekolah Percontohan Pro (Demo)",
        dibuat_pada: new Date().toISOString()
      });

      const localDb = loadDatabase(); // load from db.json
      
      // Settings
      await setDoc(doc(firestoreDb, "sekolah", "default", "settings", "current"), localDb.settings);

      // Collections
      const collections = ["siswa", "kelas", "mata_pelajaran", "guru", "guru_mapel_kelas", "absensi", "nilai"];
      for (const col of collections) {
        const items = (localDb as any)[col] || [];
        for (const item of items) {
          if (item.id) {
            const mappedCol = col === "mata_pelajaran" ? "mata_pelajaran" : col;
            await setDoc(doc(firestoreDb, "sekolah", "default", mappedCol, item.id), item);
          }
        }
      }
      console.log("Migration of 'default' school to Firestore successfully completed!");
    }
  } catch (err) {
    console.error("Migration to Firestore failed:", err);
  }
}

// -------------------------------------------------------------
// FIRESTORE TENANT FETCH SERVICE
// -------------------------------------------------------------
async function getSchoolState(sekolahId: string): Promise<DatabaseState> {
  const settingsDoc = await getDoc(doc(firestoreDb, "sekolah", sekolahId, "settings", "current"));
  const settings = settingsDoc.exists() ? settingsDoc.data() : { tahun_ajaran: "2025/2026", semester: "Ganjil" };

  const fetchCol = async (colName: string) => {
    const snap = await getDocs(collection(firestoreDb, "sekolah", sekolahId, colName));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  };

  const [siswa, kelas, mata_pelajaran, guru, guru_mapel_kelas, absensi, nilai] = await Promise.all([
    fetchCol("siswa"),
    fetchCol("kelas"),
    fetchCol("mata_pelajaran"),
    fetchCol("guru"),
    fetchCol("guru_mapel_kelas"),
    fetchCol("absensi"),
    fetchCol("nilai")
  ]);

  return {
    settings: settings as any,
    siswa: siswa as any,
    kelas: kelas as any,
    mata_pelajaran: mata_pelajaran as any,
    guru: guru as any,
    guru_mapel_kelas: guru_mapel_kelas as any,
    absensi: absensi as any,
    nilai: nilai as any
  };
}

// -------------------------------------------------------------
// EXPRESS APP INITIALIZATION
// -------------------------------------------------------------
async function startServer() {
  const app = express();
  app.use(express.json());

  // Trigger migration if Firestore is enabled
  if (firestoreDb) {
    await migrateLocalDbToFirestore();
  } else {
    console.log("Firebase not configured. Running in Local Mode with db.json.");
    loadDatabase();
  }

  // API: Register New School (Multi-Tenant)
  app.post("/api/register-sekolah", async (req, res) => {
    const { nama_sekolah, kode_sekolah, nama_admin, username, password } = req.body;
    
    if (!nama_sekolah || !kode_sekolah || !nama_admin || !username || !password) {
      return res.status(400).json({ error: "Semua field pendaftaran harus diisi!" });
    }

    const cleanKode = kode_sekolah.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleanKode.length < 3 || cleanKode.length > 20) {
      return res.status(400).json({ error: "Kode Sekolah harus berupa 3-20 karakter alfanumerik." });
    }

    if (cleanKode === "default") {
      return res.status(400).json({ error: "Kode sekolah 'default' dicadangkan untuk demo." });
    }

    if (!firestoreDb) {
      return res.status(500).json({ error: "Layanan cloud database belum aktif. Silakan coba lagi." });
    }

    try {
      const schoolRef = doc(firestoreDb, "sekolah", cleanKode);
      const schoolSnap = await getDoc(schoolRef);
      if (schoolSnap.exists()) {
        return res.status(400).json({ error: `Kode Sekolah '${cleanKode}' sudah digunakan oleh sekolah lain!` });
      }

      // Create school
      await setDoc(schoolRef, {
        id: cleanKode,
        nama_sekolah: nama_sekolah.trim(),
        dibuat_pada: new Date().toISOString()
      });

      // Create admin guru
      await setDoc(doc(firestoreDb, "sekolah", cleanKode, "guru", "g_admin"), {
        id: "g_admin",
        nama: nama_admin.trim(),
        username: username.trim(),
        password: password,
        role: "wali_kelas"
      });

      // Seed default sandbox data for instant play
      await seedDefaultSchoolData(cleanKode, nama_admin.trim());

      res.json({ success: true, sekolah_id: cleanKode });
    } catch (err: any) {
      console.error("Error registering school:", err);
      res.status(500).json({ error: "Gagal mendaftarkan sekolah: " + err.message });
    }
  });

  // API: Authentication
  app.post("/api/login", async (req, res) => {
    const { username, password, kode_sekolah } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password harus diisi" });
    }

    const sekolahId = (kode_sekolah || "default").trim().toLowerCase();

    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, "sekolah", sekolahId, "guru"));
        const matchedGuruDoc = snap.docs.find(d => {
          const data = d.data();
          return data.username?.toLowerCase() === username.toLowerCase() && data.password === password;
        });

        if (!matchedGuruDoc) {
          return res.status(401).json({ error: `Username atau password salah untuk Kode Sekolah '${sekolahId}'.` });
        }

        const data = matchedGuruDoc.data();
        const profile = {
          id: matchedGuruDoc.id,
          nama: data.nama,
          username: data.username,
          role: data.role,
          sekolah_id: sekolahId
        };

        return res.json({ success: true, user: profile });
      } catch (err: any) {
        console.error("Login Error:", err);
        return res.status(500).json({ error: "Kesalahan server saat login: " + err.message });
      }
    } else {
      // Local Mode Fallback
      if (sekolahId !== "default") {
        return res.status(400).json({ error: "Mode lokal hanya mendukung Kode Sekolah 'default'." });
      }
      const localDb = loadDatabase();
      const matchedGuru = localDb.guru.find(
        (g) => g.username.toLowerCase() === username.toLowerCase() && g.password === password
      );

      if (!matchedGuru) {
        return res.status(401).json({ error: "Username atau password salah" });
      }

      const profile = {
        id: matchedGuru.id,
        nama: matchedGuru.nama,
        username: matchedGuru.username,
        role: matchedGuru.role,
        sekolah_id: "default"
      };

      return res.json({ success: true, user: profile });
    }
  });

  // API: Fetch Database State
  app.get("/api/db", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";

    if (firestoreDb) {
      try {
        const state = await getSchoolState(sekolahId);
        const safetyState = {
          ...state,
          guru: state.guru.map(({ password, ...rest }) => rest),
        };
        res.json(safetyState);
      } catch (err: any) {
        console.error("Error loading school state:", err);
        res.status(500).json({ error: "Gagal memuat database sekolah: " + err.message });
      }
    } else {
      const localDb = loadDatabase();
      const safetyState = {
        ...localDb,
        guru: localDb.guru.map(({ password, ...rest }) => rest),
      };
      res.json(safetyState);
    }
  });

  // API: Save/Update Siswa
  app.post("/api/siswa", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const siswaData = req.body as Siswa;
    if (!siswaData.id) {
      siswaData.id = "s_" + Date.now();
    }

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, "sekolah", sekolahId, "siswa", siswaData.id), siswaData);
        res.json({ success: true, siswa: siswaData });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      const idx = localDb.siswa.findIndex((s) => s.id === siswaData.id);
      if (idx >= 0) localDb.siswa[idx] = siswaData;
      else localDb.siswa.push(siswaData);
      saveDatabase(localDb);
      res.json({ success: true, siswa: siswaData });
    }
  });

  app.delete("/api/siswa/:id", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const { id } = req.params;

    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, "sekolah", sekolahId, "siswa", id));
        
        // Clean up attendance
        const absSnap = await getDocs(collection(firestoreDb, "sekolah", sekolahId, "absensi"));
        const absBatch = writeBatch(firestoreDb);
        let countAbs = 0;
        absSnap.docs.forEach(d => {
          if (d.data().siswa_id === id) {
            absBatch.delete(d.ref);
            countAbs++;
          }
        });
        if (countAbs > 0) await absBatch.commit();

        // Clean up grades
        const nilSnap = await getDocs(collection(firestoreDb, "sekolah", sekolahId, "nilai"));
        const nilBatch = writeBatch(firestoreDb);
        let countNil = 0;
        nilSnap.docs.forEach(d => {
          if (d.data().siswa_id === id) {
            nilBatch.delete(d.ref);
            countNil++;
          }
        });
        if (countNil > 0) await nilBatch.commit();

        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      localDb.siswa = localDb.siswa.filter((s) => s.id !== id);
      localDb.absensi = localDb.absensi.filter((a) => a.siswa_id !== id);
      localDb.nilai = localDb.nilai.filter((n) => n.siswa_id !== id);
      saveDatabase(localDb);
      res.json({ success: true });
    }
  });

  // API: Kelas
  app.post("/api/kelas", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const kelasData = req.body as Kelas;
    if (!kelasData.id) {
      kelasData.id = "k_" + Date.now();
    }

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, "sekolah", sekolahId, "kelas", kelasData.id), kelasData);
        res.json({ success: true, kelas: kelasData });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      const idx = localDb.kelas.findIndex((k) => k.id === kelasData.id);
      if (idx >= 0) localDb.kelas[idx] = kelasData;
      else localDb.kelas.push(kelasData);
      saveDatabase(localDb);
      res.json({ success: true, kelas: kelasData });
    }
  });

  app.delete("/api/kelas/:id", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const { id } = req.params;

    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, "sekolah", sekolahId, "kelas", id));
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      localDb.kelas = localDb.kelas.filter((k) => k.id !== id);
      saveDatabase(localDb);
      res.json({ success: true });
    }
  });

  // API: Mapel
  app.post("/api/mapel", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const mapelData = req.body as MataPelajaran;
    if (!mapelData.id) {
      mapelData.id = "mp_" + Date.now();
    }

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, "sekolah", sekolahId, "mata_pelajaran", mapelData.id), mapelData);
        res.json({ success: true, mata_pelajaran: mapelData });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      const idx = localDb.mata_pelajaran.findIndex((m) => m.id === mapelData.id);
      if (idx >= 0) localDb.mata_pelajaran[idx] = mapelData;
      else localDb.mata_pelajaran.push(mapelData);
      saveDatabase(localDb);
      res.json({ success: true, mata_pelajaran: mapelData });
    }
  });

  app.delete("/api/mapel/:id", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const { id } = req.params;

    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, "sekolah", sekolahId, "mata_pelajaran", id));
        
        // clean up associated grades
        const nilSnap = await getDocs(collection(firestoreDb, "sekolah", sekolahId, "nilai"));
        const nilBatch = writeBatch(firestoreDb);
        let countNil = 0;
        nilSnap.docs.forEach(d => {
          if (d.data().mapel_id === id) {
            nilBatch.delete(d.ref);
            countNil++;
          }
        });
        if (countNil > 0) await nilBatch.commit();

        // clean up gmk
        const gmkSnap = await getDocs(collection(firestoreDb, "sekolah", sekolahId, "guru_mapel_kelas"));
        const gmkBatch = writeBatch(firestoreDb);
        let countGmk = 0;
        gmkSnap.docs.forEach(d => {
          if (d.data().mapel_id === id) {
            gmkBatch.delete(d.ref);
            countGmk++;
          }
        });
        if (countGmk > 0) await gmkBatch.commit();

        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      localDb.mata_pelajaran = localDb.mata_pelajaran.filter((m) => m.id !== id);
      localDb.nilai = localDb.nilai.filter((n) => n.mapel_id !== id);
      localDb.guru_mapel_kelas = localDb.guru_mapel_kelas.filter((gmk) => gmk.mapel_id !== id);
      saveDatabase(localDb);
      res.json({ success: true });
    }
  });

  // API: Guru
  app.post("/api/guru", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const guruData = req.body as Guru;
    if (!guruData.id) {
      guruData.id = "g_" + Date.now();
    }

    if (firestoreDb) {
      try {
        if (!guruData.password) {
          const existingSnap = await getDoc(doc(firestoreDb, "sekolah", sekolahId, "guru", guruData.id));
          if (existingSnap.exists()) {
            guruData.password = existingSnap.data().password;
          } else {
            guruData.password = "password123";
          }
        }
        await setDoc(doc(firestoreDb, "sekolah", sekolahId, "guru", guruData.id), guruData);
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      const idx = localDb.guru.findIndex((g) => g.id === guruData.id);
      if (idx >= 0) {
        if (!guruData.password) {
          guruData.password = localDb.guru[idx].password;
        }
        localDb.guru[idx] = guruData;
      } else {
        if (!guruData.password) {
          guruData.password = "password123";
        }
        localDb.guru.push(guruData);
      }
      saveDatabase(localDb);
      res.json({ success: true });
    }
  });

  app.delete("/api/guru/:id", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const { id } = req.params;
    if (id === "g_admin") {
      return res.status(400).json({ error: "Admin utama tidak boleh dihapus!" });
    }

    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, "sekolah", sekolahId, "guru", id));
        
        // clean up associated gmk mapping
        const gmkSnap = await getDocs(collection(firestoreDb, "sekolah", sekolahId, "guru_mapel_kelas"));
        const gmkBatch = writeBatch(firestoreDb);
        let countGmk = 0;
        gmkSnap.docs.forEach(d => {
          if (d.data().guru_id === id) {
            gmkBatch.delete(d.ref);
            countGmk++;
          }
        });
        if (countGmk > 0) await gmkBatch.commit();

        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      localDb.guru = localDb.guru.filter((g) => g.id !== id);
      localDb.guru_mapel_kelas = localDb.guru_mapel_kelas.filter((gmk) => gmk.guru_id !== id);
      saveDatabase(localDb);
      res.json({ success: true });
    }
  });

  // API: Guru Mapel Kelas mapping
  app.post("/api/guru-mapel-kelas", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const mapping = req.body as GuruMapelKelas;
    if (!mapping.id) {
      mapping.id = "gmk_" + Date.now();
    }

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, "sekolah", sekolahId, "guru_mapel_kelas", mapping.id), mapping);
        res.json({ success: true, guru_mapel_kelas: mapping });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      const idx = localDb.guru_mapel_kelas.findIndex((gmk) => gmk.id === mapping.id);
      if (idx >= 0) localDb.guru_mapel_kelas[idx] = mapping;
      else localDb.guru_mapel_kelas.push(mapping);
      saveDatabase(localDb);
      res.json({ success: true, guru_mapel_kelas: mapping });
    }
  });

  app.delete("/api/guru-mapel-kelas/:id", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const { id } = req.params;

    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, "sekolah", sekolahId, "guru_mapel_kelas", id));
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      localDb.guru_mapel_kelas = localDb.guru_mapel_kelas.filter((gmk) => gmk.id !== id);
      saveDatabase(localDb);
      res.json({ success: true });
    }
  });

  // API: App Settings
  app.post("/api/settings", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const settings = req.body;

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, "sekolah", sekolahId, "settings", "current"), settings);
        res.json({ success: true, settings });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      localDb.settings = settings;
      saveDatabase(localDb);
      res.json({ success: true, settings: localDb.settings });
    }
  });

  // API: Bulk Save Attendance
  app.post("/api/absensi/bulk", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
    const { tanggal, items } = req.body as { tanggal: string; items: { siswa_id: string; status: "Hadir" | "Sakit" | "Izin" | "Alpa" }[] };
    
    if (!tanggal || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Data absensi tidak valid" });
    }

    if (firestoreDb) {
      try {
        const batch = writeBatch(firestoreDb);
        items.forEach((item) => {
          const docId = `abs_${tanggal}_${item.siswa_id}`;
          const docRef = doc(firestoreDb, "sekolah", sekolahId, "absensi", docId);
          batch.set(docRef, {
            id: docId,
            siswa_id: item.siswa_id,
            tanggal,
            status: item.status,
          });
        });
        await batch.commit();
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      items.forEach((item) => {
        const idx = localDb.absensi.findIndex((a) => a.siswa_id === item.siswa_id && a.tanggal === tanggal);
        if (idx >= 0) {
          localDb.absensi[idx].status = item.status;
        } else {
          localDb.absensi.push({
            id: "abs_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
            siswa_id: item.siswa_id,
            tanggal,
            status: item.status,
          });
        }
      });
      saveDatabase(localDb);
      res.json({ success: true });
    }
  });

  // API: Bulk Save Grades
  app.post("/api/nilai/bulk", async (req, res) => {
    const sekolahId = (req.headers["x-sekolah-id"] as string) || "default";
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

    if (firestoreDb) {
      try {
        const settingsDoc = await getDoc(doc(firestoreDb, "sekolah", sekolahId, "settings", "current"));
        const currentSettings = settingsDoc.exists() ? settingsDoc.data() : { tahun_ajaran: "2025/2026", semester: "Ganjil" };
        const { semester, tahun_ajaran } = currentSettings;

        const batch = writeBatch(firestoreDb);
        items.forEach((item) => {
          const urutanStr = jenis === "UH" ? String(urutan_UH) : "0";
          const normalizedSemester = String(semester).replace(/\//g, "-");
          const normalizedTahun = String(tahun_ajaran).replace(/\//g, "-");
          
          // Deterministic unique ID to prevent duplicates
          const docId = `nil_${item.siswa_id}_${mapel_id}_${jenis}_${urutanStr}_${normalizedSemester}_${normalizedTahun}`;
          const docRef = doc(firestoreDb, "sekolah", sekolahId, "nilai", docId);
          
          batch.set(docRef, {
            id: docId,
            siswa_id: item.siswa_id,
            mapel_id,
            jenis,
            nilai: Number(item.nilai),
            urutan_UH: jenis === "UH" ? Number(urutan_UH) : null,
            semester,
            tahun_ajaran,
            input_oleh,
          });
        });

        await batch.commit();
        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    } else {
      const localDb = loadDatabase();
      const currentSettings = localDb.settings;

      items.forEach((item) => {
        const idx = localDb.nilai.findIndex(
          (n) =>
            n.siswa_id === item.siswa_id &&
            n.mapel_id === mapel_id &&
            n.jenis === jenis &&
            (jenis !== "UH" || n.urutan_UH === urutan_UH) &&
            n.semester === currentSettings.semester &&
            n.tahun_ajaran === currentSettings.tahun_ajaran
        );

        if (idx >= 0) {
          localDb.nilai[idx].nilai = item.nilai;
          localDb.nilai[idx].input_oleh = input_oleh;
        } else {
          localDb.nilai.push({
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

      saveDatabase(localDb);
      res.json({ success: true });
    }
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
