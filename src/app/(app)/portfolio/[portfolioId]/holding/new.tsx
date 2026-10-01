import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { addHolding } from '@/repositories';

export default function NewHoldingScreen() {
  const { portfolioId } = useLocalSearchParams<{ portfolioId: string }>();
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSave = async () => {
    const uppercaseTicker = ticker.trim().toUpperCase();
    const parsedQuantity = parseFloat(quantity);
    const parsedAvgCost = parseFloat(avgCost);

    if (!uppercaseTicker) {
      Alert.alert('Validation Error', 'Ticker is required.');
      return;
    }
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Validation Error', 'Quantity must be greater than 0.');
      return;
    }
    if (isNaN(parsedAvgCost) || parsedAvgCost < 0) {
      Alert.alert('Validation Error', 'Average Cost must be 0 or greater.');
      return;
    }

    setLoading(true);
    try {
      await addHolding(user!.uid, portfolioId, {
        ticker: uppercaseTicker,
        quantity: parsedQuantity,
        avgCost: parsedAvgCost
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ticker Symbol</Text>
      <TextInput
        style={styles.input}
        placeholder="AAPL"
        placeholderTextColor="#666"
        value={ticker}
        onChangeText={setTicker}
        autoCapitalize="characters"
      />
      
      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        placeholder="10"
        placeholderTextColor="#666"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Average Cost ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="150.00"
        placeholderTextColor="#666"
        value={avgCost}
        onChangeText={setAvgCost}
        keyboardType="numeric"
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Add Holding</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  label: { color: '#fff', fontSize: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
