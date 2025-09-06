import { StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={24} color="#007AFF" />
        </Pressable>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Account</ThemedText>
        
        <Pressable style={styles.settingItem}>
          <IconSymbol name="person" size={20} color="#666" />
          <ThemedText style={styles.settingText}>Edit Profile</ThemedText>
          <IconSymbol name="chevron.right" size={16} color="#666" />
        </Pressable>

        <Pressable style={styles.settingItem}>
          <IconSymbol name="envelope" size={20} color="#666" />
          <ThemedText style={styles.settingText}>Email Settings</ThemedText>
          <IconSymbol name="chevron.right" size={16} color="#666" />
        </Pressable>

        <Pressable style={styles.settingItem}>
          <IconSymbol name="lock" size={20} color="#666" />
          <ThemedText style={styles.settingText}>Privacy & Security</ThemedText>
          <IconSymbol name="chevron.right" size={16} color="#666" />
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Appearance</ThemedText>
        
        <Pressable style={styles.settingItem}>
          <IconSymbol name="moon" size={20} color="#666" />
          <ThemedText style={styles.settingText}>Dark Mode</ThemedText>
          <IconSymbol name="chevron.right" size={16} color="#666" />
        </Pressable>

        <Pressable style={styles.settingItem}>
          <IconSymbol name="textformat" size={20} color="#666" />
          <ThemedText style={styles.settingText}>Font Size</ThemedText>
          <IconSymbol name="chevron.right" size={16} color="#666" />
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">About</ThemedText>
        
        <Pressable style={styles.settingItem}>
          <IconSymbol name="info.circle" size={20} color="#666" />
          <ThemedText style={styles.settingText}>App Version</ThemedText>
          <ThemedText style={styles.settingValue}>1.0.0</ThemedText>
        </Pressable>

        <Pressable style={styles.settingItem}>
          <IconSymbol name="questionmark.circle" size={20} color="#666" />
          <ThemedText style={styles.settingText}>Help & Support</ThemedText>
          <IconSymbol name="chevron.right" size={16} color="#666" />
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.section}>
        <Pressable 
          style={styles.dangerButton}
          onPress={() => {
            // Handle logout
            router.replace('/(tabs)');
          }}
        >
          <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
          <ThemedText style={styles.dangerText}>Sign Out</ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  section: {
    marginTop: 20,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    margin: 20,
    gap: 10,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
