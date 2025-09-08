import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, RefreshControl, ActivityIndicator, View, Animated } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TimelinePost } from '@/components/TimelinePost';
import { TimelinePost as TimelinePostType } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { timelineCache } from '@/services/timelineCache';
import { Colors } from '@/constants/Colors';


export default function TimelineScreen() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<TimelinePostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({ type: null, text: '' });
  const [bannerOpacity] = useState(new Animated.Value(0));

  // Show banner message
  const showBannerMessage = useCallback((type: 'success' | 'error', text: string) => {
    setRefreshMessage({ type, text });
    
    // Animate banner in
    Animated.timing(bannerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide banner after 5 seconds
    setTimeout(() => {
      Animated.timing(bannerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setRefreshMessage({ type: null, text: '' });
      });
    }, 5000);
  }, [bannerOpacity]);

  // Update posts from cache
  const updatePostsFromCache = useCallback(() => {
    const cachedPosts = timelineCache.getPosts();
    setPosts(cachedPosts);
    console.log(`📱 [${new Date().toISOString()}] Updated posts from cache:`, cachedPosts.length);
  }, []);

  // Load initial timeline
  const loadInitialTimeline = async () => {
    if (!isAuthenticated) {
      console.log(`❌ [${new Date().toISOString()}] User not authenticated, skipping timeline load`);
      setIsLoading(false);
      return;
    }

    try {
      console.log(`🔄 [${new Date().toISOString()}] Loading initial timeline...`);
      setIsLoading(true);
      timelineCache.setLoading(true);
      
      const response = await apiService.getTimeline({ limit: 20 });
      
      if (response) {
        console.log(`✅ [${new Date().toISOString()}] Initial timeline response received:`, response.items?.length || 0, 'posts');
        timelineCache.processRefreshResponse(
          response.items || [],
          response.has_more || false,
          response.next_cursor
        );
        updatePostsFromCache();
      }
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Error loading initial timeline:`, error);
    } finally {
      setIsLoading(false);
      timelineCache.setLoading(false);
    }
  };

  // Refresh timeline (pull-to-refresh)
  const handleRefresh = async () => {
    if (!isAuthenticated || !timelineCache.canRefresh()) {
      return;
    }

    try {
      setIsRefreshing(true);
      timelineCache.setLoading(true);
      
      const cursors = timelineCache.getCursors();
      console.log('🔄 Refreshing timeline, since:', cursors.since);
      
      const response = await apiService.getTimeline({
        since: cursors.since,
        limit: 20
      });
      
      if (response) {
        const newPosts = response.items || [];
        timelineCache.processRefreshResponse(
          newPosts,
          response.has_more || false,
          response.next_cursor
        );
        updatePostsFromCache();
        
        // Show success message
        if (newPosts.length > 0) {
          showBannerMessage('success', `${newPosts.length} new post${newPosts.length === 1 ? '' : 's'} loaded`);
        } else {
          showBannerMessage('success', 'Timeline is up to date');
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing timeline:', error);
      showBannerMessage('error', 'Failed to load new posts');
    } finally {
      setIsRefreshing(false);
      timelineCache.setLoading(false);
    }
  };

  // Load older posts (infinite scroll)
  const handleLoadMore = async () => {
    if (!isAuthenticated || !timelineCache.canLoadMore()) {
      return;
    }

    try {
      timelineCache.setLoading(true);
      
      const cursors = timelineCache.getCursors();
      console.log('📜 Loading older posts, before:', cursors.before);
      
      const response = await apiService.getTimeline({
        before: cursors.before,
        limit: 20
      });
      
      if (response) {
        timelineCache.processOlderResponse(
          response.items || [],
          response.has_more || false,
          response.prev_cursor
        );
        updatePostsFromCache();
      }
    } catch (error) {
      console.error('❌ Error loading older posts:', error);
    } finally {
      timelineCache.setLoading(false);
    }
  };

  const handleLike = (postId: number) => {
    // TODO: Implement like functionality
    console.log('Like post:', postId);
  };

  const handleComment = (postId: number) => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', postId);
  };

  // Load initial data
  useEffect(() => {
    console.log(`🔄 [${new Date().toISOString()}] useEffect triggered - isAuthenticated:`, isAuthenticated, 'authLoading:', authLoading);
    
    // Don't do anything if auth is still loading
    if (authLoading) {
      console.log(`⏳ [${new Date().toISOString()}] Auth still loading, waiting...`);
      return;
    }
    
    if (isAuthenticated) {
      loadInitialTimeline();
    } else {
      // Clear cache when not authenticated
      timelineCache.clear();
      setPosts([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Update posts when cache changes
  useEffect(() => {
    console.log(`🔄 [${new Date().toISOString()}] updatePostsFromCache useEffect triggered`);
    updatePostsFromCache();
  }, [updatePostsFromCache]);

  const renderPost = ({ item }: { item: TimelinePostType }) => (
    <TimelinePost
      post={item}
      onLike={handleLike}
      onComment={handleComment}
    />
  );

  const renderEmptyState = () => {
    if (!isAuthenticated) {
      return (
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="person.circle" size={60} color="#ccc" />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            Please log in
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            You need to be logged in to view your timeline. Please log in to continue.
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.emptyState}>
        <IconSymbol name="doc.text" size={60} color="#ccc" />
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          No posts yet
        </ThemedText>
        <ThemedText style={styles.emptyDescription}>
          Join some groups or follow other gamers to see posts in your timeline!
        </ThemedText>
      </ThemedView>
    );
  };

  const renderHeader = () => (
    <ThemedCard variant="compact" style={styles.header}>
      <View style={styles.headerContent}>
        <IconSymbol name="list.bullet" size={24} color={Colors.features.timeline} />
        <View style={styles.headerText}>
          <ThemedText style={styles.title}>Timeline</ThemedText>
          <ThemedText style={styles.subtitle}>
            Latest posts from your gaming community
          </ThemedText>
        </View>
      </View>
    </ThemedCard>
  );

  const renderRefreshIndicator = () => {
    if (!isRefreshing) return null;
    
    return (
      <View style={styles.refreshIndicator}>
        <IconSymbol 
          name="gearshape.fill" 
          size={24} 
          color={Colors.primary.purple} 
          style={styles.refreshIcon}
        />
        <ThemedText style={styles.refreshText}>Loading new posts...</ThemedText>
      </View>
    );
  };

  if (authLoading || (isLoading && posts.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.purple} />
        <ThemedText style={styles.loadingText}>
          {authLoading ? 'Loading authentication...' : 'Loading timeline...'}
        </ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Refresh Banner */}
      {refreshMessage.type && (
        <Animated.View 
          style={[
            styles.refreshBanner,
            {
              backgroundColor: refreshMessage.type === 'success' 
                ? Colors.primary.green 
                : Colors.primary.red,
              opacity: bannerOpacity,
            }
          ]}
        >
          <View style={styles.bannerContent}>
            <IconSymbol 
              name={refreshMessage.type === 'success' ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'} 
              size={20} 
              color="white" 
            />
            <ThemedText style={styles.bannerText}>
              {refreshMessage.text}
            </ThemedText>
          </View>
        </Animated.View>
      )}
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View>
            {renderRefreshIndicator()}
            {renderHeader()}
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary.purple}
            title={isRefreshing ? "Loading new posts..." : "Pull to refresh"}
            titleColor={Colors.dark.text.secondary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => 
          timelineCache.getStats().isLoading && posts.length > 0 ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={Colors.primary.purple} />
              <ThemedText style={styles.loadingFooterText}>Loading more posts...</ThemedText>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  header: {
    marginHorizontal: 0,
    marginVertical: 0,
    marginTop: 60,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.dark.text.secondary,
  },
  refreshBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Account for status bar
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.surface,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  refreshIcon: {
    marginRight: 8,
  },
  refreshText: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    fontWeight: '500',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingFooterText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.dark.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
