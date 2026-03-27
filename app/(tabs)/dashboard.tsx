import React from 'react';
import { StyleSheet, ScrollView, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedButton } from '@/components/ThemedButton';
import { FeatureCard } from '@/components/FeatureCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const quickActions = [
    {
      title: 'Find Groups',
      description: 'Browse available gaming groups',
      icon: 'magnifyingglass',
      color: 'groups' as const,
      onPress: () => router.push('/groups' as any),
    },
    {
      title: 'Create Group',
      description: 'Start your own gaming group',
      icon: 'plus.circle',
      color: 'events' as const,
      onPress: () => router.push('/create-group' as any),
    },
    {
      title: 'My Calendar',
      description: 'View your upcoming events',
      icon: 'calendar',
      color: 'calendar' as const,
      onPress: () => router.push('/calendar' as any),
    },
    {
      title: 'Messages',
      description: 'Chat with your groups',
      icon: 'message',
      color: 'messages' as const,
      onPress: () => router.push('/messages'),
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
          <ThemedText style={styles.welcomeText}>
            Welcome back, {user?.first_name || user?.username}!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Ready to find your next gaming adventure?
          </ThemedText>
          <ThemedText style={styles.userInfo}>
            Logged in as @{user?.username}
          </ThemedText>
        </ThemedView>

        {/* Quick Action Cards */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <FeatureCard
                key={index}
                icon={action.icon}
                title={action.title}
                description={action.description}
                buttonText={action.title}
                onPress={action.onPress}
                color={action.color}
              />
            ))}
          </View>
        </ThemedView>

        {/* Activity Stats */}
        <ThemedCard variant="activity">
          <View style={styles.activityHeader}>
            <IconSymbol name="waveform" size={20} color={Colors.primary.purple} />
            <ThemedText style={styles.activityTitle}>Your Activity</ThemedText>
          </View>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metric}>
              <ThemedText style={[styles.metricValue, { color: Colors.activity.groupsJoined }]}>
                2
              </ThemedText>
              <ThemedText style={styles.metricLabel}>Groups Joined</ThemedText>
            </View>
            <View style={styles.metric}>
              <ThemedText style={[styles.metricValue, { color: Colors.activity.eventsRSVP }]}>
                0
              </ThemedText>
              <ThemedText style={styles.metricLabel}>Events RSVP'd</ThemedText>
            </View>
            <View style={styles.metric}>
              <ThemedText style={[styles.metricValue, { color: Colors.activity.upcomingEvents }]}>
                0
              </ThemedText>
              <ThemedText style={styles.metricLabel}>Upcoming Events</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.activityMessage}>
            You're just getting started! Explore the platform to find your perfect gaming community.
          </ThemedText>

          <ThemedButton
            title="My Groups"
            onPress={() => router.push('/my-groups' as any)}
            variant="primary"
            size="small"
            style={styles.activityButton}
          />
        </ThemedCard>

        {/* Recent Activity */}
        <ThemedCard variant="activity">
          <View style={styles.activityHeader}>
            <IconSymbol name="bell" size={20} color={Colors.primary.yellow} />
            <ThemedText style={styles.activityTitle}>Recent Activity</ThemedText>
          </View>
          
          <View style={styles.emptyActivity}>
            <IconSymbol name="square" size={32} color={Colors.dark.text.muted} />
            <ThemedText style={styles.emptyActivityText}>No recent activity</ThemedText>
            <ThemedText style={styles.emptyActivitySubtext}>
              Activity will appear here as you use the platform.
            </ThemedText>
          </View>
        </ThemedCard>

        {/* Getting Started */}
        <ThemedCard>
          <View style={styles.infoHeader}>
            <IconSymbol name="questionmark.circle" size={20} color={Colors.primary.blue} />
            <ThemedText style={styles.infoTitle}>Getting Started</ThemedText>
          </View>
          <ThemedText style={styles.infoText}>
            Welcome to LFG! This is your personal dashboard where you can manage your gaming groups, 
            events, and connections. As we add new features, they'll appear here for easy access.
          </ThemedText>
        </ThemedCard>

        {/* What's Next */}
        <ThemedCard>
          <ThemedText style={styles.infoTitle}>What's Next?</ThemedText>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle" size={16} color={Colors.primary.green} />
              <ThemedText style={styles.featureText}>Group browsing and joining</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle" size={16} color={Colors.primary.green} />
              <ThemedText style={styles.featureText}>Event creation and management</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle" size={16} color={Colors.primary.green} />
              <ThemedText style={styles.featureText}>Real-time messaging</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle" size={16} color={Colors.primary.green} />
              <ThemedText style={styles.featureText}>Profile customization</ThemedText>
            </View>
          </View>
        </ThemedCard>

        {/* Logout Button */}
        <ThemedButton
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          icon={<IconSymbol name="arrow.right.square" size={16} color={Colors.dark.text.primary} />}
          style={styles.logoutButton}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.text.secondary,
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: Colors.dark.text.muted,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginLeft: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
  },
  activityMessage: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  activityButton: {
    alignSelf: 'flex-start',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyActivityText: {
    fontSize: 16,
    color: Colors.dark.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    lineHeight: 20,
  },
  featuresList: {
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    marginLeft: 8,
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 20,
  },
});