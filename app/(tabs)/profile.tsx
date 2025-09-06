import { StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText>Welcome to your profile page!</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Navigation Examples</ThemedText>
        
        <Pressable 
          style={styles.button}
          onPress={() => router.push('/settings')}
        >
          <IconSymbol name="gear" size={20} color="#007AFF" />
          <ThemedText style={styles.buttonText}>Go to Settings</ThemedText>
        </Pressable>

        <Pressable 
          style={styles.button}
          onPress={() => router.push('/modal')}
        >
          <IconSymbol name="square.and.arrow.up" size={20} color="#007AFF" />
          <ThemedText style={styles.buttonText}>Open Modal</ThemedText>
        </Pressable>

        <Pressable 
          style={styles.button}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left" size={20} color="#007AFF" />
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">User Info</ThemedText>
        <ThemedText>Name: {user?.full_name || `${user?.first_name} ${user?.last_name}`}</ThemedText>
        <ThemedText>Username: {user?.username}</ThemedText>
        <ThemedText>Email: {user?.email}</ThemedText>
        <ThemedText>Member since: January 2024</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <Pressable 
          style={styles.dangerButton}
          onPress={handleLogout}
        >
          <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
          <ThemedText style={styles.dangerText}>Sign Out</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    marginTop: 10,
    gap: 10,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
