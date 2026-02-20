import { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { fetchLogs } from '../api/endpoints';

export default function LogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);

  const load = (status?: string) => fetchLogs({ status }).then(setLogs);

  useEffect(() => {
    load();
  }, []);

  return (
    <Screen title="SMS Logs">
      <Button title="All" onPress={() => load()} />
      <Button title="Sent" onPress={() => load('sent')} />
      <Button title="Failed" onPress={() => load('failed')} />
      <FlatList
        data={logs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <Text>{item.phoneNumber}</Text>
            <Text>Status: {item.status}</Text>
            <Text>{item.providerResponse || '-'}</Text>
          </View>
        )}
      />
    </Screen>
  );
}
