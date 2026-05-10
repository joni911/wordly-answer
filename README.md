# Wordle Solver 🧩

Alat bantu interaktif untuk memecahkan puzzle **Wordle**. Masukkan kata yang sudah ditebak, tandai status setiap huruf, dan dapatkan rekomendasi kata terbaik untuk tebakan berikutnya.

🌐 **Coba langsung:** [wordly-answer.pages.dev](https://joni911.github.io/wordly-answer/) *(update URL setelah deploy)*

---

## ✨ Fitur

- **Template Cepat** — Tombol STAIR, LEMON, PUDGY langsung terisi dengan status default
- **Mode Flag** — Pilih mode (Benar / Salah Posisi / Salah) lalu klik tile untuk menerapkan
- **Rekomendasi Cerdas** — Dua kolom saran:
  - **Kata Terbaik** — Diurutkan berdasarkan skor (huruf yang sudah diketahui + huruf belum diuji)
  - **Kata Filter** — Kata yang paling efektif mengeliminasi kandidat tersisa
- **Statistik Huruf** — Visualisasi frekuensi huruf di sisa kandidat
- **Huruf yang Perlu Diuji** — Panduan huruf mana yang belum pernah dipakai
- **14.855 Kata** — Kamus lengkap 5 huruf bahasa Inggris
- **Offline Ready** — Kamus dimuat sekali, bekerja tanpa internet setelahnya

---

## 🚀 Cara Menggunakan

### Langkah 1: Buka Aplikasi
Buka [halaman web](https://joni911.github.io/wordly-answer/) atau jalankan lokal (lihat di bawah).

### Langkah 2: Masukkan Kata
- Ketik kata 5 huruf menggunakan keyboard fisik atau klik tombol huruf di keyboard virtual
- Atau klik tombol **STAIR**, **LEMON**, **PUDGY** untuk mengisi template cepat

### Langkah 3: Tandai Status Huruf
Pilih mode di bagian atas:
- 🟩 **Benar** — Huruf benar di posisi yang tepat
- 🟨 **Salah Posisi** — Huruf ada di kata target tapi di posisi berbeda
- ⬛ **Salah** — Huruf tidak ada di kata target

Klik tile untuk menerapkan mode yang dipilih.

### Langkah 4: Submit & Lihat Rekomendasi
Klik **Submit** → Program akan memfilter kata dan menampilkan rekomendasi di dua kolom:
- **Kata Terbaik** → Kata yang paling mungkin benar
- **Kata Filter** → Kata yang paling efektif menguji huruf baru

### Langkah 5: Ulangi
Pilih kata dari rekomendasi, isi ke baris berikutnya, tandai status, dan submit lagi sampai kata ditemukan!

---

## 🛠️ Jalankan Lokal

### Opsi 1: Python (Paling Mudah)
```bash
cd wordly
python -m http.server 8080
```
Buka `http://localhost:8080`

### Opsi 2: Node.js
```bash
npx serve .
```

### Opsi 3: Buka Langsung
Buka file `index.html` di browser *(perlu local server untuk load kamus JSON)*

---

## 📁 Struktur File

```
wordly/
├── index.html              # Halaman utama
├── css/
│   └── style.css           # Styling
├── js/
│   ├── dictionary.js       # Manajemen kamus (load dari JSON)
│   └── main.js             # Logika utama aplikasi
├── data/
│   └── words.json          # Kamus 14.855 kata 5 huruf
├── convert_to_json.py      # Script konversi TXT → JSON
├── wordle_solver.py        # Versi desktop (Python + Tkinter)
└── README.md               # Dokumentasi ini
```

---

## 🧠 Cara Kerja Algoritma

### Filter Kata
Setiap kali user submit dengan flag:
1. **Huruf Benar (🟩)** → Kata kandidat harus punya huruf itu di posisi yang sama
2. **Huruf Salah Posisi (🟨)** → Kata kandidat harus punya huruf itu tapi TIDAK di posisi itu
3. **Huruf Salah (⬛)** → Kata kandidat TIDAK boleh punya huruf itu (kecuali juga ditandai 🟩/🟨)

### Skor Rekomendasi
- Huruf yang sudah diketahui (🟩/🟨) = **+10 poin**
- Huruf yang belum diuji = **+1 poin**
- Diurutkan dari skor tertinggi

### Skor Eliminasi (Kata Filter)
- Menghitung berapa kata kandidat yang akan terpengaruh jika kata tersebut digunakan
- Memprioritaskan kata dengan huruf baru yang sering muncul di sisa kandidat

---

## 🤝 Kontribusi

Pull request dan issue sangat diterima! Beberapa ide kontribusi:
- Tambah template kata kustom
- Mode bahasa lain (Indonesia, dll)
- Animasi dan UX improvement
- Optimasi performa untuk kamus besar
- Dark mode

### Cara Kontribusi
1. Fork repository ini
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur X'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

---

## 📝 Lisensi

MIT License — Bebas digunakan, dimodifikasi, dan didistribusikan.

---

## 🙏 Terima Kasih

- Kamus kata dari [valid-wordle-words.txt](https://github.com/)
- Bootstrap 5 untuk styling
- Komunitas Wordle solver yang menginspirasi algoritma

---

**Dibuat dengan ❤️ untuk membantu para pemain Wordle**
