import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedCard } from '@/components/ThemedCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

interface TimelinePostProps {
  post: {
    id: number;
    type: 'group_post' | 'user_post' | 'event_created' | 'event_updated' | 'event_deleted';
    title: string;
    content: string;
    author: {
      id: number;
      username: string;
      display_name: string;
      profile_picture?: string;
    };
    group?: {
      id: number;
      name: string;
    };
    event?: {
      id: number;
      title: string;
      event_date: string;
      location?: string;
    };
    created_at: string;
    updated_at?: string;
    likes_count?: number;
    comments_count?: number;
    is_liked?: boolean;
  };
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
}

export function TimelinePost({ post, onLike, onComment }: TimelinePostProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPostIcon = () => {
    switch (post.type) {
      case 'group_post':
        return 'person.3.fill';
      case 'user_post':
        return 'person.fill';
      case 'event_created':
        return 'calendar.badge.plus';
      case 'event_updated':
        return 'calendar.badge.exclamationmark';
      case 'event_deleted':
        return 'calendar.badge.minus';
      default:
        return 'doc.text.fill';
    }
  };

  const getPostColor = () => {
    switch (post.type) {
      case 'group_post':
        return '#007AFF';
      case 'user_post':
        return '#34C759';
      case 'event_created':
        return '#FF9500';
      case 'event_updated':
        return '#FF6B35';
      case 'event_deleted':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <ThemedCard style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <IconSymbol 
            name={getPostIcon()} 
            size={24} 
            color={getPostColor()} 
            style={styles.postIcon}
          />
          <View style={styles.authorDetails}>
            <ThemedText style={styles.authorName}>
              {post.author.display_name}
            </ThemedText>
            <ThemedText style={styles.authorUsername}>
              @{post.author.username}
            </ThemedText>
            {post.group && (
              <ThemedText style={styles.groupName}>
                in {post.group.name}
              </ThemedText>
            )}
          </View>
        </View>
        <ThemedText style={styles.timestamp}>
          {formatDate(post.created_at)}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText style={styles.title}>{post.title}</ThemedText>
        <ThemedText style={styles.postContent}>{post.content}</ThemedText>
        
        {/* Event Information */}
        {post.event && (
          <View style={styles.eventInfo}>
            <ThemedText style={styles.eventTitle}>{post.event.title}</ThemedText>
            <ThemedText style={styles.eventDate}>
              {new Date(post.event.event_date).toLocaleString()}
            </ThemedText>
            {post.event.location && (
              <ThemedText style={styles.eventLocation}>
                📍 {post.event.location}
              </ThemedText>
            )}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable 
          style={styles.actionButton}
          onPress={() => onLike?.(post.id)}
        >
          <IconSymbol 
            name={post.is_liked ? "heart.fill" : "heart"} 
            size={20} 
            color={post.is_liked ? "#FF3B30" : "#666"} 
          />
          <ThemedText style={[
            styles.actionText,
            post.is_liked && styles.likedText
          ]}>
            {post.likes_count || 0}
          </ThemedText>
        </Pressable>

        <Pressable 
          style={styles.actionButton}
          onPress={() => onComment?.(post.id)}
        >
          <IconSymbol name="bubble.left" size={20} color={Colors.dark.text.secondary} />
          <ThemedText style={styles.actionText}>
            {post.comments_count || 0}
          </ThemedText>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <IconSymbol name="square.and.arrow.up" size={20} color={Colors.dark.text.secondary} />
          <ThemedText style={styles.actionText}>Share</ThemedText>
        </Pressable>
      </View>
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  postIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text.primary,
  },
  authorUsername: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    marginTop: 2,
  },
  groupName: {
    fontSize: 14,
    color: Colors.primary.blue,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.dark.text.muted,
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    color: Colors.dark.text.primary,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    marginLeft: 6,
  },
  likedText: {
    color: Colors.primary.red,
  },
  eventInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.dark.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.orange,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: Colors.primary.blue,
  },
});
