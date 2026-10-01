import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { auth } from '@/config/firebase';

export default function AppLayout() {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Route protection in root _layout.tsx will redirect to login
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1E1E1E' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#1E1E1E', borderTopColor: '#333' },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
              <Text style={{ color: '#ff4444', fontWeight: 'bold' }}>Logout</Text>
            </TouchableOpacity>
          )
        }} 
      />
      <Tabs.Screen 
        name="portfolios" 
        options={{ title: 'Portfolios' }} 
      />
      <Tabs.Screen 
        name="behavior" 
        options={{ title: 'Behavior' }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ title: 'Settings' }} 
      />

      {/* Hide nested group layouts from the tab bar */}
      <Tabs.Screen name="portfolio" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
