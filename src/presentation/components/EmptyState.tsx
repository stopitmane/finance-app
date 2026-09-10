import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './useTheme';

interface Props {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container} accessibilityRole="text">
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  subtitle: { fontSize: 14, marginTop: 8, textAlign: 'center' },
});
