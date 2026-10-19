# 📰 The Kindsight Blog — Modern Full-Stack Blog Platform

Aplikasi web blog modern dengan sistem **Dashboard Admin Terproteksi (Login Auth)** dan **Halaman Publik Bersih** dengan tipografi modern yang tidak kaku (*Outfit & Plus Jakarta Sans*).

Dibangun menggunakan **Next.js App Router**, **Tailwind CSS**, dan backend database **Supabase** (PostgreSQL & Storage).

---

## 🔐 Sistem Keamanan & Autentikasi Admin

Halaman publik (`/blogs`) kini **bebas dari tombol admin** sehingga pengunjung umum tidak dapat mengakses dashboard secara sembarangan.

Akses ke seluruh rute `/admin/*` (**`/admin/posts`**, **`/admin/posts/create`**, dll) diproteksi secara ketat menggunakan **Next.js Middleware** dan **HTTP-Only Session Cookie**.

### Akun Login Admin Default:
- **Halaman Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Username**: `adminblog`
- **Password**: `blogadmin`

Jika ada pengunjung umum yang mencoba membuka `/admin/posts` secara langsung di browser tanpa login, sistem akan secara otomatis mengarahkannya (*redirect 307*) ke halaman `/admin/login`.

---

## 🎨 Tipografi Modern & Dinamis (Tidak Kaku)
Font klasik yang kaku telah diganti dengan kombinasi tipografi modern kelas dunia:
- **Heading / Judul**: **Outfit** — Font sans-serif geometris yang dinamis, ekspresif, elegan, dan ramah.
- **Body / Konten**: **Plus Jakarta Sans** — Font modern dengan keterbacaan (*legibility*) tinggi untuk teks bacaan panjang, artikel, dan formulir.

---

## 📦 Data Bersih (Siap Produksi)
Seluruh data dummy bawaan telah **dihapus/dikosongkan 100%**:
- Halaman publik menampilkan pesan sambutan modern yang bersih (*"Belum Ada Artikel yang Diterbitkan"*).
- Halaman admin menampilkan tombol ajakan untuk langsung memulai menulis berita pertama Anda.
- Segala artikel dan media yang dimasukkan oleh admin akan langsung tersimpan di database Supabase Anda.

---

## 🚀 Fitur Lengkap Aplikasi

### 1. Database & Storage Supabase
- **Tabel `posts`**: Kolom `id`, `title`, `slug`, `content`, `excerpt`, `category`, `thumbnail_url`, `status` (`draft`/`published`), `published_at`, `reading_time`, `author_name`, `created_at`, `updated_at`.
- **Tabel `admin_users`**: Kolom `id`, `username`, `password_hash`, `role`, `created_at`.
- **Storage Bucket (`blog-media`)**: Menyimpan upload thumbnail dan media editor TipTap.

### 2. Rich Text Editor Tingkat Lanjut (Admin)
- Berbasis **TipTap Headless Editor**:
  - Formatting teks lengkap: Bold, Italic, Underline, Strikethrough, Heading (H1, H2, H3), Paragraph.
  - List & Kutipan: Bullet List, Numbered List, Blockquote beraksen amber, Code Block.
  - Text Alignment: Kiri, Tengah, Kanan, Justify.
  - Penyisipan Media: Upload langsung ke Supabase Storage, URL gambar eksternal, dan Embed Video YouTube responsif.
  - Penghitung kata (*word count*) dan karakter real-time.

### 3. Kemudahan Dashboard Admin
- **Auto Slug Generator**: Slug URL tergenerate secara dinamis dan real-time dari judul artikel yang diketik (`kebab-case`) dengan tombol toggle edit manual.
- **Post Status (Draft & Publish)**: Menyimpan tulisan sebagai Draft sebelum siap diterbitkan ke publik.
- **Drag-and-Drop Thumbnail Uploader**: Upload mudah ke Supabase Storage dengan live preview dan tombol ganti/hapus.
- **Admin Management Table**: Pencarian real-time, filter status (All/Published/Draft), statistik ringkas, tombol Edit, Delete dengan modal konfirmasi, serta Logout aman.

### 4. Halaman Publik
- Sesuai tata letak desain referensi:
  - Nuansa warna hangat *warm off-white/ivory* (`#FAF8F5`).
  - 3-Column Card Grid dengan thumbnail rapi, tag kategori, tombol "Read More ↗", dan estimasi waktu baca.
  - Integrated VIP Newsletter Card dengan formulir berlangganan.
  - Halaman detail artikel (`/blogs/[slug]`) dengan styling `.prose-editorial`, navigasi breadcrumbs, tombol bagikan (Salin Tautan, X/Twitter, LinkedIn), dan rekomendasi artikel.

---

## 🛠️ Panduan Menjalankan Proyek

### 1. Sinkronisasi Database Supabase
1. Buka [Dashboard Supabase](https://supabase.com/dashboard/project/zcliqmlgfcppudvpsinn/sql/new).
2. Salin isi file [`supabase/schema.sql`](file:///d:/Hafidz/PROGRAM/blogspot/supabase/schema.sql) lalu klik **Run**.
*(Skema ini otomatis membuat tabel `posts`, tabel `admin_users` lengkap dengan akun `adminblog`, dan bucket storage `blog-media`).*

### 2. Menjalankan Server Development Lokal
Server saat ini aktif berjalan di latar belakang:
```bash
npm run dev
```

### 3. Tautan Penting:
- **Halaman Utama Publik**: [http://localhost:3000/blogs](http://localhost:3000/blogs)
- **Login Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Dashboard Artikel Admin**: [http://localhost:3000/admin/posts](http://localhost:3000/admin/posts) *(memerlukan login)*
- **Tulis Artikel Baru**: [http://localhost:3000/admin/posts/create](http://localhost:3000/admin/posts/create) *(memerlukan login)*
