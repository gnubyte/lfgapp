import { StyleSheet, Pressable, Modal } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ModalScreen() {
  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <Pressable 
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="xmark" size={24} color="#007AFF" />
          </Pressable>
          <ThemedText type="title">Modal Example</ThemedText>
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedText type="subtitle">This is a Modal Screen</ThemedText>
          <ThemedText>
            Modals are great for presenting content that should be focused on without 
            losing context of the underlying screen.
          </ThemedText>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Modal Features:</ThemedText>
            <ThemedText>• Slides up from bottom</ThemedText>
            <ThemedText>• Can be dismissed by swiping down</ThemedText>
            <ThemedText>• Maintains navigation context</ThemedText>
            <ThemedText>• Perfect for forms and details</ThemedText>
          </ThemedView>

          <Pressable 
            style={styles.button}
            onPress={() => router.push('/settings')}
          >
            <IconSymbol name="gear" size={20} color="white" />
            <ThemedText style={styles.buttonText}>Go to Settings</ThemedText>
          </Pressable>

          <Pressable 
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.secondaryButtonText}>Close Modal</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    marginRight: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
