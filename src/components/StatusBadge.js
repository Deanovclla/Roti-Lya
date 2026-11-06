// src/components/StatusBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const StatusBadge = ({ status }) => {
  // Pengaman jika properti status kosong/null/undefined agar aplikasi tidak crash (.toLowerCase() error)
  const safeStatus = status ? String(status) : 'Menunggu';
  const statusLower = safeStatus.toLowerCase().trim();
  
  let bgColor = theme.colors.secondary; // Warna default (Coklat Medium #8C5A3C)
  
  // Aturan pemetaan warna palet terpadu sesuai kesepakatan desain
  if (statusLower === 'lunas' || statusLower === 'matang' || statusLower === 'selesai') {
    bgColor = theme.colors.secondary; // Coklat Medium Karamel Kue
  } else if (
    statusLower === 'dp 50%' || 
    statusLower === 'dp' || 
    statusLower === 'menunggu' || 
    statusLower === 'proses' || 
    statusLower === 'meracik' || 
    statusLower === 'dioven'
  ) {
    bgColor = theme.colors.primary; // Warna aksen utama (Krem Tua / Karamel Muda)
  } else if (statusLower === 'batal' || statusLower === 'belum bayar' || statusLower === 'ditolak') {
    bgColor = theme.colors.text; // Coklat Sangat Pekat / Gelap
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>{safeStatus}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.round || 20,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...theme.typography.caption,
    color: theme.colors.white || '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  }
});

export default StatusBadge;