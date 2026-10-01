import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { referencePriceV1 } from '@/features/behavioralAssessments/items/referencePrice.v1';
import { createAssessmentSession, completeAssessmentSession, saveAssessmentResponse } from '@/repositories/assessment';
import { calculateReferencePriceSensitivity, ReferencePriceResult } from '@/services/behavior/referencePrice';
import { AssessmentResponse } from '@/types/models';

export default function ReferencePriceScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [session, setSession] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [estimateStr, setEstimateStr] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [result, setResult] = useState<ReferencePriceResult | null>(null);

  // We should randomize the order deterministically, but for MVP just taking them as is.
  const items = referencePriceV1;
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!user) return;
    createAssessmentSession(user.uid, {
      userId: user.uid,
      assessmentType: 'reference_price_sensitivity',
      version: '1.0'
    }).then(s => {
      setSession(s);
      setLoading(false);
    });
  }, [user]);

  const handleNext = async () => {
    const val = parseFloat(estimateStr);
    if (isNaN(val) || !isFinite(val) || val < 0) {
      Alert.alert('Invalid', 'Please enter a valid positive number');
      return;
    }

    setLoading(true);
    try {
      const newResponse = await saveAssessmentResponse(user!.uid, session.id, {
        sessionId: session.id,
        itemId: currentItem.id,
        userEstimate: val,
      });

      const newResponses = [...responses, newResponse];
      setResponses(newResponses);

      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setEstimateStr('');
      } else {
        await completeAssessmentSession(user!.uid, session.id);
        const res = calculateReferencePriceSensitivity(newResponses);
        setResult(res);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save response');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !session) return <View style={styles.center}><ActivityIndicator color="#4A90E2" /></View>;

  if (result) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.title}>Assessment Complete</Text>
        {result.signal.status === 'insufficient_data' ? (
          <Text style={styles.neutralText}>Not enough valid trials to calculate sensitivity. (Valid: {result.trialCount})</Text>
        ) : (
          <View style={styles.card}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Median Anchor Pull</Text>
              <Text style={styles.statValue}>{(result.medianAnchorPull * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Mean High Anchor Pull</Text>
              <Text style={styles.statValue}>{(result.highAnchorMean * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Mean Low Anchor Pull</Text>
              <Text style={styles.statValue}>{(result.lowAnchorMean * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.neutralText}>
              {result.medianAnchorPull > 0.1
                ? "Your estimations tended to be pulled in the direction of the provided reference prices."
                : result.medianAnchorPull < -0.1
                ? "Your estimations tended to move opposite to the provided reference prices."
                : "Your estimations were largely independent of the provided reference prices."}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Return to Insights</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.progressText}>Scenario {currentIndex + 1} of {items.length}</Text>
      
      <View style={styles.card}>
        <Text style={styles.prompt}>{currentItem.scenario}</Text>
        <Text style={[styles.prompt, { color: '#aaa', fontSize: 14 }]}>{currentItem.financialFacts}</Text>
        
        <View style={styles.referenceBox}>
          <Text style={styles.referenceLabel}>Reference Point Provided:</Text>
          <Text style={styles.referenceValue}>${currentItem.referencePrice.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.prompt}>What is your fair value estimate?</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput 
            style={styles.input}
            value={estimateStr}
            onChangeText={setEstimateStr}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#666"
          />
        </View>
        
        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.5 }]} onPress={handleNext} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Saving...' : 'Submit Estimate'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  progressText: { color: '#888', marginBottom: 16, fontSize: 14 },
  card: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 16 },
  prompt: { color: '#fff', fontSize: 16, marginBottom: 16, lineHeight: 24 },
  referenceBox: { backgroundColor: '#2A2A2A', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  referenceLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  referenceValue: { color: '#4A90E2', fontSize: 20, fontWeight: 'bold' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2A', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  currencySymbol: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 20, paddingVertical: 12 },
  btn: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { flex: 1, padding: 16, backgroundColor: '#121212', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24, textAlign: 'center' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statLabel: { color: '#aaa', fontSize: 16 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 16 },
  neutralText: { color: '#ccc', fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 16 }
});
