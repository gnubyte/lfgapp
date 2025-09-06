import React from 'react';
import { StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardScreen() {
  const { user, logout, refreshToken } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshToken();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshToken]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const quickActions = [
    {
      title: 'Find Groups',
      description: 'Discover gaming groups',
      icon: 'person.3.fill',
      color: '#007AFF',
      onPress: () => router.push('/groups'),
    },
    {
      title: 'My Groups',
      description: 'View your groups',
      icon: 'person.2.fill',
      color: '#34C759',
      onPress: () => router.push('/my-groups'),
    },
    {
      title: 'Calendar',
      description: 'Upcoming events',
      icon: 'calendar',
      color: '#FF9500',
      onPress: () => router.push('/calendar'),
    },
    {
      title: 'Messages',
      description: 'Chat with friends',
      icon: 'message.fill',
      color: '#FF3B30',
      onPress: () => router.push('/messages'),
    },
    {
      title: 'Profile',
      description: 'Manage your profile',
      icon: 'person.circle.fill',
      color: '#5856D6',
      onPress: () => router.push('/profile'),
    },
    {
      title: 'Settings',
      description: 'App settings',
      icon: 'gear',
      color: '#8E8E93',
      onPress: () => router.push('/settings'),
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        {/* Welcome Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome back, {user?.first_name || user?.username}!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Ready to find your next gaming adventure?
          </ThemedText>
        </ThemedView>

        {/* Quick Stats */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="subtitle" style={styles.statNumber}>0</ThemedText>
            <ThemedText style={styles.statLabel}>Groups</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="subtitle" style={styles.statNumber}>0</ThemedText>
            <ThemedText style={styles.statLabel}>Events</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="subtitle" style={styles.statNumber}>0</ThemedText>
            <ThemedText style={styles.statLabel}>Friends</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <ThemedView style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Pressable
                key={index}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <IconSymbol name={action.icon} size={24} color={action.color} />
                <ThemedText style={styles.actionTitle}>{action.title}</ThemedText>
                <ThemedText style={styles.actionDescription}>{action.description}</ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Recent Activity */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Activity
          </ThemedText>
          <ThemedView style={styles.activityCard}>
            <IconSymbol name="clock" size={20} color="#666" />
            <ThemedText style={styles.activityText}>
              No recent activity. Start by joining a group or creating an event!
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
          <ThemedText style={styles.logoutButtonText}>Sign Out</ThemedText>
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
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '47%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    gap: 10,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
