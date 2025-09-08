import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import { apiService, CreateMessage, Message } from '@/services/api';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

interface MessageInputProps {
  chatRoomId: number;
  onMessageSent: (message: Message) => void;
  disabled?: boolean;
}

export function MessageInput({ chatRoomId, onMessageSent, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const sendMessage = async () => {
    if (!message.trim() || sending || disabled) {
      return;
    }

    const messageText = message.trim();
    console.log('📤 Attempting to send message to chat room:', chatRoomId, 'message:', messageText);
    setMessage('');
    setSending(true);

    try {
      const messageData: CreateMessage = {
        content: messageText,
      };

      const sentMessage = await apiService.sendMessage(chatRoomId, messageData);
      console.log('✅ Message sent successfully:', sentMessage);
      onMessageSent(sentMessage);
      
      // Clear keyboard after sending
      Keyboard.dismiss();
    } catch (error: any) {
      console.error('❌ Error sending message to chat room', chatRoomId, ':', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to send message to chat room ${chatRoomId}. Please try again.`);
      
      // Restore the message text if sending failed
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = () => {
    if (message.trim()) {
      sendMessage();
    }
  };

  const canSend = message.trim().length > 0 && !sending && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#8E8E93"
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          blurOnSubmit={false}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={handleSubmit}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          {sending ? (
            <IconSymbol name="clock" size={20} color="#8E8E93" />
          ) : (
            <IconSymbol 
              name="paperplane.fill" 
              size={20} 
              color={canSend ? "white" : "#8E8E93"} 
            />
          )}
        </TouchableOpacity>
      </View>
      
      {message.length > 800 && (
        <View style={styles.characterCount}>
          <ThemedText style={styles.characterCountText}>
            {message.length}/1000
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 8,
    color: '#000',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: '#E5E5EA',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCountText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
