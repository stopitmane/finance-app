import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from './useTheme'; // stub - wire to your dark-mode theme context

export function LoadingState() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} accessibilityRole="progressbar" accessibilityLabel="Loading transactions">
      <ActivityIndicator size="large" color={theme.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
