import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { financialKnowledgeV1, AssessmentItem } from '@/features/behavioralAssessments/items/financialKnowledge.v1';
import { createAssessmentSession, completeAssessmentSession, saveAssessmentResponse } from '@/repositories/assessment';
import { calculateOverconfidence, OverconfidenceResult } from '@/services/behavior/overconfidence';
import { AssessmentResponse } from '@/types/models';
import { Timestamp } from 'firebase/firestore';

export default function AssessmentScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [session, setSession] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0.5); // 0.0 to 1.0
  const [loading, setLoading] = useState(true);
  
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [result, setResult] = useState<OverconfidenceResult | null>(null);

  const items = financialKnowledgeV1;
  const currentItem = items[currentIndex];

  useEffect(() => {
    if (!user) return;
    createAssessmentSession(user.uid, {
      userId: user.uid,
      assessmentType: 'financial_knowledge',
      version: '1.0'
    }).then(s => {
      setSession(s);
      setLoading(false);
    });
  }, [user]);

  const handleNext = async () => {
    if (!selectedChoice) {
      Alert.alert('Required', 'Please select an answer');
      return;
    }
    setLoading(true);
    try {
      const isCorrect = selectedChoice === currentItem.correctChoice;
      
      const newResponse = await saveAssessmentResponse(user!.uid, session.id, {
        sessionId: session.id,
        itemId: currentItem.id,
        answer: selectedChoice,
        confidence,
        correct: isCorrect
      });

      const newResponses = [...responses, newResponse];
      setResponses(newResponses);

      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedChoice(null);
        setConfidence(0.5);
      } else {
        // Finish
        await completeAssessmentSession(user!.uid, session.id);
        const res = calculateOverconfidence(newResponses);
        setResult(res);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save response');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.title}>Assessment Complete</Text>
        
        {result.signal.status === 'insufficient_data' ? (
          <Text style={styles.neutralText}>Not enough data to calculate calibration. (Answered: {result.questionCount})</Text>
        ) : (
          <View style={styles.card}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{(result.accuracy * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average confidence</Text>
              <Text style={styles.statValue}>{(result.meanConfidence * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Calibration gap</Text>
              <Text style={styles.statValue}>{(result.calibrationGap * 100 > 0 ? '+' : '')}{(result.calibrationGap * 100).toFixed(0)}%</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.neutralText}>
              {result.calibrationGap > 0.05 
                ? "Your confidence was higher than your measured accuracy in this assessment."
                : result.calibrationGap < -0.05 
                ? "Your measured accuracy was higher than your expressed confidence in this assessment."
                : "Your confidence closely matched your measured accuracy in this assessment."}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Return to Insights</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !session) return <View style={styles.center}><ActivityIndicator color="#4A90E2" /></View>;

  if (result) return renderResult();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.progressText}>Question {currentIndex + 1} of {items.length}</Text>
      
      <View style={styles.card}>
        <Text style={styles.prompt}>{currentItem.prompt}</Text>
        
        {currentItem.choices.map(choice => (
          <TouchableOpacity 
            key={choice} 
            style={[styles.choiceBtn, selectedChoice === choice && styles.choiceSelected]}
            onPress={() => setSelectedChoice(choice)}
          >
            <Text style={[styles.choiceText, selectedChoice === choice && styles.choiceTextSelected]}>
              {choice}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.confidenceLabel}>How confident are you in this answer?</Text>
        <Text style={styles.confidenceValue}>{(confidence * 100).toFixed(0)}%</Text>
        
        <View style={styles.sliderMock}>
          {/* We use a simple 0-100 stepper for MVP since Expo doesn't have a built-in Slider in core, 
              or we can use simple preset buttons */}
          <View style={styles.presets}>
            {[0, 0.25, 0.5, 0.75, 1].map(val => (
              <TouchableOpacity 
                key={val} 
                style={[styles.presetBtn, confidence === val && styles.presetSelected]}
                onPress={() => setConfidence(val)}
              >
                <Text style={styles.presetText}>{val * 100}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.btn, loading && { opacity: 0.5 }]} 
        onPress={handleNext} 
        disabled={loading}
      >
        <Text style={styles.btnText}>{loading ? 'Saving...' : 'Next'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  progressText: { color: '#888', marginBottom: 16, fontSize: 14 },
  card: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 16 },
  prompt: { color: '#fff', fontSize: 18, marginBottom: 24, lineHeight: 24 },
  choiceBtn: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  choiceSelected: { borderColor: '#4A90E2', backgroundColor: 'rgba(74, 144, 226, 0.1)' },
  choiceText: { color: '#ccc', fontSize: 16 },
  choiceTextSelected: { color: '#4A90E2', fontWeight: 'bold' },
  confidenceLabel: { color: '#fff', fontSize: 16, marginBottom: 8 },
  confidenceValue: { color: '#4A90E2', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  sliderMock: { marginBottom: 8 },
  presets: { flexDirection: 'row', justifyContent: 'space-between' },
  presetBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#333' },
  presetSelected: { backgroundColor: '#4A90E2' },
  presetText: { color: '#fff', fontSize: 12 },
  btn: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  resultContainer: { flex: 1, padding: 16, backgroundColor: '#121212', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24, textAlign: 'center' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statLabel: { color: '#aaa', fontSize: 16 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 16 },
  neutralText: { color: '#ccc', fontSize: 14, lineHeight: 20, textAlign: 'center' }
});
