// src/apk-owner/OrderTrackingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { theme } from '../styles/theme';
import { formatRupiah } from '../utils/currencyFormatter';
import StatusBadge from '../components/StatusBadge'; 
import { supabase } from '../config/supabaseClient'; 

export default function OrderTrackingScreen() {
  const [orders, setOrders] = useState([]);
  const [cancelingOrderId, setCancelingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions') 
        .select('*')
        .neq('status', 'Selesai') 
        .order('pickup_date', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) { 
      console.error("Gagal mengambil data transaksi dapur:", err.message); 
    }
  };

  useEffect(() => { 
    fetchOrders(); 
    const ownerSubscription = supabase
      .channel('dapur-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ownerSubscription);
    };
  }, []);

  // ✅ PERBAIKAN: Mengganti 'remaining_bill' dengan 'sisa_tagihan'
  const handleCompleteOrder = async (id) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'Selesai',
          sisa_tagihan: 0, 
          payment_status: 'Lunas' 
        })
        .eq('id', id);
      
      if (error) throw error;

      if (Platform.OS === 'web') alert("Pesanan telah selesai diserahkan ke pelanggan! 🎉");
      else Alert.alert("Berhasil 🎉", "Pesanan telah selesai diserahkan ke pelanggan!");
      
      fetchOrders(); 
    } catch (err) { 
      console.error("Gagal menyelesaikan pesanan:", err.message); 
      Alert.alert("Gagal", err.message);
    }
  };

  const executeCancelOrder = async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      Alert.alert("Berhasil", "Pesanan berhasil dibatalkan.");
      setCancelingOrderId(null);
      fetchOrders();
    } catch (err) {
      console.error("Gagal cancel order:", err.message);
      setCancelingOrderId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitleText}>Daftar Pesanan Aktif Dapur</Text>
      </View>

      <ScrollView style={{ flex: 1, marginTop: 10 }} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada pesanan masuk saat ini...</Text>
          </View>
        ) : (
          orders.map((item) => {
            const isConfirming = cancelingOrderId === item.id;
            let rincianRoti = item.cart ? (typeof item.cart === 'string' ? JSON.parse(item.cart) : item.cart) : [];

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.custName}>{item.customer_name}</Text>
                    <Text style={styles.phoneText}>{item.phone_number || 'Tidak ada No. WA'}</Text>
                  </View>
                  <StatusBadge status={item.payment_status === 'Lunas' ? 'Lunas' : 'DP/Belum Lunas'} />
                </View>
                
                <View style={styles.dividerDashed} />

                <View style={{ marginVertical: 4 }}>
                  <Text style={styles.detailText}>Tanggal Diperlukan: <Text style={styles.dateHighlight}>{item.pickup_date || '-'}</Text></Text>
                  <Text style={styles.detailText}>Distribusi: <Text style={styles.deliveryHighlight}>{item.delivery_type || 'Diambil'}</Text></Text>
                  {item.delivery_type === 'Diantar' && item.delivery_address && (
                    <View style={styles.addressBox}><Text style={styles.addressText}>Alamat: {item.delivery_address}</Text></View>
                  )}
                </View>

                <View style={styles.kitchenNoteArea}>
                  <Text style={styles.kitchenNoteTitle}>RINCIAN PRODUKSI OVEN:</Text>
                  {rincianRoti.length > 0 ? rincianRoti.map((roti, idx) => (
                    <View key={roti.id || idx} style={styles.rotiRow}>
                      <Text style={styles.rotiItemName}>🥖 {roti.name}</Text>
                      <Text style={styles.rotiItemQty}>x{roti.qty} pcs</Text>
                    </View>
                  )) : <Text style={styles.rotiItemNameUnknown}>⚠️ Rincian produk tidak terekam</Text>}
                  <View style={styles.dividerSolidLight} />
                  <View style={styles.totalPcsRow}>
                    <Text style={styles.totalPcsLabel}>Total Produksi:</Text>
                    <Text style={styles.qtyHighlight}>{item.quantity || 0} pcs</Text>
                  </View>
                </View>

                {/* ✅ PERBAIKAN: Menggunakan sisa_tagihan */}
                {item.payment_status !== 'Lunas' && (
                  <Text style={styles.detailTextSub}>
                    Sisa Tagihan Keuangan: {formatRupiah(item.sisa_tagihan || 0)}
                  </Text>
                )}

                <View style={styles.dividerDashed} />
                <Text style={styles.price}>Total Tagihan: {formatRupiah(item.total_price)}</Text>
                
                <TouchableOpacity style={styles.btnSuccess} onPress={() => handleCompleteOrder(item.id)}>
                  <Text style={styles.btnSuccessText}>Pesanan Selesai & Siap</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btnCancel, isConfirming && styles.btnCancelConfirm]} onPress={() => {
                  if (isConfirming) executeCancelOrder(item.id);
                  else {
                    setCancelingOrderId(item.id);
                    setTimeout(() => setCancelingOrderId(null), 5000);
                  }
                }}>
                  <Text style={[styles.btnCancelText, isConfirming && styles.btnCancelConfirmText]}>
                    {isConfirming ? '⚠️ Yakin? Klik Sekali Lagi' : '❌ Batalkan Pesanan'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// =========================================================================
// STYLESHEET (FIX COKELAT, KREM, ANTI ABU-ABU, MODERN BOX SHADOW WEB)
// =========================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background || '#FDFBF7', padding: 16 },
  
  headerTitleContainer: { 
    backgroundColor: '#4A2E1B', 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 8 
  },
  headerTitleText: { 
    color: '#FFF8E1', 
    fontWeight: 'bold', 
    fontSize: 16 
  },

  card: { 
    backgroundColor: '#FFF8E1', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#FFF0E0',
    ...Platform.select({
      ios: { shadowColor: '#4A2E1B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(74, 46, 27, 0.06)' }
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  custName: { fontSize: 16, color: '#4A2E1B', fontWeight: 'bold' },
  phoneText: { fontSize: 12, color: '#8D6E63', marginTop: 1 },
  
  dividerDashed: { height: 1, borderWidth: 0.5, borderColor: '#FFF0E0', borderStyle: 'dashed', marginVertical: 8 },
  dividerSolidLight: { height: 1, backgroundColor: '#FFF0E0', marginVertical: 6 },

  detailText: { fontSize: 13, color: '#4A2E1B', fontWeight: '500', marginBottom: 3 },
  dateHighlight: { fontWeight: 'bold', color: '#D32F2F' },
  deliveryHighlight: { fontWeight: 'bold', color: '#2E7D32' },
  
  addressBox: { backgroundColor: '#FDFBF7', padding: 6, borderRadius: 6, marginTop: 2, marginBottom: 4, borderWidth: 1, borderColor: '#FFF0E0' },
  addressText: { fontSize: 12, color: '#8D6E63', fontStyle: 'italic' },
  
  // STYLING BARU AREA RINCIAN DAPUR
  kitchenNoteArea: { backgroundColor: '#FDFBF7', borderRadius: 8, padding: 10, marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: '#FFF0E0' },
  kitchenNoteTitle: { fontSize: 11, fontWeight: 'bold', color: '#8D6E63', marginBottom: 6, letterSpacing: 0.5 },
  rotiRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  rotiItemName: { fontSize: 13, color: '#4A2E1B', fontWeight: '600' },
  rotiItemNameUnknown: { fontSize: 12, color: '#A1887F', fontStyle: 'italic' },
  rotiItemQty: { fontSize: 13, fontWeight: 'bold', color: '#4A2E1B' },
  totalPcsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 },
  totalPcsLabel: { fontSize: 12, color: '#4A2E1B', fontWeight: '700' },
  qtyHighlight: { fontWeight: 'bold', fontSize: 14, color: '#4A2E1B' },
  
  detailTextSub: { fontSize: 12, color: '#D32F2F', fontWeight: '600', marginTop: 4 },
  price: { fontSize: 14, color: '#4A2E1B', fontWeight: 'bold', marginTop: 4 },
  
  btnSuccess: { backgroundColor: '#2E7D32', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  btnSuccessText: { color: '#FFF8E1', fontSize: 13, fontWeight: 'bold' },
  
  emptyContainer: { alignItems: 'center', marginTop: 40, backgroundColor: '#FFF8E1', padding: 20, borderRadius: 8 },
  emptyText: { color: '#8D6E63', fontSize: 13 },
  
  btnCancel: { backgroundColor: '#FFF0E0', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#FFF0E0' },
  btnCancelText: { color: '#D32F2F', fontSize: 12, fontWeight: 'bold' },
  btnCancelConfirm: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  btnCancelConfirmText: { color: '#FDFBF7' }
});