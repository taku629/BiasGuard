import { Stack } from 'expo-router';

export default function PortfolioLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1E1E1E' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#121212' },
      }}
    >
      <Stack.Screen name="new" options={{ title: 'New Portfolio', presentation: 'modal' }} />
      <Stack.Screen name="[portfolioId]" options={{ title: 'Portfolio Details', headerShown: false }} />
    </Stack>
  );
}
