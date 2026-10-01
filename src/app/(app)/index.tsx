import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { getPortfoliosRef, getHoldingsRef, fetchTransactions } from '@/repositories';
import { getDocs } from 'firebase/firestore';
import { Holding, Transaction } from '@/types/models';
import { RiskService } from '@/services/risk/engine';
import { marketDataRepository } from '@/services/marketData/MarketDataRepository';
import { RiskMetrics } from '@/services/risk/types';
import { DispositionEngine } from '@/services/behavior/disposition';
import { DispositionResult } from '@/services/behavior/types';

const riskService = new RiskService(marketDataRepository);
const dispositionEngine = new DispositionEngine(marketDataRepository);

export default function HomeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [totalValue, setTotalValue] = useState(0);
  const [holdingsCount, setHoldingsCount] = useState(0);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  
  const [disposition, setDisposition] = useState<DispositionResult | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const portfoliosSnapshot = await getDocs(getPortfoliosRef(user.uid));
        
        let allHoldings: Holding[] = [];
        let allTransactions: Transaction[] = [];

        for (const doc of portfoliosSnapshot.docs) {
          const pid = doc.id;
          
          const holdingsSnap = await getDocs(getHoldingsRef(user.uid, pid));
          const pHoldings = holdingsSnap.docs.map(d => d.data() as Holding);
          allHoldings = allHoldings.concat(pHoldings);

          const txs = await fetchTransactions(user.uid, pid);
          allTransactions = allTransactions.concat(txs);
        }

        setHoldingsCount(allHoldings.length);

        // Calculate Total Value
        let value = 0;
        for (const h of allHoldings) {
          try {
            const priceData = await marketDataRepository.getLatestPrice(h.ticker);
            value += priceData.closePrice * h.quantity;
          } catch (e) {
            value += h.avgCost * h.quantity; // Fallback
          }
        }
        setTotalValue(value);

        // Risk Snapshot
        if (allHoldings.length > 0) {
          try {
            const risk = await riskService.calculateCurrentCompositionRisk(allHoldings);
            setRiskMetrics(risk);
          } catch (e) {
            console.error("Risk calc error:", e);
          }
        }

        // Behavior Snapshot (Disposition Effect)
        if (allTransactions.length > 0) {
          try {
            const disp = await dispositionEngine.analyze(allTransactions);
            setDisposition(disp);
          } catch (e) {
            console.error("Disposition calc error:", e);
          }
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <View style={styles.row}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Value</Text>
            <Text style={styles.statValue}>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Holdings</Text>
            <Text style={styles.statValue}>{holdingsCount}</Text>
          </View>
        </View>
      </View>

      {/* Risk Snapshot */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Risk Snapshot</Text>
        <Text style={styles.warningText}>⚠️ Using mock data</Text>
        
        {riskMetrics ? (
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Volatility</Text>
              <Text style={styles.gridValue}>{(riskMetrics.volatility * 100).toFixed(2)}%</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Sharpe Ratio</Text>
              <Text style={styles.gridValue}>
                {riskMetrics.sharpeRatio !== null ? riskMetrics.sharpeRatio.toFixed(2) : 'N/A'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Max Drawdown</Text>
              <Text style={styles.gridValue}>{(riskMetrics.maxDrawdown * 100).toFixed(2)}%</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Beta</Text>
              <Text style={styles.gridValue}>
                {riskMetrics.beta !== null ? riskMetrics.beta.toFixed(2) : 'N/A'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Add holdings to see risk metrics.</Text>
        )}
      </View>

      {/* Behavioral Snapshot */}
      <View style={[styles.card, { borderColor: '#4A2A6A', borderWidth: 1 }]}>
        <Text style={styles.cardTitle}>Behavioral Snapshot</Text>
        <View style={styles.behaviorList}>
          <View style={styles.behaviorRow}>
            <Text style={styles.behaviorLabel}>Disposition Effect</Text>
            <Text style={styles.behaviorStatus}>
              {disposition?.status === 'sufficient' ? 'Active Data' : 'Insufficient Data'}
            </Text>
          </View>
          <View style={styles.behaviorRow}>
            <Text style={styles.behaviorLabel}>Loss Reluctance</Text>
            <Text style={styles.behaviorStatus}>
              {disposition?.status === 'sufficient' ? 'Active Data' : 'Insufficient Data'}
            </Text>
          </View>
          <View style={styles.behaviorRow}>
            <Text style={styles.behaviorLabel}>Overconfidence Calibration</Text>
            <Text style={styles.behaviorStatus}>Pending Assessment</Text>
          </View>
          <View style={styles.behaviorRow}>
            <Text style={styles.behaviorLabel}>Selective Exposure</Text>
            <Text style={styles.behaviorStatus}>Pending Assessment</Text>
          </View>
          <View style={styles.behaviorRow}>
            <Text style={styles.behaviorLabel}>Reference Price Sensitivity</Text>
            <Text style={styles.behaviorStatus}>Pending Assessment</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8AB4F8',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  warningText: {
    color: '#F5A623',
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#4A90E2',
    fontSize: 24,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '45%',
  },
  gridLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  gridValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
  },
  behaviorList: {
    gap: 8,
  },
  behaviorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A1A3A',
  },
  behaviorLabel: {
    color: '#8AB4F8',
    fontSize: 14,
  },
  behaviorStatus: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
