import { Stack } from 'expo-router';

export default function BehaviorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1E1E1E' },
        headerTintColor: '#fff',
        contentStyle: { backgroundColor: '#121212' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Behavioral Insights', headerShown: false }} />
      <Stack.Screen name="assessment" options={{ title: 'Behavioral Assessment' }} />
      <Stack.Screen name="reference-price" options={{ title: 'Reference Price Effect' }} />
      <Stack.Screen name="selective-exposure" options={{ title: 'Selective Exposure' }} />
    </Stack>
  );
}
