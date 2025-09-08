import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  Modal 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService, User } from '@/services/api';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface UserSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onUserSelect: (user: User) => void;
  selectedUsers: User[];
  title?: string;
}

export function UserSearchModal({ 
  visible, 
  onClose, 
  onUserSelect, 
  selectedUsers, 
  title = "Add People" 
}: UserSearchModalProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends');

  console.log('UserSearchModal - visible:', visible);

  // Load friends on mount
  useEffect(() => {
    if (visible) {
      loadFriends();
    }
  }, [visible]);

  // Search users with debounce
  useEffect(() => {
    if (!visible) return;

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers(searchQuery.trim());
      } else {
        setSearchResults([]);
        setActiveTab('friends');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, visible]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsList = await apiService.getFriends();
      setFriends(friendsList);
    } catch (error: any) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      setSearching(true);
      setActiveTab('search');
      const results = await apiService.searchUsers(query);
      setSearchResults(results);
    } catch (error: any) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
  };

  const isUserSelected = (user: User) => {
    return selectedUsers.some(selected => selected.id === user.id);
  };

  const getDisplayName = (user: User) => {
    return user.full_name || user.username;
  };

  const renderUser = ({ item: user }: { item: User }) => {
    const isSelected = isUserSelected(user);
    
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => handleUserSelect(user)}
        activeOpacity={0.7}
      >
        <View style={styles.userAvatar}>
          <IconSymbol name="person.fill" size={24} color={isSelected ? "white" : "#8E8E93"} />
        </View>
        
        <View style={styles.userInfo}>
          <ThemedText style={[styles.userName, isSelected && styles.userNameSelected]}>
            {getDisplayName(user)}
          </ThemedText>
          <ThemedText style={[styles.userUsername, isSelected && styles.userUsernameSelected]}>
            @{user.username}
          </ThemedText>
        </View>
        
        {isSelected && (
          <View style={styles.checkmark}>
            <IconSymbol name="checkmark" size={20} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTabButton = (tab: 'friends' | 'search', label: string, count?: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
      activeOpacity={0.7}
    >
      <ThemedText style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {label} {count !== undefined && `(${count})`}
      </ThemedText>
    </TouchableOpacity>
  );

  const getCurrentData = () => {
    if (activeTab === 'search') {
      return searchResults;
    }
    return friends;
  };

  const getCurrentLoading = () => {
    if (activeTab === 'search') {
      return searching;
    }
    return loading;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>{title}</ThemedText>
          
          <View style={styles.headerRight} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <IconSymbol name="magnifyingglass" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users..."
              placeholderTextColor="#8E8E93"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {renderTabButton('friends', 'Friends', friends.length)}
          {searchQuery.length >= 2 && renderTabButton('search', 'Search Results', searchResults.length)}
        </View>

        {/* User List */}
        <View style={styles.listContainer}>
          {getCurrentLoading() ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText style={styles.loadingText}>
                {activeTab === 'search' ? 'Searching...' : 'Loading friends...'}
              </ThemedText>
            </View>
          ) : getCurrentData().length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol 
                name={activeTab === 'search' ? "magnifyingglass" : "person.2"} 
                size={48} 
                color="#8E8E93" 
              />
              <ThemedText style={styles.emptyTitle}>
                {activeTab === 'search' ? 'No users found' : 'No friends yet'}
              </ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {activeTab === 'search' 
                  ? 'Try a different search term' 
                  : 'Add friends to start chatting'
                }
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={getCurrentData()}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUser}
              style={styles.userList}
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
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1000,
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
  headerRight: {
    width: 60, // Balance the cancel button
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  tabButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  userItemSelected: {
    backgroundColor: '#007AFF',
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
  userNameSelected: {
    color: 'white',
  },
  userUsername: {
    fontSize: 14,
    color: '#8E8E93',
  },
  userUsernameSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  selectedCount: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  selectedCountText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
