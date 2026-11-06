# 🥖 Roti Lya — Bakery POS & Kitchen Operations System

[![Expo](https://img.shields.io/badge/Expo-SDK%2055-000020.svg?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.83.6-61DAFB.svg?logo=react&logoColor=black)](https://reactnative.dev/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![Platforms](https://img.shields.io/badge/Platforms-Android%20%7C%20iOS%20%7C%20Web-blueviolet.svg)]()

Sistem manajemen operasional dan *Point of Sale* (POS) modern untuk toko roti **Roti Lya**, dirancang dengan arsitektur multi-platform (*responsive mobile & web desktop*) yang menghubungkan alur kasir, antrean produksi dapur, inventaris stok, serta laporan keuangan secara *real-time*.

---

## 🚀 Fitur Utama

- **🎛️ Kasir (POS & Order Entry)**: Pencatatan pesanan kilat, kalkulasi otomatis sisa tagihan/DP, modal pembayaran QRIS dinamis, dan pembuatan struk digital.
- **👨‍🍳 Dapur (Kitchen Tracker & Stepper)**: Pelacakan status produksi roti per tahapan (*Menunggu Antrean* ➔ *Sedang Dipanggang* ➔ *Siap Diambil* ➔ *Selesai*).
- **🧾 Riwayat & Struk Digital**: Riwayat transaksi komprehensif dengan integrasi cetak langsung dan *sharing* nota PDF via `expo-print` & `expo-sharing`.
- **⚙️ Katalog & Inventaris**: Pengelolaan menu roti, pembaruan harga, pelacakan kuantitas stok, dan unggah foto produk melalui `expo-image-picker`.
- **📊 Laporan Keuangan**: Ringkasan omzet, analisis arus kas masuk/piutang, serta agregasi pendapatan harian dan bulanan.

---

## 🛠️ Tech Stack & Arsitektur

| Komponen | Teknologi | Keterangan |
|:---|:---|:---|
| **Core Framework** | React Native `0.83.6` + React `19.2.0` | Antarmuka deklaratif performa tinggi |
| **Tooling & Runtime**| Expo SDK `~55.0.26` | Manajemen dependensi, live reload & asset bundler |
| **Backend & Database**| Supabase (`@supabase/supabase-js`) | PostgreSQL terkelola dengan sinkronisasi data real-time |
| **Local Storage** | `@react-native-async-storage/async-storage` | Caching token & status sesi lokal |
| **Navigation & Layout**| Responsive Shell + Drawer / Sidebar | Adaptif terhadap layar Mobile (<768px) dan Web/Tablet |
| **Printing & Sharing**| `expo-print`, `expo-sharing` | Render nota transaksi ke PDF & integrasi share sistem |

---

## 📂 Struktur Proyek

```text
roti-lya/
├── assets/                    # Ikon aplikasi, favicon, splash screen
├── src/
│   ├── apk-owner/             # Layar utama operasional toko
│   │   ├── ManualForm.js      # Layar kasir (input pesanan & kalkulasi)
│   │   ├── OrderTrackingScreen.js # Kanban dapur (kitchen stepper & status)
│   │   ├── OrderList.js       # Riwayat seluruh pesanan & cetak nota
│   │   ├── InventoryScreen.js # Kelola katalog menu & stok produk
│   │   └── FinanceScreen.js   # Analitik omzet & laporan kas
│   ├── components/            # Komponen UI modular
│   │   ├── Button.js          # Reusable button element
│   │   ├── DigitalReceipt.js  # Template tampilan nota transaksi
│   │   ├── ImagePickerCard.js # Selector & preview gambar menu
│   │   ├── OrderStepper.js    # Indikator tahapan produksi
│   │   ├── ProductCard.js     # Kartu tampilan roti
│   │   ├── QrisModal.js       # Dialog pembayaran QRIS
│   │   └── StatusBadge.js     # Indikator visual status pembayaran/pesanan
│   ├── config/
│   │   └── supabaseClient.js  # Inisialisasi klien Supabase
│   ├── services/              # Abstraksi data access layer (API Supabase)
│   │   ├── apiPesanan.js      # CRUD pesanan & kalkulasi sisa bayar
│   │   ├── apiProduk.js       # CRUD katalog & stok produk
│   │   └── apiLaporan.js      # Agregasi keuangan & metriks pendapatan
│   ├── styles/
│   │   └── theme.js           # Desain token warna palet Bakery (Brown/Warm)
│   └── utils/
│       └── currencyFormatter.js # Utilitas format Rupiah (IDR)
├── App.js                     # Root layout dengan adaptive responsive sidebar
├── app.json                   # Konfigurasi metadata aplikasi Expo & bundle ID
└── package.json               # Dependensi & script eksekusi
```

---

## ⚡ Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
- [Node.js](https://nodejs.org/) v18+ (disarankan LTS)
- Paket manajer `npm` atau `yarn`
- [Expo Go](https://expo.dev/go) pada perangkat fisik (Android/iOS) atau browser untuk Web.

### 2. Instalasi Dependensi
```bash
# Clone repositori
git clone https://github.com/Deanovclla/Roti-Lya.git
cd Roti-Lya

# Instal paket modul
npm install
```

### 3. Konfigurasi Backend (Supabase)
Kredensial database Supabase dikonfigurasi pada [`src/config/supabaseClient.js`](src/config/supabaseClient.js). Pastikan tabel `orders`, `products`, dan `payments` telah terkonfigurasi pada skema PostgreSQL Supabase Anda.

### 4. Eksekusi Development Server
```bash
# Jalankan Expo server
npm start

# Opsi langsung target platform:
npm run web       # Buka antarmuka Web di browser (localhost:8081)
npm run android   # Jalankan pada emulator / device Android
npm run ios       # Jalankan pada simulator iOS
```

---

## 📱 Build Produksi (EAS)

Aplikasi telah dikonfigurasi dengan Expo Application Services (EAS):
```bash
# Build APK Android mandiri
npx eas build -p android --profile preview
```

---

## 📎 Dokumentasi & Aset Lengkap
> Detail berkas APK dan dokumentasi aplikasi dapat diakses melalui Google Drive berikut:  
> 🔗 **[Folder Google Drive Roti Lya](https://drive.google.com/drive/folders/1iaKkvWVZMqqqK1fgiQ8q7_G-JnxrgchV)**

---
<p align="center">Dikembangkan untuk efisiensi operasional UMKM Roti Lya 🥖</p>
