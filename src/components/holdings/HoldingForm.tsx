import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

export type HoldingFormValues = {
  ticker: string;
  quantity: number;
  avgCost: number;
};

type HoldingFormProps = {
  submitLabel: string;
  onSubmit: (values: HoldingFormValues) => Promise<void>;
  initialValues?: {
    ticker: string;
    quantity: string;
    avgCost: string;
  };
  showPlaceholders?: boolean;
};

const parseValues = (ticker: string, quantity: string, avgCost: string): HoldingFormValues | null => {
  const uppercaseTicker = ticker.trim().toUpperCase();
  const parsedQuantity = parseFloat(quantity);
  const parsedAvgCost = parseFloat(avgCost);

  if (!uppercaseTicker) {
    Alert.alert('Validation Error', 'Ticker is required.');
    return null;
  }
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    Alert.alert('Validation Error', 'Quantity must be greater than 0.');
    return null;
  }
  if (isNaN(parsedAvgCost) || parsedAvgCost < 0) {
    Alert.alert('Validation Error', 'Average Cost must be 0 or greater.');
    return null;
  }

  return { ticker: uppercaseTicker, quantity: parsedQuantity, avgCost: parsedAvgCost };
};

export default function HoldingForm({ submitLabel, onSubmit, initialValues, showPlaceholders = false }: HoldingFormProps) {
  const [ticker, setTicker] = useState(initialValues?.ticker ?? '');
  const [quantity, setQuantity] = useState(initialValues?.quantity ?? '');
  const [avgCost, setAvgCost] = useState(initialValues?.avgCost ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const values = parseValues(ticker, quantity, avgCost);
    if (!values) return;

    setLoading(true);
    try {
      await onSubmit(values);
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
        placeholder={showPlaceholders ? 'AAPL' : undefined}
        placeholderTextColor="#666"
        value={ticker}
        onChangeText={setTicker}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        placeholder={showPlaceholders ? '10' : undefined}
        placeholderTextColor="#666"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Average Cost ($)</Text>
      <TextInput
        style={styles.input}
        placeholder={showPlaceholders ? '150.00' : undefined}
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
          <Text style={styles.buttonText}>{submitLabel}</Text>
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
