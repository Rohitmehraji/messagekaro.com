import { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import Screen from '../components/Screen';
import { createDevice, fetchDevices } from '../api/endpoints';

export default function DevicesScreen() {
  const [name, setName] = useState('');
  const [deviceId, setDeviceId] = useState(`dev-${Date.now()}`);
  const [devices, setDevices] = useState<any[]>([]);

  const loadDevices = () => fetchDevices().then(setDevices);
  useEffect(() => {
    loadDevices();
  }, []);

  const onAdd = async () => {
    if (!name || !deviceId) return;
    await createDevice({ name, deviceId });
    setName('');
    setDeviceId(`dev-${Date.now()}`);
    loadDevices();
    Toast.show({ type: 'success', text1: 'Device added' });
  };

  return (
    <Screen title="Devices">
      <TextInput placeholder="Device name" value={name} onChangeText={setName} style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8 }} />
      <TextInput placeholder="Device ID" value={deviceId} onChangeText={setDeviceId} style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8 }} />
      <Button title="Add Device" onPress={onAdd} />
      <FlatList
        data={devices}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 }}><Text>{item.name}</Text><Text>{item.deviceId}</Text></View>}
      />
    </Screen>
  );
}
