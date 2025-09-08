import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Message, ChatRoom } from '@/services/api';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface MessageListProps {
  chatRoom: ChatRoom;
  onMessagesLoaded?: (messages: Message[]) => void;
  onMessageAdded?: (message: Message) => void;
}

export interface MessageListRef {
  addMessage: (message: Message) => void;
}

export const MessageList = forwardRef<MessageListRef, MessageListProps>(({ chatRoom, onMessagesLoaded, onMessageAdded }, ref) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    console.log('🔄 MessageList useEffect triggered for chat room:', chatRoom.id);
    console.log('🔄 Chat room details:', {
      id: chatRoom.id,
      name: chatRoom.name,
      participants: chatRoom.participants.length,
      group_id: chatRoom.group_id
    });
    loadMessages();
  }, [chatRoom.id]);

  useImperativeHandle(ref, () => ({
    addMessage: (newMessage: Message) => {
      console.log('➕ Adding message via ref:', newMessage);
      setMessages(prev => [...prev, newMessage]);
      onMessageAdded?.(newMessage);
      // Auto-scroll to bottom when new message is added
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }));

  const loadMessages = async () => {
    try {
      console.log('📥 Starting to load messages for chat room:', chatRoom.id);
      setLoading(true);
      setError(null);
      console.log('📥 Loading messages for chat room:', chatRoom.id, 'is group chat:', !!chatRoom.group_id);
      console.log('📥 Chat room ID type:', typeof chatRoom.id);
      console.log('📥 Chat room participants:', chatRoom.participants.map(p => ({ id: p.id, username: p.username })));
      console.log('📥 Full chat room object:', JSON.stringify(chatRoom, null, 2));
      const messageList = await apiService.getMessages(chatRoom.id);
      console.log('📥 Loaded messages:', messageList.length, 'messages');
      console.log('📥 Messages data:', messageList);
      
      // Check if messages are valid
      if (messageList.length > 0) {
        console.log('📥 First message details:', messageList[0]);
      } else {
        console.log('📥 No messages found for this chat room');
      }
      setMessages(messageList);
      onMessagesLoaded?.(messageList);
      
      // Auto-scroll to bottom after messages load
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      console.error('❌ Error loading messages for chat room', chatRoom.id, ':', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setError('Failed to load messages');
      Alert.alert('Error', `Failed to load messages for chat room ${chatRoom.id}. Please try again.`);
    } finally {
      console.log('📥 Finished loading messages, setting loading to false');
      setLoading(false);
    }
  };

  const addMessage = (newMessage: Message) => {
    console.log('➕ Adding message to list:', newMessage);
    setMessages(prev => [...prev, newMessage]);
    onMessageAdded?.(newMessage);
    // Auto-scroll to bottom when new message is added
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (timestamp: string) => {
    // Ensure the timestamp is treated as UTC by appending 'Z' if it doesn't have timezone info
    let utcTimestamp = timestamp;
    if (!timestamp.includes('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
      utcTimestamp = timestamp + 'Z';
    }
    
    const date = new Date(utcTimestamp);
    
    // Debug timezone info
    console.log('🕐 Formatting timestamp:', {
      original: timestamp,
      utcTimestamp: utcTimestamp,
      parsed: date.toISOString(),
      local: date.toLocaleString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    // Verify the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Invalid time';
    }
    
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    // Show actual time for recent messages (within 24 hours)
    if (diffInMinutes < 1440) { // 24 hours
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } else if (diffInMinutes < 10080) { // 7 days
      return date.toLocaleDateString([], { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  };

  const isMyMessage = (message: Message) => {
    return message.sender_id === user?.id;
  };

  const renderMessage = ({ item: message, index }: { item: Message; index: number }) => {
    const isMyMsg = isMyMessage(message);
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showTime = !prevMessage || 
      new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000; // 5 minutes
    
    // Show username if it's not my message or if it's the first message in a group
    const showUsername = !isMyMsg && (!prevMessage || prevMessage.sender_id !== message.sender_id);

    return (
      <View style={styles.messageContainer}>
        {showTime && (
          <View style={styles.timeSeparator}>
            <ThemedText style={styles.timeText}>
              {formatMessageTime(message.timestamp)}
            </ThemedText>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMsg ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {showUsername && (
            <ThemedText style={[
              styles.usernameText,
              isMyMsg ? styles.myUsernameText : styles.otherUsernameText
            ]}>
              {message.sender_name || 'Unknown User'}
            </ThemedText>
          )}
          <ThemedText style={[
            styles.messageText,
            isMyMsg ? styles.myMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </ThemedText>
        </View>
      </View>
    );
  };

  console.log('🎨 MessageList render - loading:', loading, 'error:', error, 'messages count:', messages.length);

  if (loading) {
    console.log('🎨 Rendering loading state');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
      </View>
    );
  }

  if (error) {
    console.log('🎨 Rendering error state:', error);
    return (
      <View style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  if (messages.length === 0) {
    console.log('🎨 Rendering empty state - no messages');
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Start the conversation by sending a message
        </ThemedText>
      </View>
    );
  }

  console.log('🎨 Rendering message list with', messages.length, 'messages');
  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderMessage}
      style={styles.messageList}
      contentContainerStyle={styles.messageListContent}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
    />
  );
});

// Expose addMessage function for parent components
export const useMessageList = (chatRoom: ChatRoom) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const messageList = await apiService.getMessages(chatRoom.id);
      setMessages(messageList);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const addMessage = (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
    loadMessages();
  }, [chatRoom.id]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    addMessage
  };
};

const styles = StyleSheet.create({
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 8,
  },
  timeSeparator: {
    alignItems: 'center',
    marginVertical: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  otherMessageBubble: {
    backgroundColor: '#F2F2F7',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#000',
  },
  usernameText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  myUsernameText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUsernameText: {
    color: '#8E8E93',
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
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
