import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ChatRoomList } from '@/components/ChatRoomList';
import { MessageList, MessageListRef } from '@/components/MessageList';
import { MessageInput } from '@/components/MessageInput';
import { NewChatModal } from '@/components/NewChatModal';
import { ChatRoom, Message } from '@/services/api';

export default function MessagesScreen() {
  // Use safe area insets with fallback - handle the hook error
  let insets = { top: 0, bottom: 0, left: 0, right: 0 };
  try {
    insets = useSafeAreaInsets();
  } catch (error) {
    console.warn('useSafeAreaInsets hook error:', error);
    // Use default insets
  }
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const messageListRef = useRef<MessageListRef>(null);

  const handleChatRoomSelect = (chatRoom: ChatRoom) => {
    console.log('🏠 Chat room selected:', chatRoom.id, 'name:', chatRoom.name, 'participants:', chatRoom.participants.length);
    setSelectedChatRoom(chatRoom);
    setMessages([]); // Clear messages when switching chat rooms
  };

  const handleBackToInbox = () => {
    setSelectedChatRoom(null);
    setMessages([]);
  };

  const handleMessageSent = (message: Message) => {
    console.log('📨 Message sent, adding to list:', message);
    setMessages(prev => [...prev, message]);
    // Also add to MessageList via ref
    messageListRef.current?.addMessage(message);
  };

  const handleMessagesLoaded = (loadedMessages: Message[]) => {
    console.log('📨 Messages loaded in parent:', loadedMessages.length, 'messages');
    setMessages(loadedMessages);
  };

  const handleChatCreated = (newChatRoom: ChatRoom) => {
    // Navigate to the new chat room
    setSelectedChatRoom(newChatRoom);
    setMessages([]);
    setShowNewChatModal(false);
    // Trigger refresh of chat room list
    setRefreshTrigger(prev => prev + 1);
  };

  if (selectedChatRoom) {
    return (
      <ThemedView style={styles.container}>
        {/* Chat Header */}
        <View style={[styles.chatHeader, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToInbox}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <View style={styles.chatHeaderInfo}>
            <ThemedText style={styles.chatTitle}>
              {selectedChatRoom.name || 'Chat'}
            </ThemedText>
            <ThemedText style={styles.chatSubtitle}>
              {selectedChatRoom.participants.length} participant{selectedChatRoom.participants.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => Alert.alert('More Options', 'Chat options coming soon')}
            activeOpacity={0.7}
          >
            <IconSymbol name="ellipsis" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <MessageList 
          ref={messageListRef}
          chatRoom={selectedChatRoom} 
          onMessagesLoaded={handleMessagesLoaded}
        />

        {/* Message Input */}
        <MessageInput 
          chatRoomId={selectedChatRoom.id}
          onMessageSent={handleMessageSent}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Inbox Header */}
      <View style={[styles.inboxHeader, { paddingTop: insets.top + 12 }]}>
        <ThemedText type="title" style={styles.inboxTitle}>Messages</ThemedText>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={() => setShowNewChatModal(true)}
          activeOpacity={0.7}
        >
          <IconSymbol name="plus" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Chat Room List */}
      <ChatRoomList 
        onChatRoomSelect={handleChatRoomSelect}
        refreshTrigger={refreshTrigger}
      />
      
      {/* New Chat Modal */}
      <NewChatModal
        visible={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  inboxTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  newChatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
