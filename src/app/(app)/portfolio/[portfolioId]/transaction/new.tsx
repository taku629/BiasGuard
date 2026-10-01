import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { addTransactionAtomic, addHolding, getHoldingsRef } from '@/repositories';
import { Timestamp, getDocs } from 'firebase/firestore';

export default function NewTransactionScreen() {
  const { portfolioId } = useLocalSearchParams<{ portfolioId: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [ticker, setTicker] = useState('');
  const [isBuy, setIsBuy] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [fees, setFees] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !portfolioId) return;
    const tTicker = ticker.trim().toUpperCase();
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    const f = parseFloat(fees) || 0;

    if (!tTicker || isNaN(q) || q <= 0 || isNaN(p) || p <= 0 || f < 0) {
      Alert.alert('Validation Error', 'Please enter valid values.');
      return;
    }

    setLoading(true);
    try {
      // Find or create holding
      const holdingsSnap = await getDocs(getHoldingsRef(user.uid, portfolioId));
      const holdings = holdingsSnap.docs.map(d => ({ ...d.data(), id: d.id } as import('@/types/models').Holding));
      let holding = holdings.find(h => h.ticker === tTicker);
      
      let holdingId = holding?.id;
      if (!holdingId) {
        if (!isBuy) throw new Error('Cannot sell a stock you do not own.');
        const newHolding = await addHolding(user.uid, portfolioId, {
          ticker: tTicker,
          quantity: q,
          avgCost: p
        });
        holdingId = newHolding.id;
      }

      await addTransactionAtomic(user.uid, portfolioId, {
        portfolioId,
        ticker: tTicker,
        type: isBuy ? 'buy' : 'sell',
        quantity: q,
        price: p,
        fees: f,
        executedAt: Timestamp.now()
      }, holdingId!);

      Alert.alert('Success', 'Transaction added', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Transaction</Text>

      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, !isBuy && styles.activeSell]}>SELL</Text>
        <Switch value={isBuy} onValueChange={setIsBuy} trackColor={{ false: '#ff4444', true: '#4A90E2' }} />
        <Text style={[styles.switchLabel, isBuy && styles.activeBuy]}>BUY</Text>
      </View>

      <Text style={styles.label}>Ticker</Text>
      <TextInput style={styles.input} value={ticker} onChangeText={setTicker} placeholder="AAPL" placeholderTextColor="#666" autoCapitalize="characters" />

      <Text style={styles.label}>Quantity</Text>
      <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="10" placeholderTextColor="#666" keyboardType="numeric" />

      <Text style={styles.label}>Price</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="150.50" placeholderTextColor="#666" keyboardType="numeric" />

      <Text style={styles.label}>Fees (Optional)</Text>
      <TextInput style={styles.input} value={fees} onChangeText={setFees} placeholder="0.00" placeholderTextColor="#666" keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Submit Transaction'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  switchLabel: { color: '#666', fontSize: 16, fontWeight: 'bold', marginHorizontal: 12 },
  activeBuy: { color: '#4A90E2' },
  activeSell: { color: '#ff4444' },
  label: { color: '#aaa', marginBottom: 8 },
  input: { backgroundColor: '#1E1E1E', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
