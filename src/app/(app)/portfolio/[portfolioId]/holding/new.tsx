import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { addHolding } from '@/repositories';
import HoldingForm, { HoldingFormValues } from '@/components/holdings/HoldingForm';

export default function NewHoldingScreen() {
  const { portfolioId } = useLocalSearchParams<{ portfolioId: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const handleSave = async (values: HoldingFormValues) => {
    await addHolding(user!.uid, portfolioId, values);
    router.back();
  };

  return (
    <HoldingForm
      submitLabel="Add Holding"
      onSubmit={handleSave}
      showPlaceholders
    />
  );
}
