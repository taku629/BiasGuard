import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { subscribeHoldings, getPortfolioRef, updatePortfolio, fetchTransactions } from '@/repositories';
import { Holding, Portfolio } from '@/types/models';
import { onSnapshot } from 'firebase/firestore';
import { RiskService } from '@/services/risk/engine';
import { marketDataRepository } from '@/services/marketData/MarketDataRepository';
import { RiskMetrics } from '@/services/risk/types';
import { DispositionEngine } from '@/services/behavior/disposition';
import { DispositionResult } from '@/services/behavior/types';
import { formatNumber, formatCurrency, formatPercent } from '@/utils/format';

const riskService = new RiskService(marketDataRepository);
const dispositionEngine = new DispositionEngine(marketDataRepository);

export default function PortfolioDetailsScreen() {
  const { portfolioId } = useLocalSearchParams<{ portfolioId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [calculatingRisk, setCalculatingRisk] = useState(false);

  const [disposition, setDisposition] = useState<DispositionResult | null>(null);
  const [txCount, setTxCount] = useState(0);

  // Fetch Portfolio details
  useEffect(() => {
    if (!user || !portfolioId) return;
    const unsubscribe = onSnapshot(getPortfolioRef(user.uid, portfolioId), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Portfolio;
        setPortfolio(data);
        setEditName(data.name);
      } else {
        Alert.alert('Error', 'Portfolio not found', [{ text: 'OK', onPress: () => router.back() }]);
      }
    });
    return () => unsubscribe();
  }, [user, portfolioId]);

  // Fetch Holdings & Transactions
  useEffect(() => {
    if (!user || !portfolioId) return;
    setLoading(true);
    const unsubscribe = subscribeHoldings(user.uid, portfolioId, async (data) => {
      setHoldings(data);
      setLoading(false);
      
      try {
        const txs = await fetchTransactions(user.uid, portfolioId);
        setTxCount(txs.length);
        if (txs.length > 0) {
          const res = await dispositionEngine.analyze(txs);
          setDisposition(res);
        } else {
          setDisposition(null);
        }
      } catch (e) {
        console.error(e);
      }
    });
    return () => unsubscribe();
  }, [user, portfolioId]);

  // Calculate Risk
  useEffect(() => {
    if (holdings.length === 0) {
      setRiskMetrics(null);
      return;
    }
    const calc = async () => {
      setCalculatingRisk(true);
      try {
        const metrics = await riskService.calculateCurrentCompositionRisk(holdings);
        setRiskMetrics(metrics);
      } catch (err: any) {
        console.log('Risk calculation error:', err.message);
        setRiskMetrics(null);
      } finally {
        setCalculatingRisk(false);
      }
    };
    calc();
  }, [holdings]);

  const renderRiskMetrics = () => {
    return (
      <View style={{ marginBottom: 16 }}>
        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/(app)/portfolio/${portfolioId}/transaction/new`)}
          >
            <Text style={styles.actionBtnText}>Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtnSecondary}
            onPress={() => router.push(`/(app)/portfolio/${portfolioId}/transactions`)}
          >
            <Text style={styles.actionBtnTextSecondary}>History ({txCount})</Text>
          </TouchableOpacity>
        </View>

        {/* Behavioral Panel */}
        <View style={styles.behaviorCard}>
          <Text style={styles.riskHeader}>Behavioral Indicator (Disposition Effect)</Text>
          {!disposition ? (
            <Text style={{ color: '#aaa', fontStyle: 'italic', fontSize: 12 }}>
              Add transactions to unlock behavioral insights.
            </Text>
          ) : disposition.status === 'insufficient_data' ? (
            <Text style={{ color: '#aaa', fontStyle: 'italic', fontSize: 12 }}>
              Not enough trading history yet. Needs 5+ gain/loss opportunities.
            </Text>
          ) : (
            <View style={styles.riskGrid}>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Disposition Effect</Text>
                <Text style={styles.riskValue}>{formatNumber(disposition.dispositionEffect)}</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>PGR / PLR</Text>
                <Text style={styles.riskValue}>{formatNumber(disposition.pgr)} / {formatNumber(disposition.plr)}</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Loss Reluctance</Text>
                <Text style={styles.riskValue}>{formatNumber(disposition.lossRealizationReluctance)}</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Evidence (Opps)</Text>
                <Text style={styles.riskValue}>{disposition.gainOpportunities}G / {disposition.lossOpportunities}L</Text>
              </View>
            </View>
          )}
        </View>

        {/* Risk Panel */}
        <View style={styles.riskCard}>
          <Text style={styles.riskHeader}>Risk Dashboard <Text style={{color: '#F5A623', fontSize: 12, fontWeight: 'normal'}}>⚠️ Mock Data</Text></Text>
          {holdings.length === 0 ? (
             <Text style={{ color: '#aaa', fontStyle: 'italic', fontSize: 12 }}>
               Add holdings to unlock risk metrics.
             </Text>
          ) : calculatingRisk ? (
             <ActivityIndicator color="#4A90E2" style={{ margin: 16 }} />
          ) : riskMetrics ? (
            <View style={styles.riskGrid}>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Volatility</Text>
                <Text style={styles.riskValue}>{formatPercent(riskMetrics.volatility)}</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Sharpe</Text>
                <Text style={styles.riskValue}>{formatNumber(riskMetrics.sharpeRatio)}</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Max DD</Text>
                <Text style={styles.riskValue}>{formatPercent(riskMetrics.maxDrawdown)}</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Beta</Text>
                <Text style={styles.riskValue}>{formatNumber(riskMetrics.beta)}</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Benchmark</Text>
                <Text style={[styles.riskValue, {fontSize: 14}]}>{riskMetrics.benchmark}</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Data Source</Text>
                <Text style={[styles.riskValue, {fontSize: 14}]}>Mock API</Text>
              </View>
              <View style={styles.riskItem}>
                <Text style={styles.riskLabel}>Data Quality</Text>
                <Text style={[styles.riskValue, {fontSize: 14}]}>{riskMetrics.priceAdjustment}</Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: '#ff4444', fontSize: 12 }}>
               Error calculating risk metrics.
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (!portfolio) {
    return <View style={styles.center}><ActivityIndicator color="#fff" /></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: portfolio.name }} />
      
      <View style={styles.header}>
        {isEditingName ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.nameInput}
              value={editName}
              onChangeText={setEditName}
              autoFocus
              onBlur={async () => {
                if (editName.trim()) await updatePortfolio(user!.uid, portfolioId, { name: editName.trim() });
                setIsEditingName(false);
              }}
            />
          </View>
        ) : (
          <View style={styles.editRow}>
            <Text style={styles.title}>{portfolio.name}</Text>
            <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={holdings}
          keyExtractor={item => item.id!}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderRiskMetrics}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No holdings yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.ticker}>{item.ticker}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Quantity</Text>
                  <Text style={styles.statValue}>{formatNumber(item.quantity)}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Avg Cost</Text>
                  <Text style={styles.statValue}>{formatCurrency(item.avgCost)}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: '#1E1E1E' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', flex: 1 },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nameInput: { backgroundColor: '#2A2A2A', color: '#fff', padding: 8, borderRadius: 4, flex: 1, marginRight: 8, fontSize: 20 },
  editBtn: { padding: 8 },
  editBtnText: { color: '#4A90E2' },
  list: { padding: 16, paddingBottom: 80 },
  actionBtn: { flex: 1, backgroundColor: '#4A90E2', padding: 12, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },
  actionBtnSecondary: { flex: 1, backgroundColor: '#2A2A2A', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#4A90E2' },
  actionBtnTextSecondary: { color: '#4A90E2', fontWeight: 'bold' },
  riskCard: { backgroundColor: '#1A2A3A', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A4A6A' },
  behaviorCard: { backgroundColor: '#2A1A3A', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#4A2A6A' },
  riskHeader: { color: '#4A90E2', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  riskGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  riskItem: { width: '45%' },
  riskLabel: { color: '#8AB4F8', fontSize: 12, marginBottom: 4 },
  riskValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#2A2A2A', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  ticker: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1 },
  statLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#aaa', fontSize: 16 },
});
