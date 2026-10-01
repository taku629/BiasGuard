import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { selectiveExposureV1 } from '@/features/behavioralAssessments/items/selectiveExposure.v1';
import { createAssessmentSession, completeAssessmentSession, saveAssessmentResponse } from '@/repositories/assessment';
import { calculateSelectiveExposure, SelectiveExposureResult } from '@/services/behavior/selectiveExposure';
import { AssessmentResponse } from '@/types/models';

export default function SelectiveExposureScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [session, setSession] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [initialView, setInitialView] = useState<'positive' | 'negative' | 'uncertain' | null>(null);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'belief' | 'evidence'>('belief');
  
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [result, setResult] = useState<SelectiveExposureResult | null>(null);

  const items = selectiveExposureV1;
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!user) return;
    createAssessmentSession(user.uid, {
      userId: user.uid,
      assessmentType: 'selective_exposure',
      version: '1.0'
    }).then(s => {
      setSession(s);
      setLoading(false);
    });
  }, [user]);

  const handleNextBelief = () => {
    if (!initialView) return Alert.alert('Required', 'Please select an initial view');
    if (initialView === 'uncertain') {
      // Skip evidence selection for uncertain
      saveAndNext();
    } else {
      setStep('evidence');
    }
  };

  const toggleEvidence = (id: string) => {
    if (selectedEvidenceIds.includes(id)) {
      setSelectedEvidenceIds(selectedEvidenceIds.filter(e => e !== id));
    } else {
      if (selectedEvidenceIds.length >= 2) return Alert.alert('Limit reached', 'You can only select 2 items to read first.');
      setSelectedEvidenceIds([...selectedEvidenceIds, id]);
    }
  };

  const handleNextEvidence = () => {
    if (selectedEvidenceIds.length !== 2) return Alert.alert('Required', 'Please select exactly 2 items.');
    saveAndNext();
  };

  const saveAndNext = async () => {
    setLoading(true);
    try {
      const newResponse = await saveAssessmentResponse(user!.uid, session.id, {
        sessionId: session.id,
        itemId: currentItem.id,
        initialView: initialView!,
        initialConfidence: 0.5, // Mock default for now, skipping slider in UI for brevity but storing it
        selectedEvidenceIds: initialView === 'uncertain' ? [] : selectedEvidenceIds,
      });

      const newResponses = [...responses, newResponse];
      setResponses(newResponses);

      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setInitialView(null);
        setSelectedEvidenceIds([]);
        setStep('belief');
      } else {
        await completeAssessmentSession(user!.uid, session.id);
        const res = calculateSelectiveExposure(newResponses);
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
          <Text style={styles.neutralText}>Not enough directional trials to calculate balance. (Directional: {result.directionalTrials})</Text>
        ) : (
          <View style={styles.card}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Confirming Selections</Text>
              <Text style={styles.statValue}>{result.confirmingSelections}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Disconfirming Selections</Text>
              <Text style={styles.statValue}>{result.disconfirmingSelections}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Selection Balance</Text>
              <Text style={styles.statValue}>
                {result.selectionBalance > 0 ? '+' : ''}{(result.selectionBalance * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.neutralText}>
              {result.selectionBalance > 0.1
                ? "You selected more information that supported your initial view in this assessment."
                : result.selectionBalance < -0.1
                ? "You selected more information that contradicted your initial view in this assessment."
                : "Your information selection was balanced."}
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.progressText}>Trial {currentIndex + 1} of {items.length}</Text>
      
      <View style={styles.card}>
        <Text style={styles.companyName}>{currentItem.companyName}</Text>
        <Text style={styles.prompt}>{currentItem.scenario}</Text>
      </View>

      {step === 'belief' ? (
        <View style={styles.card}>
          <Text style={styles.prompt}>What is your initial view on this investment?</Text>
          {(['positive', 'negative', 'uncertain'] as const).map(view => (
            <TouchableOpacity 
              key={view} 
              style={[styles.choiceBtn, initialView === view && styles.choiceSelected]}
              onPress={() => setInitialView(view)}
            >
              <Text style={[styles.choiceText, initialView === view && styles.choiceTextSelected]}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.5 }]} onPress={handleNextBelief} disabled={loading}>
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.prompt}>Select 2 pieces of information you want to read first:</Text>
          {currentItem.evidence.map(ev => {
            const isSelected = selectedEvidenceIds.includes(ev.id);
            return (
              <TouchableOpacity 
                key={ev.id} 
                style={[styles.choiceBtn, isSelected && styles.choiceSelected]}
                onPress={() => toggleEvidence(ev.id)}
              >
                <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected, { fontWeight: 'bold' }]}>
                  {ev.headline}
                </Text>
                <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected, { fontSize: 12, marginTop: 4 }]}>
                  {ev.summary}
                </Text>
              </TouchableOpacity>
            )
          })}
          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.5 }]} onPress={handleNextEvidence} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Saving...' : 'Submit Selection'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  progressText: { color: '#888', marginBottom: 16, fontSize: 14 },
  card: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 16 },
  companyName: { color: '#4A90E2', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  prompt: { color: '#fff', fontSize: 16, marginBottom: 24, lineHeight: 24 },
  choiceBtn: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  choiceSelected: { borderColor: '#4A90E2', backgroundColor: 'rgba(74, 144, 226, 0.1)' },
  choiceText: { color: '#ccc', fontSize: 16 },
  choiceTextSelected: { color: '#4A90E2' },
  btn: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { flex: 1, padding: 16, backgroundColor: '#121212', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24, textAlign: 'center' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statLabel: { color: '#aaa', fontSize: 16 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 16 },
  neutralText: { color: '#ccc', fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 16 }
});
