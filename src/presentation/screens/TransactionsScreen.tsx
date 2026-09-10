import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useTransactionsViewModel } from '../viewmodels/useTransactionsViewModel';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useTheme } from '../components/useTheme';

/**
 * This screen has no business logic in it - notice it never touches
 * repositories or use-cases directly. If you find yourself writing an
 * `if` about sync status or SQL here, that logic belongs one layer down.
 */
export function TransactionsScreen() {
  const { state, retry, loadMore } = useTransactionsViewModel();
  const theme = useTheme();

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState error={state.error} onRetry={retry} />;
  if (state.status === 'empty') {
    return <EmptyState title="No transactions yet" subtitle="Add your first one to start tracking your spending." />;
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      data={state.transactions}
      keyExtractor={(item) => item.id}
      onEndReached={state.hasMore ? loadMore : undefined}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => (
        <View accessibilityRole="text" style={{ padding: 16, borderBottomColor: theme.border, borderBottomWidth: 1 }}>
          <Text style={{ color: theme.text, fontWeight: '600' }}>
            {item.currency} {item.amount.toFixed(2)}
          </Text>
          {item.note && <Text style={{ color: theme.textMuted }}>{item.note}</Text>}
        </View>
      )}
    />
  );
}
