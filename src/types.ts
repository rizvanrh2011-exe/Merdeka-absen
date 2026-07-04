export type Role = 'wali_kelas' | 'guru_mapel';

export interface Siswa {
  id: string;
  nama: string;
  NISN: string;
  kelas_id: string;
  jenis_kelamin: 'L' | 'P';
  dibuat_oleh: string; // wali_kelas ID
}

export interface Kelas {
  id: string;
  nama_kelas: string;
  wali_kelas: string; // nama or guru ID
}

export interface MataPelajaran {
  id: string;
  nama: string;
  KKM: number;
}

export interface Guru {
  id: string;
  nama: string;
  username: string;
  password?: string; // only for login/saving
  role: Role;
  sekolah_id?: string;
}

export interface GuruMapelKelas {
  id: string; // combination of guru_id + mapel_id + kelas_id
  guru_id: string;
  mapel_id: string;
  kelas_id: string;
}

export type StatusAbsensi = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface Absensi {
  id: string;
  siswa_id: string;
  tanggal: string; // YYYY-MM-DD
  status: StatusAbsensi;
}

export type JenisNilai = 'UH' | 'UTS' | 'PAS';

export interface Nilai {
  id: string;
  siswa_id: string;
  mapel_id: string;
  jenis: JenisNilai;
  nilai: number;
  urutan_UH?: number; // 1 for UH1, 2 for UH2, etc. Null/undefined for UTS/PAS
  semester: string; // e.g., 'Ganjil' | 'Genap'
  tahun_ajaran: string; // e.g., '2025/2026'
  input_oleh: string; // guru_id
}

export interface AppSetting {
  tahun_ajaran: string;
  semester: 'Ganjil' | 'Genap';
}

export interface DatabaseState {
  siswa: Siswa[];
  kelas: Kelas[];
  mata_pelajaran: MataPelajaran[];
  guru: Guru[];
  guru_mapel_kelas: GuruMapelKelas[];
  absensi: Absensi[];
  nilai: Nilai[];
  settings: AppSetting;
}
