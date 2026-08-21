## Burndown Chart — Fungsi & Penjelasan

### Apa Itu Burndown Chart?

Burndown Chart adalah **grafik visual yang memantau progres penyelesaian task terhadap waktu**. Grafik ini membandingkan **kecepatan aktual** tim menyelesaikan task dengan **kecepatan ideal** yang diharapkan.

---

### Cara Kerja

```
Garis Ideal (─ ─ ─)   = Target penurunan task per hari (linear dari total → 0)
Garis Aktual (━━━━)   = Realita sisa task yang belum selesai tiap hari
Area Fill (▒▒▒▒▒)     = Visualisasi gap antara actual dan baseline
```

| Komponen | Rumus | Keterangan |
|---|---|---|
| **Ideal Line** | `totalTasks - (totalTasks / jumlahHari) × (hariKe-N)` | Garis lurus menurun dari total task ke 0 |
| **Actual Line** | Sisa task yang belum completed pada tanggal tersebut | Turun hanya ketika task di-mark complete |
| **Status Badge** | Selisih actual vs ideal di titik terakhir | Menentukan ahead/on-track/behind |

---

### 3 Status Otomatis

| Status | Kondisi | Artinya |
|---|---|---|
| 📈 **Lebih Cepat** | Actual < Ideal (>10%) | Tim menyelesaikan task lebih cepat dari target |
| ➖ **Sesuai Jadwal** | Actual ≈ Ideal (±10%) | Progres sesuai rencana |
| 📉 **Terlambat** | Actual > Ideal (>10%) | Task menumpuk, perlu perhatian |

---

### Fitur Interaktif

| Fitur | Fungsi |
|---|---|
| **Hover titik** | Tooltip detail: tanggal, actual, ideal, completed hari itu, selisih |
| **Vertical guide** | Garis bantu vertikal saat hover untuk membaca nilai |
| **Responsive tooltip** | Posisi adaptif (kiri/kanan) agar tidak keluar viewport |
| **Legend** | Keterangan visual: garis ideal, garis actual, area sisa |

---

### Siapa yang Bisa Melihat?

| Role | Akses |
|---|---|
| **Admin** | ✅ Ya — melihat semua task dengan deadline |
| Manager | ❌ Tidak |
| Member | ❌ Tidak |

> Hanya Admin yang memiliki perspektif menyeluruh untuk menilai apakah **seluruh organisasi** on-track atau tidak.

---

### Kapan Berguna?

| Skenario | Cara Baca |
|---|---|
| **Sprint planning review** | Cek apakah estimasi deadline realistis |
| **Daily standup** | Lihat tren: actual line naik = masalah, turun = bagus |
| **Client reporting** | Tunjukkan progress visual kepada stakeholder |
| **Early warning** | Jika actual line konsisten di atas ideal → segera eskalasi |
| **Post-mortem** | Bandingkan chart sprint lalu vs sekarang untuk improvement |

---

### Contoh Interpretasi

```
Contoh 1: On Track ✅
  Ideal:  20 → 15 → 10 → 5 → 0
  Actual: 20 → 16 → 11 → 6 → 2
  → Selisih kecil, tim bekerja sesuai rencana

Contoh 2: Behind Schedule ⚠️
  Ideal:  20 → 15 → 10 → 5 → 0
  Actual: 20 → 19 → 17 → 14 → 10
  → Task menumpuk, perlu tambah resource atau kurangi scope

Contoh 3: Ahead of Schedule 🎉
  Ideal:  20 → 15 → 10 → 5 → 0
  Actual: 20 → 14 → 8 → 3 → 0
  → Tim lebih produktif, bisa ambil task tambahan
```

---

### Data Source

Chart mengambil data dari **semua task yang memiliki `dueDate`**:
- Mengelompokkan task berdasarkan tanggal deadline
- Menghitung task completed per tanggal
- Menghitung remaining task secara kumulatif
- Membutuhkan **minimal 2 tanggal berbeda** agar chart bisa dirender

> ⚠️ Task tanpa due date **tidak dihitung** dalam Burndown Chart. Pastikan assign due date pada task agar tracking akurat.