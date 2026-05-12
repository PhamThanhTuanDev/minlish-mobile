import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Design System Colors
export const colors = {
  primary: '#0f7f86',
  primaryLight: '#0d6f75',
  primaryDark: '#0b5d61',
  accent: '#f6c357',
  background: '#f8fafb',
  surface: '#ffffff',
  text: '#0f172a',
  textLight: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

// Common Styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    padding: 16,
  } as ViewStyle,

  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  } as ViewStyle,

  buttonPrimary: {
    backgroundColor: colors.primary,
  } as ViewStyle,

  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,

  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  } as TextStyle,

  buttonTextPrimary: {
    color: colors.surface,
    fontWeight: '700',
  } as TextStyle,

  input: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.text,
    minHeight: 44,
  } as ViewStyle,

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  } as TextStyle,

  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  } as TextStyle,

  error: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.error,
    marginTop: 4,
  } as TextStyle,

  divider: {
    height: 1,
    backgroundColor: colors.border,
  } as ViewStyle,

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  gap4: { gap: 4 } as ViewStyle,
  gap6: { gap: 6 } as ViewStyle,
  gap8: { gap: 8 } as ViewStyle,
  gap12: { gap: 12 } as ViewStyle,
  gap16: { gap: 16 } as ViewStyle,
  gap20: { gap: 20 } as ViewStyle,

  marginTop4: { marginTop: 4 } as ViewStyle,
  marginTop8: { marginTop: 8 } as ViewStyle,
  marginTop12: { marginTop: 12 } as ViewStyle,
  marginTop16: { marginTop: 16 } as ViewStyle,
  marginTop20: { marginTop: 20 } as ViewStyle,

  paddingHorizontal16: { paddingHorizontal: 16 } as ViewStyle,
  paddingVertical12: { paddingVertical: 12 } as ViewStyle,
});

export default commonStyles;
