import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { createPortfolio } from '@/repositories';

export default function NewPortfolioScreen() {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Portfolio name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createPortfolio(user!.uid, { name: name.trim() });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Portfolio Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Retirement Fund"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            autoFocus
            accessibilityLabel="Portfolio Name Input"
            accessibilityRole="text"
          />
          
          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleCreate}
            disabled={isSubmitting}
            accessibilityLabel="Create Portfolio Button"
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Create Portfolio</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1 },
  scrollContent: { padding: 24 },
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
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
