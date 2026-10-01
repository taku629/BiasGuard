import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useBilling } from '@/contexts/BillingContext';
import { Portfolio } from '@/types/models';
import { subscribePortfolios, deletePortfolio } from '@/repositories';
import { Link, useRouter } from 'expo-router';

export default function PortfoliosScreen() {
  const { user } = useAuth();
  const { status: billingStatus } = useBilling();
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    const unsubscribe = subscribePortfolios(user.uid, (data) => {
      setPortfolios(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = (portfolioId: string) => {
    Alert.alert('Delete Portfolio', 'Are you sure you want to delete this portfolio? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePortfolio(user!.uid, portfolioId);
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        }
      }
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={portfolios}
        keyExtractor={item => item.id!}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: '#2A1A3A', borderColor: '#4A2A6A', borderWidth: 1 }]}
            onPress={() => router.push('/(app)/behavior/')}
          >
            <Text style={{color: '#4A90E2', fontSize: 18, fontWeight: 'bold'}}>Behavioral Insights</Text>
            <Text style={{color: '#aaa', marginTop: 4}}>Check your behavioral calibration</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No portfolios found.</Text>
            <Text style={styles.emptySubText}>Create your first portfolio to get started.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/(app)/portfolio/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardDate}>
              Created: {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Link href={billingStatus !== 'pro' && portfolios.length >= 1 ? "/(app)/paywall" : "/(app)/portfolio/new"} asChild>
        <TouchableOpacity style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDate: {
    color: '#aaa',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4A90E2',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
