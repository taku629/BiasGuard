import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { fetchTransactions } from '@/repositories';
import { Transaction } from '@/types/models';

export default function TransactionHistoryScreen() {
  const { portfolioId } = useLocalSearchParams<{ portfolioId: string }>();
  const { user } = useAuth();
  
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !portfolioId) return;
    fetchTransactions(user.uid, portfolioId).then((data: Transaction[]) => {
      // Show newest first
      setTxs(data.reverse());
      setLoading(false);
    });
  }, [user, portfolioId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#fff" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={txs}
        keyExtractor={item => item.id!}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.ticker}>{item.ticker}</Text>
              <Text style={[styles.type, item.type === 'buy' ? styles.buy : styles.sell]}>
                {item.type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.text}>{item.quantity} shares @ ${item.price}</Text>
              <Text style={styles.date}>{item.executedAt.toDate().toLocaleDateString()}</Text>
            </View>
            {!!item.fees && <Text style={styles.fees}>Fees: ${item.fees}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 24 },
  card: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 8, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticker: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  type: { fontWeight: 'bold' },
  buy: { color: '#4A90E2' },
  sell: { color: '#ff4444' },
  text: { color: '#ccc' },
  date: { color: '#aaa', fontSize: 12 },
  fees: { color: '#888', fontSize: 12 }
});
