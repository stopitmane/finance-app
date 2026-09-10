import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { AppError } from '../../core/errors/AppError';
import { useTheme } from './useTheme';

interface Props {
  error: AppError;
  onRetry: () => void;
}

/** Message copy branches on error.type - this is the payoff of a typed AppError. */
function messageFor(error: AppError): string {
  switch (error.type) {
    case 'network':
      return error.retryable ? "Couldn't reach the server. Check your connection." : 'Something went wrong on our end.';
    case 'database':
      return "Couldn't load your data from local storage.";
    case 'auth':
      return 'Please sign in again to continue.';
    case 'conflict':
      return 'This item changed elsewhere - review before continuing.';
    default:
      return 'Something unexpected happened.';
  }
}

export function ErrorState({ error, onRetry }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={[styles.message, { color: theme.text }]}>{messageFor(error)}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        style={[styles.button, { backgroundColor: theme.accent }]}
      >
        <Text style={styles.buttonText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { fontSize: 15, textAlign: 'center', marginBottom: 16 },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
