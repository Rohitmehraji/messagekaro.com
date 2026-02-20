import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Screen({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48, backgroundColor: '#f6f8fb' },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 12 },
  content: { gap: 12 }
});
