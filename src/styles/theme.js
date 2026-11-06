// src/styles/theme.js

export const theme = {
  colors: {
    background: "#FFF8F0", // Krem Terang (Background Utama)
    primary: "#C08552",    // Coklat Muda/Karamel (Aksen/Tombol Utama)
    secondary: "#8C5A3C",  // Coklat Sedang (Garis tepi/Brand)
    text: "#4B2E2B",       // Coklat Gelap (Teks Utama)
    white: "#FFFFFF",
    
    // Warna fungsional untuk StatusBadge & Keperluan Validasi
    success: "#4CAF50",    // Hijau (Lunas / Sukses)
    danger: "#F44336",     // Merah (Batal / Error)
    warning: "#FFC107",    // Kuning (Peringatan)
    
    // Tambahan warna netral untuk Input Border & State Disabled
    border: "#E5E7EB",     // Abu-abu sangat muda untuk border form input
    disabled: "#9CA3AF",   // Abu-abu medium untuk teks/tombol mati
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    round: 9999, // Menggunakan 9999 agar komponen bulat sempurna (seperti avatar/badge) lintas platform
  },
  typography: {
    header: { 
      fontSize: 24, 
      fontWeight: "bold" 
    },
    title: { 
      fontSize: 18, 
      fontWeight: "600" // Diubah menjadi string "600" agar tidak memicu error di React Native iOS/Android asli
    },
    body: { 
      fontSize: 14, 
      fontWeight: "normal" 
    },
    caption: { 
      fontSize: 12, 
      fontWeight: "300" // Diubah menjadi string "300" untuk konsistensi pembacaan engine UI
    },
  },
};