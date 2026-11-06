// src/apk-owner/FinanceScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  Platform,
  TextInput 
} from 'react-native';
import { formatRupiah } from '../utils/currencyFormatter';
import { supabase } from '../config/supabaseClient'; 

export default function FinanceScreen() {
  const [transaksi, setTransaksi] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]); 
  const [loading, setLoading] = useState(true);

  // STATE FILTER BULAN DAN TAHUN (Default ke bulan & tahun berjalan saat ini)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1 - 12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State untuk Form Input Pengeluaran Baru
  const [inputUang, setInputUang] = useState('');
  const [inputKeterangan, setInputKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Array Nama Bulan Bahasa Indonesia untuk Label UI & CSV
  const namaBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // 1. AMBIL DATA BERDASARKAN RENTANG BULAN DI DATABASE 
  const fetchDataKeuangan = async () => {
    try {
      // Menghitung batas awal tanggal bulan terpilih (format ISO String untuk Supabase)
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01T00:00:00Z`;
      
      // Mengambil hari terakhir dari bulan terpilih secara akurat
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}T23:59:59Z`;

      // Tarik data pemasukan pada rentang bulan aktif
      const { data: dataPemasukan, error: errorPemasukan } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (errorPemasukan) throw errorPemasukan;

      // Tarik data pengeluaran pada rentang bulan aktif
      const { data: dataPengeluaran, error: errorPengeluaran } = await supabase
        .from('expenses')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (errorPengeluaran) throw errorPengeluaran;
      
      setTransaksi(dataPemasukan || []);
      setPengeluaran(dataPengeluaran || []);
    } catch (error) {
      console.error("❌ Eror Cloud Supabase Finance:", error.message);
      if (loading) {
        Alert.alert("Gagal Memuat", "Gagal menyelaraskan pembukuan dengan cloud Supabase.");
      }
    } finally {
      setLoading(false);
    }
  };

  // RE-FETCH OTOMATIS: Berjalan setiap kali mengubah bulan atau tahun
  useEffect(() => {
    fetchDataKeuangan();

    const intervalId = setInterval(() => {
      fetchDataKeuangan();
    }, 4000); 

    return () => clearInterval(intervalId);
  }, [selectedMonth, selectedYear]);

  // 2. FUNGSI NAVIGASI PEMILIH BULAN 
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
    setLoading(true);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
    setLoading(true);
  };

  // 3. FUNGSI INPUT PENGELUARAN BARU 
  const handleTambahPengeluaran = async () => {
    if (!inputUang || !inputKeterangan) {
      Alert.alert("Data Belum Lengkap", "anda harus mengisi nominal uang dan keterangannya ya.");
      return;
    }

    const nominal = parseInt(inputUang.replace(/[^0-9]/g, ''), 10);
    if (isNaN(nominal) || nominal <= 0) {
      Alert.alert("Input Salah", "Masukkan nominal angka pengeluaran yang valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Menyimpan data pengeluaran ke tabel 'expenses'
      const { error } = await supabase
        .from('expenses')
        .insert([{ amount: nominal, description: inputKeterangan }]);

      if (error) throw error;

      Alert.alert("Berhasil", "Pengeluaran belanja berhasil dimasukkan ke buku kas cloud.");
      setInputUang('');
      setInputKeterangan('');
      fetchDataKeuangan(); 
    } catch (error) {
      Alert.alert("Gagal Menyimpan", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. LOGIKA AGREGASI MATEMATIKA BULANAN
  const totalOmzet = transaksi.reduce((sum, item) => sum + (item.total_price || 0), 0);
  const totalTunai = transaksi.filter(item => item.payment_method === 'Cash').reduce((sum, item) => sum + (item.amount_paid || 0), 0);
  const totalTransfer = transaksi.filter(item => item.payment_method === 'Transfer').reduce((sum, item) => sum + (item.amount_paid || 0), 0);
  
  const totalUangDiterima = totalTunai + totalTransfer; 
  const totalPengeluaran = pengeluaran.reduce((sum, item) => sum + (item.amount || 0), 0); 
  const saldoKasBersih = totalUangDiterima - totalPengeluaran; // Keuntungan Bersih Riil Bulan Ini

  const totalPiutang = transaksi.reduce((sum, item) => sum + (item.sisa_tagihan || 0), 0);
  const totalProduksi = transaksi.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // TREN LONJAKAN PASAR MINGGUAN PADA BULAN TERPILIH
  const omzetWeekend = transaksi.filter(item => item.day_type === 'Weekend').reduce((sum, item) => sum + (item.total_price || 0), 0);
  const omzetWeekdays = transaksi.filter(item => item.day_type === 'Weekdays' || !item.day_type).reduce((sum, item) => sum + (item.total_price || 0), 0);

  const maxOmzetTren = Math.max(omzetWeekend, omzetWeekdays, 1);
  const barWeekendWidth = (omzetWeekend / maxOmzetTren) * 100;
  const barWeekdaysWidth = (omzetWeekdays / maxOmzetTren) * 100;

  // 5. FUNGSI UNDUH LAPORAN CSV BULANAN (TERKONSOLIDASI)
  const handleDownloadCSV = () => {
    if (transaksi.length === 0 && pengeluaran.length === 0) {
      Alert.alert("Kosong", `Belum ada riwayat keuangan pada bulan ${namaBulan[selectedMonth - 1]} ${selectedYear}`);
      return;
    }

    const fileLabel = `${namaBulan[selectedMonth - 1]}_${selectedYear}`;

    // === SEGMEN 1: DATA PEMASUKAN ===
    let csvContent = `=== LAPORAN PEMASUKAN FIXBAKERY - PERIODE ${fileLabel.toUpperCase()} ===\n`;
    csvContent += "ID Transaksi,Tanggal Ambil,Nama Pemesan,Roti Yang Dipesan,Jumlah Kuantitas (Pcs),Total Biaya,Media Transaksi,Status Pembayaran,Tipe Hari\n";
    
    transaksi.forEach((item) => {
      const customerSanitized = item.customer_name ? item.customer_name.replace(/"/g, '""') : '';
      let rincianMenuTeks = '';
      if (item.cart) {
        try {
          const listRoti = typeof item.cart === 'string' ? JSON.parse(item.cart) : item.cart;
          rincianMenuTeks = listRoti.map(r => `${r.name} (${r.qty} pcs)`).join(' | ');
        } catch (e) { rincianMenuTeks = 'Gagal memproses rincian'; }
      } else { rincianMenuTeks = 'Pesanan Lama'; }

      const statusPembayaran = item.payment_status || 'Belum Lunas';
      csvContent += `"${item.id}","${item.pickup_date || ''}","${customerSanitized}","${rincianMenuTeks}",${item.quantity || 0},${item.total_price || 0},"${item.payment_method || 'Cash'}","${statusPembayaran}","${item.day_type || 'Weekdays'}"\n`;
    });

    // === SEGMEN 2: DATA PENGELUARAN ===
    csvContent += `\n=== LAPORAN PENGELUARAN OPERASIONAL - PERIODE ${fileLabel.toUpperCase()} ===\n`;
    csvContent += "ID Pengeluaran,Tanggal Catat,Keterangan Belanja,Nominal Pengeluaran (Rp)\n";

    pengeluaran.forEach((item) => {
      const descSanitized = item.description ? item.description.replace(/"/g, '""') : '';
      const tanggalCatat = item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-';
      csvContent += `"${item.id}","${tanggalCatat}","${descSanitized}",${item.amount || 0}\n`;
    });

    // === SEGMEN 3: REKAPITULASI AUDIT ===
    csvContent += `\n=== RINGKASAN REKAPITULASI KAS BULANAN (${fileLabel.toUpperCase()}) ===\n`;
    csvContent += `Total Real Arus Kas Masuk,Rp ${totalUangDiterima}\n`;
    csvContent += `Total Pengeluaran Belanja Bahan,Rp ${totalPengeluaran}\n`;
    csvContent += `SISA SALDO UNTUNG BERSIH (KAS REAL),Rp ${saldoKasBersih}\n`;
    csvContent += `Sisa Total Piutang Belum Lunas,Rp ${totalPiutang}\n`;

    try {
      const fileName = `Laporan_FixBakery_${fileLabel}.csv`;

      if (Platform.OS === 'web') {
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert("Ekspor Berhasil 🎉", `Berkas pembukuan bulan ${fileLabel} (.CSV) sukses diunduh!`);
      } else {
        alert(`📊 CSV Bulan ${fileLabel} Berhasil Disusun di Konsol!`);
        console.log(csvContent);
      }
    } catch (err) {
      Alert.alert("Eror Ekspor", "Gagal menyusun dokumen spreadsheet bulanan.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4A2E1B" />
        <Text style={styles.loadingText}>Menyaring Laporan Kas Bulanan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* ================= SELECTOR BULANAN RAMAH LANSIA ================= */}
      <View style={styles.monthSelectorCard}>
        <TouchableOpacity style={styles.selectorArrowBtn} onPress={handlePrevMonth}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>
        
        <View style={styles.centerDateLabel}>
          <Text style={styles.monthLabelText}>{namaBulan[selectedMonth - 1]}</Text>
          <Text style={styles.yearLabelText}>{selectedYear}</Text>
        </View>

        <TouchableOpacity style={styles.selectorArrowBtn} onPress={handleNextMonth}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>
      {/* ======================================================================= */}

      {/* HEADER RINGKASAN */}
      <View style={styles.headerDashboard}>
        <Text style={styles.headerTitle}>Strategic Panel Analytics</Text>
        <Text style={styles.headerSubtitle}>
          Laporan Kas Terpilih: {namaBulan[selectedMonth - 1]} {selectedYear}
        </Text>
      </View>

      {/* RINGKASAN UTAMA DASHBOARD */}
      <Text style={styles.sectionTitle}>Ringkasan Pembukuan Kas Bersih</Text>
      
      <View style={[styles.mainCard, { backgroundColor: '#1B5E20' }]}>
        <Text style={styles.cardLabel}>UNTUNG BERSIH BULAN INI (SISA SALDO KAS)</Text>
        <Text style={styles.cardValue}>{formatRupiah(saldoKasBersih)}</Text>
        <Text style={styles.cardTrend}>Uang Masuk - Pengeluaran Belanja Bulan Ini</Text>
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.miniDashboardCard, { backgroundColor: '#2E7D32' }]}>
          <Text style={styles.miniLabel}>📥 UANG MASUK</Text>
          <Text style={styles.miniValue}>{formatRupiah(totalUangDiterima)}</Text>
          <Text style={styles.miniSub}>Tunai & Transfer</Text>
        </View>

        <View style={[styles.miniDashboardCard, { backgroundColor: '#A04000', marginRight: 0 }]}>
          <Text style={styles.miniLabel}>📤 TOTAL BELANJA</Text>
          <Text style={styles.miniValue}>{formatRupiah(totalPengeluaran)}</Text>
          <Text style={styles.miniSub}>Operasional Toko</Text>
        </View>
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.miniDashboardCard, { backgroundColor: '#D32F2F' }]}>
          <Text style={styles.miniLabel}>⚠️ TOTAL UTANG</Text>
          <Text style={styles.miniValue}>{formatRupiah(totalPiutang)}</Text>
          <Text style={styles.miniSub}>Nota Belum Lunas</Text>
        </View>

        <View style={[styles.miniDashboardCard, { backgroundColor: '#4A2E1B', marginRight: 0 }]}>
          <Text style={styles.miniLabel}>🧾 OMZET NOTA KOTOR</Text>
          <Text style={styles.miniValue}>{formatRupiah(totalOmzet)}</Text>
          <Text style={styles.miniSub}>Akumulasi Semua Nota</Text>
        </View>
      </View>

      {/* FORM CATAT PENGELUARAN */}
      <Text style={styles.sectionTitle}>Catat Belanja Bahan ({namaBulan[selectedMonth - 1]})</Text>
      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Nominal Uang Keluar (Rp)</Text>
        <TextInput 
          style={styles.textInput}
          placeholder="Contoh: 150000"
          placeholderTextColor="#8D6E63"
          keyboardType="numeric"
          value={inputUang}
          onChangeText={setInputUang}
        />

        <Text style={styles.inputLabel}>Keterangan Pembelian / Belanja</Text>
        <TextInput 
          style={styles.textInput}
          placeholder="Contoh: Beli mentega kiloan"
          placeholderTextColor="#8D6E63"
          value={inputKeterangan}
          onChangeText={setInputKeterangan}
        />

        <TouchableOpacity 
          style={[styles.btnSimpan, isSubmitting && { opacity: 0.6 }]} 
          onPress={handleTambahPengeluaran}
          disabled={isSubmitting}
        >
          <Text style={styles.btnSimpanText}>
            {isSubmitting ? "MENYIMPAN KE CLOUD..." : "📌 SIMPAN KE PEMBUKUAN"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DETAIL ALIRAN MASUK */}
      <Text style={styles.sectionTitle}>Metode Arus Uang Masuk</Text>
      <View style={styles.rowContainer}>
        <View style={[styles.subCard, { borderLeftColor: '#4A2E1B' }]}>
          <Text style={styles.subLabel}>Tunai</Text>
          <Text style={styles.subValue}>{formatRupiah(totalTunai)}</Text>
        </View>
        <View style={[styles.subCard, { borderLeftColor: '#2E7D32', marginRight: 0 }]}>
          <Text style={styles.subLabel}>Transfer</Text>
          <Text style={styles.subValue}>{formatRupiah(totalTransfer)}</Text>
        </View>
      </View>

      {/* GRAFIK ANALISIS DATA MINGGUAN */}
      <Text style={styles.sectionTitle}>Aktivitas Lonjakan Pasar (Weekend Surge)</Text>
      <View style={styles.chartBox}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Weekend</Text>
          <View style={styles.barOuter}>
            <View style={[styles.barInner, { width: `${barWeekendWidth}%`, backgroundColor: '#2E7D32' }]} />
          </View>
          <Text style={styles.barValueText}>{formatRupiah(omzetWeekend)}</Text>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Weekdays</Text>
          <View style={styles.barOuter}>
            <View style={[styles.barInner, { width: `${barWeekdaysWidth}%`, backgroundColor: '#4A2E1B' }]} />
          </View>
          <Text style={styles.barValueText}>{formatRupiah(omzetWeekdays)}</Text>
        </View>
      </View>

      {/* TOMBOL UNDUH LAPORAN KONSOLIDASI */}
      <TouchableOpacity style={styles.btnCsv} onPress={handleDownloadCSV}>
        <Text style={styles.btnCsvText}>
          📥 UNDUH CSV ({namaBulan[selectedMonth - 1].toUpperCase()} {selectedYear})
        </Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// STYLESHEET
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', padding: 16 },
  loadingText: { marginTop: 10, color: '#4A2E1B', fontSize: 13, fontWeight: '700' },
  
  // Gaya Khusus Card Selector Bulan (Kontras Cokelat-Krem Tinggi)
  monthSelectorCard: {
    flexDirection: 'row',
    backgroundColor: '#4A2E1B',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectorArrowBtn: {
    backgroundColor: '#FFF8E1',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: { color: '#4A2E1B', fontSize: 16, fontWeight: 'bold' },
  centerDateLabel: { alignItems: 'center' },
  monthLabelText: { color: '#FFF8E1', fontSize: 18, fontWeight: 'bold' },
  yearLabelText: { color: '#FFF8E1', fontSize: 12, opacity: 0.8 },

  headerDashboard: { marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A2E1B' },
  headerSubtitle: { fontSize: 12, color: '#8D6E63', marginTop: 2, fontStyle: 'italic' },
  
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#4A2E1B', marginVertical: 12 },
  
  mainCard: { 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: '#4A2E1B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(74, 46, 27, 0.06)' }
    })
  },
  cardLabel: { color: '#FFF8E1', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  cardValue: { color: '#FFF8E1', fontSize: 26, fontWeight: 'bold', marginTop: 4 },
  cardTrend: { color: '#FFF8E1', fontSize: 11, marginTop: 8, fontStyle: 'italic', opacity: 0.85 },
  
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  
  miniDashboardCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#4A2E1B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(74, 46, 27, 0.06)' }
    })
  },
  miniLabel: { color: '#FFF8E1', fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  miniValue: { color: '#FFF8E1', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  miniSub: { color: '#FFF8E1', fontSize: 10, fontStyle: 'italic', marginTop: 2, opacity: 0.8 },

  formCard: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFF0E0',
    marginBottom: 8
  },
  inputLabel: { color: '#4A2E1B', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFF0E0',
    borderRadius: 8,
    padding: 10,
    color: '#4A2E1B',
    fontSize: 14,
    marginBottom: 12
  },
  btnSimpan: { backgroundColor: '#4A2E1B', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSimpanText: { color: '#FFF8E1', fontWeight: 'bold', fontSize: 12 },

  subCard: { 
    flex: 1, 
    backgroundColor: '#FFF8E1', 
    padding: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#FFF0E0', 
    borderLeftWidth: 5, 
    marginRight: 8 
  },
  subLabel: { color: '#8D6E63', fontSize: 12, fontWeight: '600' },
  subValue: { color: '#4A2E1B', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  
  chartBox: { backgroundColor: '#FFF8E1', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FFF0E0', marginBottom: 20 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { width: 65, fontSize: 12, color: '#4A2E1B', fontWeight: 'bold' },
  barOuter: { flex: 1, height: 14, backgroundColor: '#FFF0E0', borderRadius: 7, overflow: 'hidden', marginRight: 8 },
  barInner: { height: '100%', borderRadius: 7 },
  barValueText: { fontSize: 11, color: '#4A2E1B', fontWeight: '600', width: 90, textAlign: 'right' },
  
  btnCsv: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnCsvText: { color: '#FFF8E1', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 }
});