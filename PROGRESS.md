# Progress Kantin Biru v2 Redesign

## Status: Selesai (Ready for Deployment)

### 1. Desain Baru (DESIGN.md Compliant)
- **Palette**: Netral Zinc monokrom dengan 1 aksen **Deep Amber** (`amber-600 / #d97706`).
- **Font**: Plus Jakarta Sans via Google Fonts.
- **Ikon**: Lucide Icons CDN (clean stroke 1.5, currentColor).
- **Komponen**: Flat design, 1px border tipis (`zinc-200`), tanpa shadow tebal, tanpa efek blur/glow/liquid glass.
- **CSS**: Tailwind CSS via CDN. File custom `style.css` dan `admin/style.css` sudah dihapus sesuai instruksi.

### 2. Alur & Fitur Pemesanan Baru
- **Halaman Utama**: `index.html` menggabungkan Beranda + Katalog Menu dengan pencarian real-time dan filter kategori.
- **Tipe Pesanan**: Pilihan **Makan di Tempat (Dine-in)** dengan nomor meja 1–15 atau **Bawa Pulang (Takeaway)** tanpa nomor meja.
- **Identitas**: Input nama pemesan saat checkout.
- **Pembayaran**: Pilihan Bayar di Kasir (Tunai) atau QRIS.
- **Pelacakan Antrean**:
  - `pesanan.html` menampilkan nomor antrean (#001) dan status progres 4 tahap:
    1. *Pesanan Diterima* (`menunggu_konfirmasi`)
    2. *Sedang Dimasak* (`sedang_dimasak`) + info nomor antrean aktif
    3. *Siap Diambil* (`siap_diambil`)
    4. *Selesai* (`selesai`)
- **Admin Panel**:
  - `admin/index.html`: Kanban Board 3 kolom interaktif (Menunggu Konfirmasi, Sedang Dimasak, Siap Diambil) dengan notifikasi audio pesanan baru.
  - `admin/menu.html`: Manajemen menu, input varian dinamis, toggle rekomendasi cepat, pencarian & paginasi.
  - `admin/riwayat.html`: Ringkasan omset hari ini, grafik pendapatan 7 hari terakhir, dan log pesanan selesai.
  - `admin/login.html`: Autentikasi admin.
