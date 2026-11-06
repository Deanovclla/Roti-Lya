// src/components/Button.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { theme } from "../styles/theme";

const Button = ({ title, onPress, variant = "primary", style, loading = false, disabled = false }) => {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryBg : styles.secondaryBg,
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? theme.colors.white : theme.colors.secondary} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? styles.primaryText : styles.secondaryText,
            disabled && styles.disabledText
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: 48, // Menjamin ukuran minimal target sentuh yang baik
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  primaryBg: {
    backgroundColor: theme.colors.primary,
  },
  secondaryBg: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
    opacity: 0.7
  },
  text: {
    ...theme.typography.title,
    fontWeight: '600'
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.secondary,
  },
  disabledText: {
    color: '#9CA3AF'
  }
});

export default Button;