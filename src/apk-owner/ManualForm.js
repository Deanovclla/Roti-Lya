// src/apk-owner/ManualForm.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../styles/theme'; // Pastikan path ini benar di proyek Anda
import { formatRupiah } from '../utils/currencyFormatter'; // Pastikan path ini benar di proyek Anda
import { supabase } from '../config/supabaseClient'; // Pastikan path ini benar di proyek Anda

// =========================================================================
// SUB-KOMPONEN 1: PRODUCT CARD (Etalase Roti - Tema Cokelat & Krem)
// =========================================================================
function ProductCard({ product, onAdd }) {
  return (
    <TouchableOpacity style={styles.prodCard} onPress={() => onAdd(product)} activeOpacity={0.7}>
      <View style={styles.prodInfo}>
        <Text style={styles.prodName}>{product.name}</Text>
        <Text style={styles.prodCategory}>{product.category || 'Varian Roti'}</Text>
        <Text style={styles.prodPrice}>{formatRupiah(product.price)}</Text>
      </View>
      <View style={styles.addBadge}>
        <Text style={styles.addBadgeText}>+ Tambah</Text>
      </View>
    </TouchableOpacity>
  );
}

// =========================================================================
// SUB-KOMPONEN 2: CART ITEM (Baris Nota Belanja - Kontras Tinggi)
// =========================================================================
function CartItem({ item, onIncrease, onDecrease, onRemove, onSetQty }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(item.qty));

  const handleBlur = () => {
    const num = parseInt(inputVal, 10);
    if (!isNaN(num) && num > 0) {
      onSetQty(item.id, num);
    } else {
      setInputVal(String(item.qty));
    }
    setEditing(false);
  };

  return (
    <View style={styles.cartItemRow}>
      <View style={styles.cartMainInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPriceSum}>
          {formatRupiah(item.price)} × {item.qty} = <Text style={styles.cartItemTotalBold}>{formatRupiah(item.price * item.qty)}</Text>
        </Text>
      </View>

      <View style={styles.cartControlGroup}>
        <TouchableOpacity style={styles.cartActionBtn} onPress={() => onDecrease(item.id)}>
          <Text style={styles.cartActionText}>-</Text>
        </TouchableOpacity>

        {editing ? (
          <TextInput
            keyboardType="numeric"
            value={inputVal}
            onChangeText={setInputVal}
            onBlur={handleBlur}
            onSubmitEditing={handleBlur}
            autoFocus
            style={styles.cartInputQty}
          />
        ) : (
          <TouchableOpacity onPress={() => { setInputVal(String(item.qty)); setEditing(true); }} style={styles.cartQtyTap}>
            <Text style={styles.cartQtyText}>{item.qty}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cartActionBtnActive} onPress={() => onIncrease(item.id)}>
          <Text style={styles.cartActionTextActive}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartRemoveBtn} onPress={() => onRemove(item.id)}>
          <Text style={styles.cartRemoveText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =========================================================================
// HALAMAN UTAMA: MANUAL FORM
// =========================================================================
export default function ManualForm({ navigation }) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryType, setDeliveryType] = useState('Diambil'); 
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  const [pickupDate, setPickupDate] = useState(new Date()); 
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); 
  
  const [paymentType, setPaymentType] = useState('Lunas'); 
  const [customDP, setCustomDP] = useState('0'); 
  const [paymentMethod, setPaymentMethod] = useState('Cash'); 
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [savedOrderDetails, setSavedOrderDetails] = useState(null);

  const fetchActiveProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Gagal mengambil daftar roti:", error.message);
      if (Platform.OS === 'web') {
        alert("Eror Data ❌: Gagal mengambil katalog roti dari server.");
      } else {
        Alert.alert("Eror Data ❌", "Gagal mengambil katalog roti dari server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveProducts();
  }, []);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setPickupDate(selectedDate);
  };

  const handleAddToCard = (product) => {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].qty += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const handleIncreaseQty = (id) => {
    setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
  };

  const handleDecreaseQty = (id) => {
    setCart(cart.map(item => {
      if (item.id === id) return item.qty > 1 ? { ...item, qty: item.qty - 1 } : null;
      return item;
    }).filter(Boolean));
  };

  const handleRemoveItem = (id) => setCart(cart.filter(item => item.id !== id));
  const handleSetQtyManual = (id, newQty) => setCart(cart.map(item => item.id === id ? { ...item, qty: newQty } : item));
  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.qty * item.price), 0);
  
  const getDayType = () => {
    const currentDay = new Date().getDay(); 
    return (currentDay === 0 || currentDay === 6) ? 'Weekend' : 'Weekdays';
  };

  const handlePrintDirect = () => {
    if (!savedOrderDetails) return;
    const stringNota = `
=== NOTA DIGITAL Roti Lya ===
Pelanggan: ${savedOrderDetails.customer_name}
No. HP   : ${savedOrderDetails.phone_number || '-'}
------------------------------
Tanggal Ambil: ${savedOrderDetails.pickup_date}
Metode       : ${savedOrderDetails.delivery_type}
Total Pcs    : ${savedOrderDetails.quantity} pcs
Total Tagihan: ${formatRupiah(savedOrderDetails.total_price)}
Status       : ${savedOrderDetails.payment_status.toUpperCase()}
==============================
   Terima Kasih Banyak!
    `;
    
    if (Platform.OS === 'web') {
      alert(`🖨️ Mengirim ke Printer:\n${stringNota}`);
    } else {
      Alert.alert("Cetak Nota 🖨️", "Kirim nota ke printer Bluetooth atau bagikan teks ke WhatsApp?", [
        { text: "Kembali", style: "cancel" },
        { text: "Bagikan Teks Nota", onPress: () => console.log(stringNota) }
      ]);
    }
  };

  const handleCloseReceiptAndReset = () => {
    setShowReceiptModal(false);
    setCustomerName('');
    setPhoneNumber('');
    setDeliveryAddress('');
    setCart([]);
    setCustomDP('0');
    setPaymentType('Lunas');
    setPickupDate(new Date());

    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('OrderTracking'); 
    }
  };

  const handleSaveOrder = async () => {
    const showAlert = (title, message) => {
      if (Platform.OS === 'web') alert(`${title}: ${message}`);
      else Alert.alert(title, message);
    };

    if (!customerName.trim()) {
      showAlert("Peringatan ⚠️", "Mohon masukkan nama pembeli!");
      return;
    }

    const totalOrderPrice = calculateTotal();
    if (totalOrderPrice === 0) {
      showAlert("Peringatan ⚠️", "Pilih minimal 1 varian roti terlebih dahulu!");
      return;
    }

    if (deliveryType === 'Diantar' && !deliveryAddress.trim()) {
      showAlert("Peringatan ⚠️", "Mohon isi alamat pengantaran gratisnya!");
      return;
    }

    let paidAmount = totalOrderPrice;
    let sisaTagihan = 0;
    let paymentStatus = 'Lunas';

    if (paymentType === 'Belum Bayar') {
      paidAmount = 0;
      sisaTagihan = totalOrderPrice;
      paymentStatus = 'Belum Lunas';
    } else if (paymentType === 'DP') {
      const dpInput = parseInt(customDP, 10) || 0;
      if (dpInput <= 0 || dpInput >= totalOrderPrice) {
        showAlert("Peringatan ⚠️", "Nominal DP harus lebih dari 0 dan kurang dari total tagihan!");
        return;
      }
      paidAmount = dpInput;
      sisaTagihan = totalOrderPrice - dpInput;
      paymentStatus = 'Belum Lunas';
    }

    const totalPcs = cart.reduce((sum, item) => sum + item.qty, 0);

    try {
      setSubmitting(true);
      const transactionData = {
        customer_name: customerName.trim(),
        total_price: totalOrderPrice,
        amount_paid: paidAmount,
        sisa_tagihan: sisaTagihan,
        payment_status: paymentStatus,
        status: 'Belum Selesai',
        day_type: getDayType(),
        phone_number: phoneNumber.trim() || null,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'Diantar' ? deliveryAddress.trim() : null,
        pickup_date: pickupDate.toISOString().split('T')[0], 
        payment_method: paymentType === 'Belum Bayar' ? 'Cash' : paymentMethod,
        created_at: new Date().toISOString(),
        quantity: totalPcs,
        cart: cart 
      };

      const { error } = await supabase.from('transactions').insert([transactionData]);
      if (error) throw error;

      setSavedOrderDetails(transactionData);
      setShowReceiptModal(true);
    } catch (error) {
      console.error("Gagal simpan transaksi:", error.message);
      showAlert("Gagal Menyimpan ❌", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#4A2E1B" />
        <Text style={{ marginTop: 10, color: '#4A2E1B', fontWeight: '600' }}>Sinkronisasi Katalog Menu...</Text>
      </View>
    );
  }

  const totalTagihan = calculateTotal();

  return (
    <View style={styles.mainWrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pencatatan Kasir</Text>

        <View style={styles.cardContainer}>
          <Text style={styles.sectionLabel}>👤 DATA PELANGGAN</Text>
          <Text style={styles.label}>Nama Pembeli *</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Bu Ahmad"
            placeholderTextColor="#A1887F"
            value={customerName}
            onChangeText={setCustomerName}
          />

          <Text style={styles.label}>No. WhatsApp / HP</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 081234xxx"
            placeholderTextColor="#A1887F"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={styles.label}>Tanggal Diperlukan / Diambil *</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              style={{
                backgroundColor: '#FDFBF7',
                border: '1px solid #A1887F',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                color: '#4A2E1B',
                fontFamily: 'sans-serif',
                width: '100%',
                boxSizing: 'border-box',
                marginTop: '4px'
              }}
              value={pickupDate.toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) setPickupDate(new Date(e.target.value));
              }}
            />
          ) : (
            <>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                <Text style={styles.datePickerButtonText}>
                  📅 {pickupDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={pickupDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()} 
                  onChange={onChangeDate}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.sectionLabel}> METODE PENGIRIMAN</Text>
          <View style={styles.rowButtons}>
            <TouchableOpacity style={[styles.choiceBtn, deliveryType === 'Diambil' && styles.choiceBtnActive]} onPress={() => setDeliveryType('Diambil')}>
              <Text style={[styles.choiceText, deliveryType === 'Diambil' && styles.choiceTextActive]}> Ambil Sendiri</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.choiceBtn, deliveryType === 'Diantar' && styles.choiceBtnActive]} onPress={() => setDeliveryType('Diantar')}>
              <Text style={[styles.choiceText, deliveryType === 'Diantar' && styles.choiceTextActive]}> Diantar </Text>
            </TouchableOpacity>
          </View>

          {deliveryType === 'Diantar' && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Alamat Lengkap Tujuan</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                placeholder="Masukkan alamat rumah pembeli..."
                placeholderTextColor="#A1887F"
                multiline={true}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>ETALASE VARIAN ROTI (Ketuk untuk menambah)</Text>
        {products.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada varian roti di katalog produk.</Text>
        ) : (
          <View style={styles.gridContainer}>
            {products.map((item) => (
              <ProductCard key={item.id} product={item} onAdd={handleAddToCard} />
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>🛒 DAFTAR KERANJANG NOTA</Text>
        <View style={styles.cardContainer}>
          {cart.length === 0 ? (
            <Text style={styles.emptyText}>Keranjang kosong. Ketuk roti di atas untuk mengisi nota.</Text>
          ) : (
            cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={handleIncreaseQty}
                onDecrease={handleDecreaseQty}
                onRemove={handleRemoveItem}
                onSetQty={handleSetQtyManual}
              />
            ))
          )}
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.sectionLabel}> SKEMA PEMBAYARAN</Text>
          <View style={styles.rowButtons}>
            <TouchableOpacity style={[styles.choiceBtn, paymentType === 'Lunas' && styles.choiceBtnActive]} onPress={() => setPaymentType('Lunas')}>
              <Text style={[styles.choiceText, paymentType === 'Lunas' && styles.choiceTextActive]}> Langsung Lunas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.choiceBtn, paymentType === 'DP' && styles.choiceBtnActive]} onPress={() => setPaymentType('DP')}>
              <Text style={[styles.choiceText, paymentType === 'DP' && styles.choiceTextActive]}> Bayar DP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.choiceBtn, paymentType === 'Belum Bayar' && styles.choiceBtnActiveDanger]} onPress={() => setPaymentType('Belum Bayar')}>
              <Text style={[styles.choiceText, paymentType === 'Belum Bayar' && styles.choiceTextActiveDanger]}> Belum Bayar</Text>
            </TouchableOpacity>
          </View>

          {paymentType === 'DP' && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Masukkan Nominal DP (Rp)</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 50000"
                placeholderTextColor="#A1887F"
                keyboardType="numeric"
                value={customDP}
                onChangeText={setCustomDP}
              />
              <Text style={styles.dpSisaText}>
                Sisa Tagihan Otomatis: {formatRupiah(totalTagihan - (parseInt(customDP, 10) || 0))}
              </Text>
            </View>
          )}

          {paymentType !== 'Belum Bayar' && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Media Transaksi Uang</Text>
              <View style={styles.rowButtons}>
                <TouchableOpacity style={[styles.choiceBtn, paymentMethod === 'Cash' && styles.choiceBtnActive]} onPress={() => setPaymentMethod('Cash')}>
                  <Text style={[styles.choiceText, paymentMethod === 'Cash' && styles.choiceTextActive]}> Tunai </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.choiceBtn, paymentMethod === 'Transfer' && styles.choiceBtnActive]} onPress={() => setPaymentMethod('Transfer')}>
                  <Text style={[styles.choiceText, paymentMethod === 'Transfer' && styles.choiceTextActive]}> Transfer Bank</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🧾 Ringkasan Nota Akhir</Text>
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Biaya Roti:</Text>
            <Text style={styles.totalValue}>{formatRupiah(totalTagihan)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status Nota:</Text>
            <Text style={[styles.summaryValueText, { color: paymentType === 'Belum Bayar' || paymentType === 'DP' ? '#D32F2F' : '#2E7D32' }]}>
              {paymentType === 'Lunas' ? 'Lunas Selesai' : paymentType === 'DP' ? 'Kurang / DP' : 'Utang Total'}
            </Text>
          </View>

          <TouchableOpacity style={[styles.saveButton, submitting && { opacity: 0.7 }]} onPress={handleSaveOrder} disabled={submitting}>
            <Text style={styles.saveButtonText}>
              {submitting ? 'Menyimpan ke Buku Kasir...' : '💾 Simpan Pesanan Masuk'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {showReceiptModal && savedOrderDetails && (
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContainer}>
            <Text style={styles.receiptTitle}>📝 NOTA TRANSAKSI SUKSES</Text>
            <View style={styles.receiptDividerDashed} />
            
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Pelanggan:</Text><Text style={styles.receiptValue}>{savedOrderDetails.customer_name}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Tanggal Ambil:</Text><Text style={styles.receiptValue}>📅 {savedOrderDetails.pickup_date}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Pengiriman:</Text><Text style={styles.receiptValue}>{savedOrderDetails.delivery_type}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Metode Uang:</Text><Text style={styles.receiptValue}>{savedOrderDetails.payment_method}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Total Jumlah:</Text><Text style={styles.receiptValue}>{savedOrderDetails.quantity} pcs</Text></View>
            
            <View style={styles.receiptDividerDashed} />
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabelBold}>TOTAL TAGIHAN:</Text>
              <Text style={styles.receiptValueBold}>{formatRupiah(savedOrderDetails.total_price)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Status Pembayaran:</Text>
              <Text style={[styles.receiptValueBold, { color: savedOrderDetails.payment_status === 'Lunas' ? '#2E7D32' : '#D32F2F' }]}>
                {savedOrderDetails.payment_status.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.receiptActionRow}>
              <TouchableOpacity style={styles.receiptCloseBtn} onPress={handleCloseReceiptAndReset}>
                <Text style={styles.receiptCloseBtnText}>❌ Tutup</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.receiptPrintBtn} onPress={handlePrintDirect}>
                <Text style={styles.receiptPrintBtnText}>🖨️ Cetak / Bagikan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// =========================================================================
// STYLESHEET (DIKEMBALIKAN 100% SESUAI DESAIN ANDA)
// =========================================================================
const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#FDFBF7' },
  container: { flex: 1, backgroundColor: '#FDFBF7', padding: 16 }, 
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDFBF7' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#4A2E1B', marginBottom: 15 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#4A2E1B', marginTop: 18, marginBottom: 10 },
  
  cardContainer: { backgroundColor: '#FFF8E1', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#FFF0E0', marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', color: '#8D6E63', marginBottom: 10 },
  label: { fontSize: 12, color: '#4A2E1B', fontWeight: '700', marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#A1887F', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#4A2E1B' },
  dpSisaText: { fontSize: 12, color: '#8D6E63', marginTop: 4, fontWeight: '600' },
  
  datePickerButton: { backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#A1887F', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, marginTop: 4, marginBottom: 8, justifyContent: 'center' },
  datePickerButtonText: { fontSize: 14, fontWeight: '700', color: '#4A2E1B' },

  rowButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  choiceBtn: { flex: 1, backgroundColor: '#FDFBF7', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#A1887F' },
  choiceBtnActive: { backgroundColor: '#4A2E1B', borderColor: '#4A2E1B' },
  choiceBtnActiveDanger: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  choiceText: { fontSize: 12, fontWeight: '700', color: '#4A2E1B' },
  choiceTextActive: { color: '#FFF8E1' },
  choiceTextActiveDanger: { color: '#FDFBF7' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  
  prodCard: { 
    backgroundColor: '#FFF8E1', 
    width: '48%', 
    borderRadius: 10, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#FFF0E0', 
    justifyContent: 'space-between', 
    marginBottom: 4,
    ...Platform.select({
      ios: { shadowColor: '#4A2E1B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(74, 46, 27, 0.08)' }
    })
  },
  
  prodInfo: { marginBottom: 8 },
  prodName: { fontSize: 14, fontWeight: 'bold', color: '#4A2E1B' },
  prodCategory: { fontSize: 11, color: '#8D6E63', marginTop: 2, fontStyle: 'italic' },
  prodPrice: { fontSize: 13, color: '#4A2E1B', fontWeight: '700', marginTop: 4 },
  addBadge: { backgroundColor: '#8D6E63', paddingVertical: 4, borderRadius: 6, alignItems: 'center' },
  addBadgeText: { color: '#FDFBF7', fontSize: 11, fontWeight: 'bold' },

  cartItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FFF0E0' },
  cartMainInfo: { flex: 1, paddingRight: 6 },
  cartItemName: { fontSize: 14, fontWeight: '700', color: '#4A2E1B' },
  cartItemPriceSum: { fontSize: 12, color: '#8D6E63', marginTop: 2 },
  cartItemTotalBold: { fontWeight: 'bold', color: '#4A2E1B' },
  
  cartControlGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cartActionBtn: { width: 26, height: 26, backgroundColor: '#FDFBF7', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#A1887F' },
  cartActionBtnActive: { width: 26, height: 26, backgroundColor: '#4A2E1B', borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  cartActionText: { fontSize: 14, fontWeight: 'bold', color: '#4A2E1B' },
  cartActionTextActive: { fontSize: 14, fontWeight: 'bold', color: '#FDFBF7' },
  cartQtyTap: { minWidth: 26, alignItems: 'center', paddingVertical: 2 },
  cartQtyText: { fontSize: 14, fontWeight: 'bold', color: '#4A2E1B', textDecorationLine: 'underline' },
  cartInputQty: { width: 32, textAlign: 'center', backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#4A2E1B', borderRadius: 4, paddingVertical: 2, fontSize: 13, color: '#4A2E1B' },
  cartRemoveBtn: { marginLeft: 4, padding: 4 },
  cartRemoveText: { fontSize: 14 },

  emptyText: { textAlign: 'center', color: '#8D6E63', marginVertical: 12, fontSize: 12, fontStyle: 'italic' },
  
  summaryCard: { backgroundColor: '#FFF8E1', borderRadius: 10, padding: 16, marginTop: 15, borderWidth: 2, borderColor: '#4A2E1B' },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#4A2E1B' },
  divider: { height: 1, backgroundColor: '#4A2E1B', marginVertical: 10 }, 
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#8D6E63', fontWeight: '600' },
  summaryValueText: { fontSize: 13, color: '#4A2E1B', fontWeight: '700' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#4A2E1B' },
  saveButton: { backgroundColor: '#4A2E1B', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveButtonText: { color: '#FDFBF7', fontWeight: 'bold', fontSize: 14 },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(74, 46, 27, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 999 },
  receiptContainer: { backgroundColor: '#FFF8E1', width: '100%', borderRadius: 12, padding: 20, borderWidth: 2, borderColor: '#4A2E1B' },
  receiptTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A2E1B', textAlign: 'center', marginBottom: 10 },
  receiptDividerDashed: { height: 1, borderWidth: 1, borderColor: '#A1887F', borderStyle: 'dashed', marginVertical: 12 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  receiptLabel: { fontSize: 13, color: '#8D6E63', fontWeight: '600' },
  receiptValue: { fontSize: 13, color: '#4A2E1B', fontWeight: '700' },
  receiptLabelBold: { fontSize: 14, color: '#4A2E1B', fontWeight: 'bold' },
  receiptValueBold: { fontSize: 15, color: '#4A2E1B', fontWeight: 'bold' },
  receiptActionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 18 },
  receiptCloseBtn: { flex: 1, backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#A1887F', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  receiptCloseBtnText: { color: '#4A2E1B', fontWeight: '700', fontSize: 13 },
  receiptPrintBtn: { flex: 1, backgroundColor: '#4A2E1B', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  receiptPrintBtnText: { color: '#FDFBF7', fontWeight: '700', fontSize: 13 }
});