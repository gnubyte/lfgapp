import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, ChatRoom } from '@/services/api';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { ThemedCard } from './ThemedCard';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';

interface ChatRoomListProps {
  onChatRoomSelect: (chatRoom: ChatRoom) => void;
  refreshTrigger?: any; // When this changes, refresh the list
}

export function ChatRoomList({ onChatRoomSelect, refreshTrigger }: ChatRoomListProps) {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadChatRooms();
    }
  }, [refreshTrigger]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🏠 Loading chat rooms...');
      const rooms = await apiService.getChatRooms();
      console.log('🏠 Loaded chat rooms:', rooms.length, 'rooms');
      console.log('🏠 Chat rooms data:', rooms.map(r => ({ id: r.id, name: r.name, participants: r.participants.length })));
      setChatRooms(rooms);
    } catch (err: any) {
      console.error('❌ Error loading chat rooms:', err);
      setError('Failed to load chat rooms');
      Alert.alert('Error', 'Failed to load chat rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getChatRoomDisplayName = (chatRoom: ChatRoom) => {
    if (chatRoom.name) {
      return chatRoom.name;
    }
    
    // For individual chats, show the other participant's name
    if (!chatRoom.group_id && chatRoom.participants.length === 2) {
      const otherParticipant = chatRoom.participants.find(p => p.id !== user?.id);
      return otherParticipant ? otherParticipant.full_name || otherParticipant.username : 'Unknown User';
    }
    
    // For group chats, show participant names
    if (chatRoom.participants.length > 2) {
      const participantNames = chatRoom.participants
        .filter(p => p.id !== user?.id)
        .map(p => p.full_name || p.username)
        .slice(0, 2);
      return participantNames.join(', ') + (chatRoom.participants.length > 3 ? '...' : '');
    }
    
    return 'Chat Room';
  };

  const getChatRoomIcon = (chatRoom: ChatRoom) => {
    if (chatRoom.group_id) {
      return 'person.3.fill'; // Group chat icon
    }
    return 'person.fill'; // Individual chat icon
  };

  const formatLastMessageTime = (timestamp: string) => {
    // Ensure the timestamp is treated as UTC by appending 'Z' if it doesn't have timezone info
    let utcTimestamp = timestamp;
    if (!timestamp.includes('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
      utcTimestamp = timestamp + 'Z';
    }
    
    const date = new Date(utcTimestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { 
        weekday: 'short',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  };

  const renderChatRoom = ({ item: chatRoom }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.chatRoomItem}
      onPress={() => onChatRoomSelect(chatRoom)}
      activeOpacity={0.7}
    >
      <View style={styles.chatRoomContent}>
        <View style={styles.chatRoomIcon}>
          <IconSymbol 
            name={getChatRoomIcon(chatRoom)} 
            size={24} 
            color={Colors.primary.purple} 
          />
        </View>
        
        <View style={styles.chatRoomInfo}>
          <View style={styles.chatRoomHeader}>
            <ThemedText style={styles.chatRoomName} numberOfLines={1}>
              {getChatRoomDisplayName(chatRoom)}
            </ThemedText>
            <ThemedText style={styles.chatRoomTime}>
              {formatLastMessageTime(chatRoom.created_at)}
            </ThemedText>
          </View>
          
          <View style={styles.chatRoomMeta}>
            <ThemedText style={styles.participantCount}>
              {chatRoom.participants.length} participant{chatRoom.participants.length !== 1 ? 's' : ''}
            </ThemedText>
            {chatRoom.group_id && (
              <View style={styles.groupBadge}>
                <ThemedText style={styles.groupBadgeText}>Group</ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.purple} />
        <ThemedText style={styles.loadingText}>Loading chat rooms...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color={Colors.primary.red} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadChatRooms}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="bubble.left.and.bubble.right" size={64} color={Colors.dark.text.muted} />
        <ThemedText style={styles.emptyTitle}>No Chat Rooms</ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Start a conversation by creating a new chat room
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={chatRooms}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderChatRoom}
      style={styles.chatRoomList}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      onRefresh={loadChatRooms}
    />
  );
}

const styles = StyleSheet.create({
  chatRoomList: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  chatRoomItem: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.dark.border,
  },
  chatRoomContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatRoomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatRoomInfo: {
    flex: 1,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatRoomName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  chatRoomTime: {
    fontSize: 12,
    color: Colors.dark.text.muted,
  },
  chatRoomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantCount: {
    fontSize: 14,
    color: Colors.dark.text.muted,
  },
  groupBadge: {
    backgroundColor: Colors.primary.purple,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  groupBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.dark.text.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    color: Colors.primary.red,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary.purple,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.dark.text.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
