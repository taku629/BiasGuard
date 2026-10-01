import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { mapSignalsToDashboard, RawSignalsMap } from '../../../features/behavior/mapping';
import { MARKET_DATA_MODE } from '../../../config/env';
import { useBilling } from '@/contexts/BillingContext';

export default function BehaviorIndexScreen() {
  const router = useRouter();
  const { status: billingStatus } = useBilling();
  const isPro = billingStatus === 'pro';

  // Mock data to demonstrate the dashboard
  const mockRawData: RawSignalsMap = {
    disposition_effect: { rawValue: 70, status: 'sufficient', evidenceCount: 12 },
    loss_realization_reluctance: { rawValue: 85, status: 'sufficient', evidenceCount: 8 },
    overconfidence_calibration: { rawValue: 40, status: 'sufficient', evidenceCount: 3 },
    confirmation_selective_exposure: { rawValue: 50, status: 'insufficient_data', evidenceCount: 1 },
  };

  const signals = mapSignalsToDashboard(mockRawData);

  const renderRadarChart = () => {
    const size = 300;
    const center = size / 2;
    const radius = size * 0.35;
    
    // Only plot points that have sufficient data
    const validSignals = signals.map((s, i) => {
      const angle = (Math.PI * 2 * i) / signals.length - Math.PI / 2;
      return { ...s, angle, index: i };
    });

    const pathPoints = validSignals
      .filter(s => s.status === 'sufficient' && (isPro || s.type === 'overconfidence_calibration'))
      .map(s => {
        const r = (s.severity / 100) * radius;
        return `${center + r * Math.cos(s.angle)},${center + r * Math.sin(s.angle)}`;
      }).join(' ');

    return (
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {/* Web/Radar Grid */}
          {[1, 0.75, 0.5, 0.25].map((scale, idx) => (
            <Polygon
              key={`grid-${idx}`}
              points={signals.map((_, i) => {
                const angle = (Math.PI * 2 * i) / signals.length - Math.PI / 2;
                return `${center + radius * scale * Math.cos(angle)},${center + radius * scale * Math.sin(angle)}`;
              }).join(' ')}
              stroke="#333"
              strokeWidth="1"
              fill="none"
            />
          ))}
          
          {/* Axes */}
          {signals.map((_, i) => {
            const angle = (Math.PI * 2 * i) / signals.length - Math.PI / 2;
            return (
              <Line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(angle)}
                y2={center + radius * Math.sin(angle)}
                stroke="#333"
                strokeWidth="1"
              />
            );
          })}

          {/* Data Polygon */}
          {pathPoints.length > 0 && (
            <Polygon
              points={pathPoints}
              fill="rgba(74, 144, 226, 0.3)"
              stroke="#4A90E2"
              strokeWidth="2"
            />
          )}

          {/* Labels and Dots */}
          {validSignals.map((s) => {
            const r = s.status === 'sufficient' ? (s.severity / 100) * radius : 0;
            const x = center + r * Math.cos(s.angle);
            const y = center + r * Math.sin(s.angle);
            
            const labelR = radius * 1.25;
            const labelX = center + labelR * Math.cos(s.angle);
            const labelY = center + labelR * Math.sin(s.angle);

            return (
              <React.Fragment key={`point-${s.type}`}>
                {s.status === 'sufficient' && (isPro || s.type === 'overconfidence_calibration') && (
                  <Circle cx={x} cy={y} r="4" fill="#4A90E2" />
                )}
                <SvgText
                  x={labelX}
                  y={labelY}
                  fill="#ccc"
                  fontSize="10"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {s.name.split(' ')[0]}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Behavioral Insights</Text>

      {MARKET_DATA_MODE === 'mock' && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>⚠️ Using Mock Data Mode</Text>
        </View>
      )}

      {renderRadarChart()}
      
      <Text style={styles.subtitle}>Signal Details</Text>
      {signals.map(signal => {
        const isLocked = !isPro && signal.type !== 'overconfidence_calibration';
        if (isLocked) {
          return (
            <View key={signal.type} style={[styles.card, styles.lockedCard]}>
              <Text style={styles.cardTitle}>{signal.name}</Text>
              <Text style={styles.lockedText}>🔒 Upgrade to Pro to unlock</Text>
              <TouchableOpacity 
                style={styles.btn} 
                onPress={() => router.push('/(app)/paywall')}
              >
                <Text style={styles.btnText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <View key={signal.type} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{signal.name}</Text>
              <View style={[styles.badge, signal.status !== 'sufficient' && styles.badgeInactive]}>
                <Text style={styles.badgeText}>{signal.status === 'sufficient' ? `${Math.round(signal.severity)}/100` : signal.status}</Text>
              </View>
            </View>
            
            <Text style={styles.cardDesc}>{signal.explanation}</Text>
            
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Evidence: {signal.evidenceCount}</Text>
              <Text style={styles.stat}>Raw: {signal.rawMetric.toFixed(1)}</Text>
            </View>

            <TouchableOpacity 
              style={styles.btn} 
              onPress={() => router.push(`/(app)/behavior/explanation?signal=${signal.type}` as any)}
            >
              <Text style={styles.btnText}>Learn More</Text>
            </TouchableOpacity>
            
            {signal.type === 'overconfidence_calibration' && (
              <TouchableOpacity 
                style={[styles.btn, { marginTop: 8, backgroundColor: 'rgba(245, 166, 35, 0.2)' }]} 
                onPress={() => router.push('/(app)/behavior/assessment')}
              >
                <Text style={[styles.btnText, { color: '#F5A623' }]}>Take Assessment</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', margin: 16 },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  warningBanner: { backgroundColor: '#FFD700', padding: 12, marginHorizontal: 16, borderRadius: 8, marginBottom: 16 },
  warningText: { color: '#000', fontWeight: 'bold', textAlign: 'center' },
  chartContainer: { alignItems: 'center', marginVertical: 16 },
  card: { backgroundColor: '#1E1E1E', padding: 16, marginHorizontal: 16, borderRadius: 12, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A90E2', flex: 1 },
  badge: { backgroundColor: '#4A90E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeInactive: { backgroundColor: '#555' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardDesc: { color: '#ccc', marginBottom: 12, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  stat: { color: '#888', fontSize: 12 },
  btn: { backgroundColor: 'rgba(74, 144, 226, 0.2)', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#4A90E2', fontWeight: 'bold' },
  lockedCard: { opacity: 0.8, alignItems: 'center', justifyContent: 'center' },
  lockedText: { color: '#aaa', marginVertical: 12, fontSize: 14 }
});
