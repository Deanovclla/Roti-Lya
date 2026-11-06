// src/apk-owner/InventoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, Alert, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme'; // Menggunakan warna hangat kesepakatan tim
import { formatRupiah } from '../utils/currencyFormatter'; 
import ProductCard from '../components/ProductCard'; 
import ImagePickerCard from '../components/ImagePickerCard'; 
import Button from '../components/Button'; 
import { supabase } from '../config/supabaseClient';

export default function InventoryScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // 1. Ambil daftar menu roti dari Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) { 
      console.error("Gagal memuat menu:", error.message); 
      if (Platform.OS === 'web') {
        alert("Eror Menu ❌: " + error.message);
      } else {
        Alert.alert("Eror Menu ❌", error.message);
      }
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  // 2. Eksekusi Hapus Menu Roti
  const executeDelete = async (id, productName) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (Platform.OS === 'web') {
        alert(`Berhasil 🎉 Menu "${productName}" telah dihapus.`);
      } else {
        Alert.alert("Berhasil 🎉", `Menu "${productName}" telah dihapus.`);
      }
      fetchProducts(); 
    } catch (err) {
      console.error("Gagal menghapus produk:", err.message);
      if (Platform.OS === 'web') {
        alert("Eror Sistem ❌: Gagal menghapus menu.");
      } else {
        Alert.alert("Eror Sistem ❌", "Gagal menghapus menu dari database.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id, productName) => {
    if (Platform.OS === 'web') {
      const konfirmasi = window.confirm(`Apakah kamu yakin ingin menghapus menu "${productName}" dari daftar?`);
      if (konfirmasi) {
        executeDelete(id, productName);
      }
    } else {
      Alert.alert(
        "Hapus Menu Roti ⚠️",
        `Apakah kamu yakin ingin menghapus menu "${productName}" dari daftar pilihan?`,
        [
          { text: "Batal", style: "cancel" },
          { text: "Ya, Hapus", style: "destructive", onPress: () => executeDelete(id, productName) }
        ]
      );
    }
  };

  // 3. Ambil Foto Menu dari Galeri
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // 4. Unggah Foto ke Supabase Storage
  const uploadImageOnline = async (uri) => {
    try {
      const fileExt = uri.split('.').pop().split('?')[0];
      const fileName = `roti_${Date.now()}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('roti-images')
        .upload(fileName, blob, {
          contentType: blob.type,
          upsert: true
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('roti-images')
        .getPublicUrl(fileName);
      
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Detail Eror Upload Gambar:", err.message);
      return null;
    }
  };

  // 5. Simpan Varian Menu Baru (Tanpa Kolom Stok)
  const handleSaveProduct = async () => {
    if (!name || !price) {
      if (Platform.OS === 'web') alert("Peringatan ⚠️: Mohon lengkapi nama dan harga roti!");
      else Alert.alert("Peringatan ⚠️", "Mohon lengkapi nama dan harga roti!");
      return;
    }

    try {
      setUploading(true);
      const cleanPrice = price.toString().replace(/[^0-9]/g, ''); 
      const parsedPrice = parseInt(cleanPrice, 10);

      if (isNaN(parsedPrice)) {
        if (Platform.OS === 'web') alert("Format Salah ❌: Harga harus berupa angka!");
        else Alert.alert("Format Salah ❌", "Harga harus berupa angka valid!");
        setUploading(false);
        return;
      }

      let finalImageUrl = 'https://via.placeholder.com/150';
      
      if (imageUri) {
        const uploadedUrl = await uploadImageOnline(imageUri);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          if (Platform.OS === 'web') alert("Gagal Gambar ⚠️: Gagal mengunggah foto. Menggunakan gambar contoh.");
          else Alert.alert("Gagal Gambar ⚠️", "Gagal mengunggah foto. Menggunakan gambar contoh.");
        }
      }

      // Menyimpan data tanpa menyertakan kolom stock atau set default ke null/0 jika database meminta
      const { error } = await supabase
        .from('products')
        .insert([
          { name: name, price: parsedPrice, image_url: finalImageUrl }
        ]);

      if (error) throw error;

      if (Platform.OS === 'web') alert(`Sukses 🎉 Menu "${name}" berhasil ditambahkan ke daftar pilihan!`);
      else Alert.alert("Sukses 🎉", `Menu "${name}" berhasil ditambahkan ke daftar pilihan!`);
      
      setModalVisible(false);
      setName(''); setPrice(''); setImageUri(null);
      fetchProducts(); 

    } catch (error) { 
      console.error("Eror sistem:", error.message); 
      if (Platform.OS === 'web') alert("Ditolak Server ❌: " + error.message);
      else Alert.alert("Ditolak Server ❌", error.message || "Gagal menghubungkan ke database.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Daftar Pilihan Roti</Text>
        <Button 
          title="+ Menu Baru" 
          variant="primary" 
          onPress={() => setModalVisible(true)} 
          style={{ paddingVertical: 8, paddingHorizontal: 12 }} 
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {products.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              {/* Properti stock tidak dilempar atau diisi teks deskriptif 'Made by order' jika ProductCard membutuhkan prop tersebut */}
              <ProductCard 
                imageUri={item.image_url}
                name={item.name}
                price={formatRupiah(item.price)} 
                stock="Made by Order 🥖" 
                onPress={() => {
                  if (Platform.OS === 'web') alert(`${item.name}\nSistem: Made by Order`);
                  else Alert.alert(item.name, `Sistem produksi: Made by Order`);
                }}
              />
              
              <TouchableOpacity 
                style={styles.deleteBadge} 
                onPress={() => handleDeleteProduct(item.id, item.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteIconText}>🗑️ Hapus</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Menu Roti Baru</Text>
            
            <TextInput placeholder="Nama Roti/Kue" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#999" />
            <TextInput placeholder="Harga Jual Satuan (Rp)" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} placeholderTextColor="#999" />

            <ImagePickerCard imageUri={imageUri} onPress={pickImage} />

            <View style={styles.modalButtons}>
              <Button title="Batal" variant="secondary" style={styles.btnAction} onPress={() => setModalVisible(false)} />
              <Button title={uploading ? "Proses..." : "Simpan"} variant="primary" style={styles.btnAction} onPress={handleSaveProduct} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { ...theme.typography.title, color: theme.colors.text, fontWeight: 'bold' },
  scroll: { flex: 1 },
  cardWrapper: { position: 'relative', marginBottom: 5 },
  
  deleteBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.95)', 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 999, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  deleteIconText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: 20 },
  modalTitle: { ...theme.typography.title, color: theme.colors.text, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  input: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.secondary, color: theme.colors.text },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnAction: { flex: 0.48 }
});