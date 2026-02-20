import { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import Screen from '../components/Screen';
import { addContact, fetchContacts } from '../api/endpoints';

export default function ContactsScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);

  const load = () => fetchContacts().then((result) => setContacts(result.contacts));
  useEffect(() => {
    load();
  }, []);

  const onAdd = async () => {
    await addContact({ phoneNumber });
    setPhoneNumber('');
    load();
    Toast.show({ type: 'success', text1: 'Contact added' });
  };

  return (
    <Screen title="Contacts">
      <TextInput placeholder="+15551234567" value={phoneNumber} onChangeText={setPhoneNumber} style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8 }} />
      <Button title="Add Contact" onPress={onAdd} />
      <Text>Total contacts: {contacts.length}</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 }}><Text>{item.phoneNumber}</Text></View>}
      />
    </Screen>
  );
}
