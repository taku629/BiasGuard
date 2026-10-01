import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SignalType } from '../../../features/behavior/types';
import { SIGNAL_METADATA } from '../../../features/behavior/mapping';

export default function ExplanationScreen() {
  const { signal } = useLocalSearchParams<{ signal: SignalType }>();

  const meta = signal ? SIGNAL_METADATA[signal] : null;

  if (!meta) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Invalid signal type</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{meta.name}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What this measures</Text>
        <Text style={styles.text}>{meta.explanation}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How BiasGuard calculates it</Text>
        <Text style={styles.text}>
          Formulas are based on standard behavioral finance literature. 
          For example, disposition effect = PGR - PLR (Proportion of Gains Realized - Proportion of Losses Realized).
          The raw value is clamped between 0 and 100 to map it to a severity scale.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your evidence</Text>
        <Text style={styles.text}>
          This is based on your trading history and completed behavioral assessments.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Limitations</Text>
        <Text style={styles.text}>
          The severity is an estimate and may not fully capture nuanced trading strategies. Short histories limit statistical significance.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  errorText: { color: '#ff4444', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  section: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A90E2', marginBottom: 8 },
  text: { color: '#ccc', lineHeight: 22 }
});
