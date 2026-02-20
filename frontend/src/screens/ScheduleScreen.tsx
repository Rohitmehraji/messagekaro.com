import { useMemo, useState } from 'react';
import { Button, Text, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import Screen from '../components/Screen';
import { scheduleSms, sendSmsNow } from '../api/endpoints';
import { getWordCount } from '../utils/word-count';

export default function ScheduleScreen() {
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16));
  const wordCount = useMemo(() => getWordCount(message), [message]);
  const tooLong = wordCount > 20;

  const onSendNow = async () => {
    if (tooLong) return;
    await sendSmsNow({ message });
    Toast.show({ type: 'success', text1: 'SMS sent' });
  };

  const onSchedule = async () => {
    if (tooLong) return;
    await scheduleSms({ message, scheduledTime: new Date(scheduledTime).toISOString() });
    Toast.show({ type: 'success', text1: 'Campaign scheduled' });
  };

  return (
    <Screen title="Schedule SMS">
      <TextInput
        placeholder="Type message (max 20 words)"
        multiline
        value={message}
        onChangeText={setMessage}
        style={{ backgroundColor: '#fff', borderRadius: 8, minHeight: 120, padding: 10 }}
      />
      <Text style={{ color: tooLong ? '#dc2626' : '#6b7280' }}>Word count: {wordCount}/20</Text>
      <TextInput
        placeholder="Scheduled ISO time"
        value={scheduledTime}
        onChangeText={setScheduledTime}
        style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10 }}
      />
      <Button title="Send Instantly" onPress={onSendNow} disabled={tooLong || !message.trim()} />
      <Button title="Schedule Send" onPress={onSchedule} disabled={tooLong || !message.trim()} />
    </Screen>
  );
}
