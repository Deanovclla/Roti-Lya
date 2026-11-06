// src/components/QrisModal.js
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { theme } from '../styles/theme';
import Button from './Button'; // Memanggil komponen Button kustom

const QrisModal = ({ visible, onClose, onUploadProof }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      {/* TouchableOpacity di sini berfungsi agar modal bisa ditutup saat Nenek/Pembeli mengetuk area luar */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* TouchableWithoutFeedback mencegah modal tertutup saat area putih di dalam diketuk */}
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Pembayaran QRIS</Text>
            
            {/* Placeholder Gambar QRIS */}
            <View style={styles.qrContainer}>
              <Text style={styles.qrText}>[ GAMBAR QRIS NENEK ]</Text>
            </View>

            <Text style={styles.instruction}>
              Silakan scan QRIS di atas, lalu unggah bukti transfer agar pesanan bisa diproses.
            </Text>

            <View style={styles.buttonGroup}>
              <Button 
                title="Unggah Bukti" 
                variant="primary" 
                onPress={onUploadProof} 
                style={styles.actionBtn}
              />
              <Button 
                title="Nanti Saja" 
                variant="secondary" 
                onPress={onClose} 
                style={[styles.actionBtn, { marginTop: 10 }]} // Mengganti 'gap' dengan marginTop agar aman di semua versi Android/iOS
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 46, 43, 0.6)', // Coklat gelap transparan
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    // Efek bayangan untuk mempertegas modal popup
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  qrContainer: {
    width: 200,
    height: 200,
    backgroundColor: theme.colors.background || '#F9FAFB',
    borderWidth: 2,
    borderColor: theme.colors.secondary || '#9CA3AF',
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  qrText: {
    color: theme.colors.secondary || '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  instruction: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  buttonGroup: {
    width: '100%',
  },
  actionBtn: {
    width: '100%',
  }
});

export default QrisModal;