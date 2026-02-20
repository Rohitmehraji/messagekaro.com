import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { fetchStats } from '../api/endpoints';

export default function DashboardScreen() {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <Screen title="Dashboard">
      {loading ? <ActivityIndicator /> : null}
      {data ? (
        <View style={styles.grid}>
          {[
            ['Total SMS', data.totalSms],
            ['Sent', data.totalSentSms],
            ['Failed', data.failedSms],
            ['Pending', data.pendingSms],
            ['Scheduled', data.scheduledSms]
          ].map(([label, value]) => (
            <View key={String(label)} style={styles.card}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{String(value)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 10 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10 },
  label: { color: '#6b7280' },
  value: { fontSize: 22, fontWeight: '700', color: '#111827' }
});
