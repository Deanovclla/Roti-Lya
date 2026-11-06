// src/components/ImagePickerCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { theme } from '../styles/theme';

const ImagePickerCard = ({ imageUri, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {imageUri ? (
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="cover" 
          />
          <View style={styles.changeBadge}>
            <Text style={styles.changeText}>Ganti Foto</Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.plusIcon}>+</Text>
          <Text style={styles.text}>Ketuk untuk upload foto</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  placeholder: {
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 40,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  changeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '600',
  }
});

export default ImagePickerCard;