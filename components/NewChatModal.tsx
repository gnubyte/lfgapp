import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService, User, ChatRoom, CreateChatRoom } from '@/services/api';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface NewChatModalProps {
  visible: boolean;
  onClose: () => void;
  onChatCreated: (chatRoom: ChatRoom) => void;
}

export function NewChatModal({ visible, onClose, onChatCreated }: NewChatModalProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'participants' | 'userSearch' | 'details'>('participants');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [chatName, setChatName] = useState('');
  const [creating, setCreating] = useState(false);
  
  // User search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends');


  const resetModal = () => {
    setStep('participants');
    setSelectedUsers([]);
    setChatName('');
    setCreating(false);
    setSearchQuery('');
    setSearchResults([]);
    setFriends([]);
    setLoading(false);
    setSearching(false);
    setActiveTab('friends');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleUserSelect = (user: User) => {
    const isAlreadySelected = selectedUsers.some(selected => selected.id === user.id);
    
    if (isAlreadySelected) {
      setSelectedUsers(prev => prev.filter(selected => selected.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  // User search functions
  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsData = await apiService.getFriends();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await apiService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load friends when entering user search step
  useEffect(() => {
    if (step === 'userSearch') {
      loadFriends();
    }
  }, [step]);

  const handleNext = () => {
    if (step === 'participants') {
      if (selectedUsers.length === 0) {
        Alert.alert('No Participants', 'Please select at least one person to start a chat.');
        return;
      }
      setStep('details');
    } else if (step === 'userSearch') {
      setStep('details');
    } else {
      handleCreateChat();
    }
  };

  const handleBack = () => {
    if (step === 'userSearch') {
      setStep('participants');
    } else if (step === 'details') {
      setStep('participants');
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('No Participants', 'Please select at least one person to start a chat.');
      return;
    }

    try {
      setCreating(true);
      
      const chatData: CreateChatRoom = {
        participant_ids: selectedUsers.map(user => user.id),
        name: chatName.trim() || undefined, // Only include name if it's not empty
      };

      const newChatRoom = await apiService.createChatRoom(chatData);
      onChatCreated(newChatRoom);
      handleClose();
    } catch (error: any) {
      console.error('Error creating chat room:', error);
      Alert.alert('Error', 'Failed to create chat room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getDisplayName = (user: User) => {
    return user.full_name || user.username;
  };

  const renderParticipant = (user: User, index: number) => (
    <View key={user.id} style={styles.participantItem}>
      <View style={styles.participantAvatar}>
        <IconSymbol name="person.fill" size={20} color="#8E8E93" />
      </View>
      
      <View style={styles.participantInfo}>
        <ThemedText style={styles.participantName}>
          {getDisplayName(user)}
        </ThemedText>
        <ThemedText style={styles.participantUsername}>
          @{user.username}
        </ThemedText>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleUserSelect(user)}
        activeOpacity={0.7}
      >
        <IconSymbol name="xmark.circle.fill" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const renderParticipantsStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.stepTitle}>Add People</ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Select people to add to your chat
      </ThemedText>

      {selectedUsers.length > 0 && (
        <View style={styles.selectedContainer}>
          <ThemedText style={styles.selectedTitle}>
            Selected ({selectedUsers.length})
          </ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.selectedList}
          >
            {selectedUsers.map(renderParticipant)}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setStep('userSearch')}
        activeOpacity={0.7}
      >
        <IconSymbol name="plus" size={20} color="#007AFF" />
        <ThemedText style={styles.addButtonText}>
          {selectedUsers.length === 0 ? 'Add People' : 'Add More People'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.stepTitle}>Chat Details</ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Give your chat a name (optional)
      </ThemedText>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={chatName}
          onChangeText={setChatName}
          placeholder="Chat name (optional)"
          placeholderTextColor="#8E8E93"
          maxLength={50}
        />
        <ThemedText style={styles.characterCount}>
          {chatName.length}/50
        </ThemedText>
      </View>

      <View style={styles.participantsPreview}>
        <ThemedText style={styles.previewTitle}>
          Participants ({selectedUsers.length})
        </ThemedText>
        <View style={styles.previewList}>
          {selectedUsers.slice(0, 3).map((user, index) => (
            <View key={user.id} style={styles.previewItem}>
              <View style={styles.previewAvatar}>
                <IconSymbol name="person.fill" size={16} color="#8E8E93" />
              </View>
              <ThemedText style={styles.previewName} numberOfLines={1}>
                {getDisplayName(user)}
              </ThemedText>
            </View>
          ))}
          {selectedUsers.length > 3 && (
            <ThemedText style={styles.moreText}>
              +{selectedUsers.length - 3} more
            </ThemedText>
          )}
        </View>
      </View>
    </View>
  );

  const renderUserSearchStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.stepTitle}>Add People</ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Search for people to add to your chat
      </ThemedText>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by username or name"
            placeholderTextColor="#8E8E93"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Search Results
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* User List */}
      <View style={styles.userListContainer}>
        {(loading || searching) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={activeTab === 'friends' ? friends : searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedUsers.some(selected => selected.id === item.id);
              return (
                <TouchableOpacity
                  style={[styles.userItem, isSelected && styles.selectedUserItem]}
                  onPress={() => handleUserSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.userAvatar}>
                    <IconSymbol name="person.fill" size={20} color="#8E8E93" />
                  </View>
                  <View style={styles.userInfo}>
                    <ThemedText style={styles.userName}>
                      {item.full_name || `${item.first_name} ${item.last_name}` || item.username}
                    </ThemedText>
                    <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <IconSymbol name="checkmark" size={20} color="#007AFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  {activeTab === 'friends' 
                    ? 'No friends found' 
                    : searchQuery.trim() 
                      ? 'No users found' 
                      : 'Enter a search term to find users'
                  }
                </ThemedText>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Selected Users Count */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedCount}>
          <ThemedText style={styles.selectedCountText}>
            {selectedUsers.length} selected
          </ThemedText>
        </View>
      )}
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <ThemedView style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            
            <ThemedText style={styles.headerTitle}>New Chat</ThemedText>
            
            {(step === 'details' || step === 'userSearch') ? (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.backButtonText}>Back</ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={styles.headerRight} />
            )}
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, (step === 'participants' || step === 'userSearch') && styles.progressStepActive]}>
              <View style={[styles.progressDot, (step === 'participants' || step === 'userSearch') && styles.progressDotActive]} />
              <ThemedText style={[styles.progressText, (step === 'participants' || step === 'userSearch') && styles.progressTextActive]}>
                People
              </ThemedText>
            </View>
            <View style={[styles.progressLine, step === 'details' && styles.progressLineActive]} />
            <View style={[styles.progressStep, step === 'details' && styles.progressStepActive]}>
              <View style={[styles.progressDot, step === 'details' && styles.progressDotActive]} />
              <ThemedText style={[styles.progressText, step === 'details' && styles.progressTextActive]}>
                Details
              </ThemedText>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {step === 'participants' ? renderParticipantsStep() : 
             step === 'userSearch' ? renderUserSearchStep() : 
             renderDetailsStep()}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                selectedUsers.length === 0 && styles.actionButtonDisabled
              ]}
              onPress={step === 'participants' || step === 'userSearch' ? handleNext : handleCreateChat}
              disabled={selectedUsers.length === 0 || creating}
              activeOpacity={0.7}
            >
              {creating ? (
                <ThemedText style={styles.actionButtonText}>Creating...</ThemedText>
              ) : (
                <ThemedText style={styles.actionButtonText}>
                  {step === 'participants' || step === 'userSearch' ? 'Next' : 'Create Chat'}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </Modal>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerRight: {
    width: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStepActive: {
    // Active state styling handled by individual elements
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    marginRight: 8,
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
  },
  selectedContainer: {
    marginBottom: 24,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedList: {
    flexDirection: 'row',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 120,
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  participantUsername: {
    fontSize: 12,
    color: '#8E8E93',
  },
  removeButton: {
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  participantsPreview: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  previewAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  previewName: {
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 80,
  },
  moreText: {
    fontSize: 12,
    color: '#8E8E93',
    alignSelf: 'center',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // User search styles
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#000',
  },
  userListContainer: {
    flex: 1,
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedUserItem: {
    backgroundColor: '#E3F2FD',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  selectedCount: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  selectedCountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
});
