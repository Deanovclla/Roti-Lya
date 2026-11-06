// src/components/DigitalReceipt.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import StatusBadge from './StatusBadge';

const DigitalReceipt = ({ orderId, customerName, items = [], total, status }) => {
  return (
    <View style={styles.receiptContainer}>
      {/* Bagian Header Nota */}
      <View style={styles.header}>
        <Text style={styles.brandName}>ROTI LYA</Text>
        <Text style={styles.receiptId}>ID Pesanan: {orderId}</Text>
        <Text style={styles.customerName}>Pelanggan: {customerName}</Text>
      </View>

      <View style={styles.divider} />

      {/* Bagian Rincian Item */}
      <View style={styles.itemsContainer}>
        {items && items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.itemText}>{(item.qty || item.quantity || 1)}x {item.name}</Text>
            <Text style={styles.priceText}>Rp {(item.price || 0).toLocaleString('id-ID')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Bagian Total dan Status */}
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total Tagihan</Text>
        <Text style={styles.totalValue}>Rp {(total || 0).toLocaleString('id-ID')}</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status Pembayaran:</Text>
        <StatusBadge status={status} />
      </View>

      {/* Bagian Footer */}
      <Text style={styles.footerText}>Terima kasih telah berbelanja di Roti Lya!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  receiptContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  brandName: {
    ...theme.typography.header,
    color: theme.colors.text,
    letterSpacing: 2,
    fontWeight: 'bold'
  },
  receiptId: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    marginTop: theme.spacing.xs,
  },
  customerName: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    fontWeight: '600',
  },
  divider: {
    // Solusi Lintasan Lintas Platform: Menghindari crash atau garis pekat di Android
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed', 
    borderRadius: 1,
    marginVertical: theme.spacing.md,
  },
  itemsContainer: {
    paddingVertical: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  itemText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 2,
  },
  priceText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  totalLabel: {
    ...theme.typography.title,
    color: theme.colors.text,
    fontWeight: 'bold'
  },
  totalValue: {
    ...theme.typography.title,
    color: theme.colors.primary,
    fontWeight: 'bold'
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  statusLabel: {
    ...theme.typography.body,
    color: theme.colors.secondary,
  },
  footerText: {
    ...theme.typography.caption,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
  }
});

export default DigitalReceipt;