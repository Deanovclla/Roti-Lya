// src/components/ProductCard.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { formatRupiah } from '../utils/currencyFormatter'; // Integrasi helper konversi uang

const ProductCard = ({ imageUri, name, price, stock, onPress }) => {
  const isOutOfStock = stock <= 0;

  // Cek apakah data nominal harga bertipe data angka atau teks mentah sebelum diformat
  const displayPrice = typeof price === 'number' ? formatRupiah(price) : price;

  return (
    <TouchableOpacity 
      style={[styles.card, isOutOfStock && styles.cardDisabled]} 
      onPress={onPress} 
      activeOpacity={0.8}
      disabled={isOutOfStock}
    >
      {/* Container Gambar */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="cover" 
          />
        ) : (
          <Text style={styles.imagePlaceholderText}>[ Foto Roti ]</Text>
        )}
      </View>

      {/* Detail Konten Roti */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.price}>{displayPrice}</Text>
        
        <View style={styles.stockRow}>
          <Text style={[styles.stockText, isOutOfStock && styles.outOfStockText]}>
            {isOutOfStock ? 'Stok Habis' : `Sisa Stok: ${stock}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
    // Perbaikan kompatibilitas rendering bayangan terpadu (Cross-Platform)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3, 
  },
  cardDisabled: {
    opacity: 0.55,
  },
  imageContainer: {
    width: '100%',
    height: 200, 
    backgroundColor: theme.colors.background || '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholderText: {
    color: theme.colors.secondary || '#9CA3AF',
    ...theme.typography.caption,
  },
  infoContainer: {
    padding: theme.spacing.md,
  },
  name: {
    ...theme.typography.title,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '600'
  },
  price: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    ...theme.typography.caption,
    color: theme.colors.success || '#10B981',
    fontWeight: 'bold',
  },
  outOfStockText: {
    color: '#EF4444',
  }
});

export default ProductCard;