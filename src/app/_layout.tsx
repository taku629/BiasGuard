import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { BillingProvider } from '@/contexts/BillingContext';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to app
      router.replace('/(app)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <BillingProvider>
        <StatusBar style="light" />
        <InitialLayout />
      </BillingProvider>
    </AuthProvider>
  );
}
