export type BeritaKategori =
  | "pengumuman" | "berita" | "kegiatan" | "pembangunan";

export interface Berita {
  id:          string;
  title:       string;
  slug:        string;
  excerpt:     string;
  content:     string;
  coverImage:  string;
  kategori:    BeritaKategori;
  author:      string;
  published:   boolean;
  publishedAt: string;
  views:       number;
}

export type WisataKategori = "bahari" | "alam" | "budaya" | "religi";

export interface Wisata {
  id:          string;
  name:        string;
  description: string;
  image:       string;
  kategori:    WisataKategori;
  featured:    boolean;
  createdAt?:  string | null;
  updatedAt?:  string | null;
}

export type UmkmKategori =
  | "kuliner" | "kerajinan" | "pertanian" | "perikanan" | "jasa";

export interface Umkm {
  id:          string;
  name:        string;
  owner:       string;
  description: string;
  image:       string;
  kategori:    UmkmKategori;
  whatsapp:    string | null;
  // Perbaikan: Tambahkan field waktu di sini
  createdAt?:  string | null;
  updatedAt?:  string | null;
}

export interface PerangkatDesa {
  id:       string;
  name:     string;
  jabatan:  string;
  photo:    string | null;
  urutan:   number;
}

export interface StatDesa {
  label: string;
  value: string;
  unit:  string;
  icon:  string;
}

// ─── Pengumuman & Agenda ─────────────────────────────────────────────────────
export type PengumumanPriority = "normal" | "penting" | "darurat";
export type PengumumanType     = "pengumuman" | "agenda";

export interface Pengumuman {
  id:        string;
  title:     string;
  content:   string;
  type:      PengumumanType;
  priority:  PengumumanPriority;
  startDate: string;        // "YYYY-MM-DD"
  endDate:   string | null; // null = tidak kadaluarsa
  aktif:     boolean;
  createdAt: string;
}

// ─── Layanan Desa ─────────────────────────────────────────────────────────────
export type LayananTema = "ocean" | "gold" | "forest";

export interface LayananDesa {
  id:     string;
  icon:   string;
  judul:  string;
  syarat: string[];
  waktu:  string;
  tema:   LayananTema;
  aktif:  boolean;
  urutan: number;
}

// ─── Survei ──────────────────────────────────────────────────────────────────
export interface PertanyaanSurvei {
  id:   string;
  teks: string;
  opsi: string[];
}

export interface Survei {
  id:             string;
  judul:          string;
  deskripsi:      string;
  pertanyaan:     PertanyaanSurvei[];
  aktif:          boolean;
  startDate:      string;
  endDate:        string | null;
  totalResponden: number;
  createdAt:      string;
}

export interface JawabanSurvei {
  id:          string;
  surveiId:    string;
  jawaban:     Record<string, string>;
  submittedAt: string;
}

export interface HasilOpsi {
  teks:   string;
  count:  number;
  persen: number;
}

export interface HasilPertanyaan {
  pertanyaanId:  string;
  teks:          string;
  opsi:          HasilOpsi[];
  totalJawaban:  number;
}

// ─── Aspirasi ─────────────────────────────────────────────────────────────────
export type AspirasiKategori =
  | "infrastruktur" | "pelayanan" | "lingkungan"
  | "ekonomi"       | "pendidikan" | "lainnya";

export interface Aspirasi {
  id:          string;
  nama:        string;
  kontak:      string;
  isi:         string;
  kategori:    AspirasiKategori;
  dibaca:      boolean;
  submittedAt: string;
}