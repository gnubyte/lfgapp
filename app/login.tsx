import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (success) {
        // Navigation will be handled by the auth state change
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid username or password');
      }
    } catch (error) {
      Alert.alert('Login Error', 'Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    Alert.alert(
      'Register',
      'Registration is not available in this demo. Please contact support for account creation.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.content}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <IconSymbol name="gamecontroller.fill" size={60} color="#007AFF" />
            <ThemedText type="title" style={styles.title}>LFG</ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              Looking for Group
            </ThemedText>
            <ThemedText style={styles.description}>
              Connect with fellow gamers and find your next gaming group
            </ThemedText>
          </ThemedView>

          {/* Login Form */}
          <ThemedView style={styles.form}>
            <ThemedText type="subtitle" style={styles.formTitle}>Sign In</ThemedText>
            
            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>

            <Pressable
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <IconSymbol name="arrow.right.square" size={20} color="white" />
                  <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <ThemedText style={styles.registerButtonText}>
                Don't have an account? Register
              </ThemedText>
            </Pressable>
          </ThemedView>

          {/* Features */}
          <ThemedView style={styles.features}>
            <ThemedText type="subtitle" style={styles.featuresTitle}>Features</ThemedText>
            <ThemedView style={styles.featureList}>
              <ThemedView style={styles.featureItem}>
                <IconSymbol name="person.3.fill" size={24} color="#007AFF" />
                <ThemedText style={styles.featureText}>Find gaming groups</ThemedText>
              </ThemedView>
              <ThemedView style={styles.featureItem}>
                <IconSymbol name="calendar" size={24} color="#007AFF" />
                <ThemedText style={styles.featureText}>Schedule gaming events</ThemedText>
              </ThemedView>
              <ThemedView style={styles.featureItem}>
                <IconSymbol name="message" size={24} color="#007AFF" />
                <ThemedText style={styles.featureText}>Chat with other gamers</ThemedText>
              </ThemedView>
              <ThemedView style={styles.featureItem}>
                <IconSymbol name="video" size={24} color="#007AFF" />
                <ThemedText style={styles.featureText}>Video calls and streaming</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 25,
    fontSize: 20,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    gap: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  features: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  featureList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});
