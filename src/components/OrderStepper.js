// src/components/OrderStepper.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const steps = ['Antrean', 'Meracik', 'Dioven', 'Matang'];

const OrderStepper = ({ currentStepIndex }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isLast = index === steps.length - 1;

        return (
          <View key={index} style={styles.stepWrapper}>
            {/* Indikator Lingkaran */}
            <View style={[styles.circle, isCompleted && styles.circleActive]}>
              <Text style={[styles.circleText, isCompleted && styles.circleTextActive]}>
                {index + 1}
              </Text>
            </View>
            
            {/* Teks Status */}
            <Text style={[styles.stepText, isCompleted && styles.stepTextActive]}>
              {step}
            </Text>

            {/* Garis Penghubung (Diposisikan horizontal ke kanan tengah lingkaran) */}
            {!isLast && (
              <View style={[styles.line, isCompleted && styles.lineActive]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
    width: '100%'
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, 
  },
  circleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  circleText: {
    ...theme.typography.caption,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  circleTextActive: {
    color: theme.colors.white,
  },
  stepText: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    marginTop: 8,
    fontSize: 11,
    textAlign: 'center',
  },
  stepTextActive: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  line: {
    position: 'absolute',
    top: 16, // Setengah dari tinggi lingkaran (32/2) agar tepat berada di as tengah
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: 1,
  },
  lineActive: {
    backgroundColor: theme.colors.primary,
  }
});

export default OrderStepper;