import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { updateHolding, getHoldingRef } from '@/repositories';
import { Holding } from '@/types/models';
import { getDoc } from 'firebase/firestore';
import HoldingForm, { HoldingFormValues } from '@/components/holdings/HoldingForm';

export default function EditHoldingScreen() {
  const { portfolioId, holdingId } = useLocalSearchParams<{ portfolioId: string, holdingId: string }>();
  const [initialValues, setInitialValues] = useState<HoldingFormValues>();
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchHolding = async () => {
      try {
        const docSnap = await getDoc(getHoldingRef(user!.uid, portfolioId, holdingId));
        if (docSnap.exists()) {
          const data = docSnap.data() as Holding;
          setInitialValues({
            ticker: data.ticker,
            quantity: data.quantity,
            avgCost: data.avgCost,
          });
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to load holding');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchHolding();
  }, [user, portfolioId, holdingId]);

  const handleSave = async (values: HoldingFormValues) => {
    await updateHolding(user!.uid, portfolioId, holdingId, values);
    router.back();
  };

  if (initialLoading) {
    return <View style={styles.center}><ActivityIndicator color="#fff" /></View>;
  }

  return (
    <HoldingForm
      submitLabel="Save Changes"
      onSubmit={handleSave}
      initialValues={initialValues ? {
        ticker: initialValues.ticker,
        quantity: initialValues.quantity.toString(),
        avgCost: initialValues.avgCost.toString(),
      } : undefined}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
