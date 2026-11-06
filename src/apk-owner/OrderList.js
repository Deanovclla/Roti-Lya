import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabaseClient';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function OrderList() {
  const [transactions, setTransactions] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Semua');

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);

      let productStats = {};
      data.forEach((tx) => {
        if (tx.cart && Array.isArray(tx.cart)) {
          tx.cart.forEach((item) => {
            if (!productStats[item.id]) productStats[item.id] = { name: item.name, sold: 0, revenue: 0 };
            productStats[item.id].sold += item.qty;
            productStats[item.id].revenue += (item.qty * item.price);
          });
        }
      });
      const sorted = Object.values(productStats).sort((a, b) => b.sold - a.sold).slice(0, 5);
      setBestSellers(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLunas = async (item) => {
    const proses = async () => {
      const { error } = await supabase.from('transactions')
        .update({ payment_status: 'Lunas', sisa_tagihan: 0, amount_paid: item.total_price })
        .eq('id', item.id);
      if (error) Alert.alert("Eror", error.message);
      else fetchData();
    };
    Alert.alert("Konfirmasi", "Lunasi tagihan ini?", [{text: "Batal"}, {text: "Ya, Lunasi", onPress: proses}]);
  };

  // FUNGSI CETAK MENGGUNAKAN POPUP WINDOW AGAR BERSIH & SPESIFIK
  const handleCetak = (item) => {
    const notaContent = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #000; }
            .container { max-width: 300px; margin: auto; }
            h2 { text-align: center; margin-bottom: 5px; }
            p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            td { padding: 5px 0; border-bottom: 1px dashed #ccc; }
            .total { font-weight: bold; font-size: 16px; text-align: right; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Roti Lya</h2>
            <p style="text-align: center;">Nota: #${String(item.id).substring(0, 5).toUpperCase()}</p>
            <hr />
            <p><strong>Pelanggan:</strong> ${item.customer_name}</p>
            <p><strong>Tanggal:</strong> ${item.pickup_date}</p>
            <table>
              ${(item.cart || []).map(i => `
                <tr>
                  <td>${i.name} (x${i.qty})</td>
                  <td style="text-align: right;">${formatRupiah(i.price * i.qty)}</td>
                </tr>
              `).join('')}
            </table>
            <div class="total">Total: ${formatRupiah(item.total_price)}</div>
          </div>
          <script>
            window.print();
            window.onafterprint = () => window.close();
          </script>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(notaContent);
    win.document.close();
  };

  const filteredData = activeTab === 'Tagihan' ? transactions.filter(t => t.payment_status !== 'Lunas') : transactions;
  const maxSold = bestSellers.length > 0 ? Math.max(...bestSellers.map(i => i.sold)) : 1;

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4A2E1B" /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Riwayat Transaksi</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'Semua' && styles.tabActive]} onPress={() => setActiveTab('Semua')}>
          <Text style={activeTab === 'Semua' ? styles.tabTextActive : styles.tabText}>Semua</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'Tagihan' && styles.tabActive]} onPress={() => setActiveTab('Tagihan')}>
          <Text style={activeTab === 'Tagihan' ? styles.tabTextActive : styles.tabText}>Tagihan</Text>
        </TouchableOpacity>
      </View>

      {filteredData.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.customerName}>{item.customer_name}</Text>
              <Text style={styles.dateText}>{item.pickup_date}</Text>
            </View>
            <View style={styles.actionGroup}>
              <TouchableOpacity style={styles.btnCetak} onPress={() => handleCetak(item)}><Text>🖨️</Text></TouchableOpacity>
              {item.payment_status !== 'Lunas' && (
                <TouchableOpacity style={styles.btnLunas} onPress={() => handleLunas(item)}><Text style={styles.btnLunasText}>✓ Lunas</Text></TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardBottom}>
            <Text style={styles.totalText}>Total: {formatRupiah(item.total_price)}</Text>
            {item.payment_status !== 'Lunas' && <Text style={styles.sisaText}>Sisa: {formatRupiah(item.sisa_tagihan)}</Text>}
          </View>
        </View>
      ))}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A2E1B', marginBottom: 16 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F0EBE1', borderRadius: 8, padding: 4, marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF', borderRadius: 6, elevation: 2 },
  tabText: { color: '#8D6E63' },
  tabTextActive: { color: '#4A2E1B', fontWeight: 'bold' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0EBE1' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  customerName: { fontSize: 16, fontWeight: 'bold' },
  dateText: { color: '#A1887F', fontSize: 12 },
  actionGroup: { flexDirection: 'row', gap: 8 },
  btnCetak: { padding: 8, backgroundColor: '#F0EBE1', borderRadius: 6 },
  btnLunas: { backgroundColor: '#00B14F', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  btnLunasText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F0EBE1', marginVertical: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  totalText: { fontWeight: 'bold' },
  sisaText: { fontWeight: 'bold', color: '#D32F2F' }
});