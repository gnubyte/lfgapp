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
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedButton } from '@/components/ThemedButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';

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
        // Navigation is handled by AuthContext
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
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.content}>
          {/* Header */}
          <ThemedCard variant="feature" style={styles.header}>
            <IconSymbol name="gamecontroller.fill" size={60} color={Colors.primary.purple} />
            <ThemedText style={styles.title}>LFG</ThemedText>
            <ThemedText style={styles.subtitle}>
              Looking for Group
            </ThemedText>
            <ThemedText style={styles.description}>
              Connect with fellow gamers and find your next gaming group
            </ThemedText>
          </ThemedCard>

          {/* Login Form */}
          <ThemedCard style={styles.form}>
            <ThemedText style={styles.formTitle}>Sign In</ThemedText>
            
            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="person.fill" size={20} color={Colors.dark.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={Colors.dark.text.muted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="lock.fill" size={20} color={Colors.dark.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.dark.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>

            <ThemedButton
              title={isLoading ? "Signing In..." : "Sign In"}
              onPress={handleLogin}
              disabled={isLoading}
              variant="primary"
              size="large"
              style={styles.loginButton}
              icon={isLoading ? <ActivityIndicator color={Colors.dark.text.primary} /> : <IconSymbol name="arrow.right.square" size={20} color={Colors.dark.text.primary} />}
            />

            <Pressable
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <ThemedText style={styles.registerButtonText}>
                Don't have an account? <ThemedText style={styles.registerLinkText}>Register</ThemedText>
              </ThemedText>
            </Pressable>
          </ThemedCard>

          {/* Features */}
          <ThemedCard variant="feature" style={styles.features}>
            <ThemedText style={styles.featuresTitle}>Features</ThemedText>
            <ThemedView style={styles.featureList}>
              <ThemedView style={styles.featureItem}>
                <IconSymbol name="person.3.fill" size={24} color={Colors.features.groups} />
                <ThemedText style={styles.featureText}>Find gaming groups</ThemedText>
              </ThemedView>
              <ThemedView style={styles.featureItem}>
                <IconSymbol name="calendar" size={24} color={Colors.features.events} />
                <ThemedText style={styles.featureText}>Schedule gaming events</ThemedText>
              </ThemedView>
              <ThemedView style={styles.featureItem}>
                <IconSymbol name="message" size={24} color={Colors.features.messages} />
                <ThemedText style={styles.featureText}>Chat with other gamers</ThemedText>
              </ThemedView>
              <ThemedView style={styles.featureItem}>
                <IconSymbol name="video" size={24} color={Colors.primary.red} />
                <ThemedText style={styles.featureText}>Video calls and streaming</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedCard>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary.purple,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: Colors.dark.text.secondary,
    marginTop: 0,
    marginBottom: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: Colors.dark.text.muted,
    textAlign: 'center',
    marginTop: 0,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  form: {
    marginBottom: 16,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    marginBottom: 20,
    paddingHorizontal: 18,
    height: 60,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: Colors.dark.text.primary,
    height: '100%',
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 20,
  },
  registerButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  registerButtonText: {
    color: Colors.dark.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  registerLinkText: {
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  features: {
    marginTop: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text.primary,
  },
  featureList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  featureText: {
    fontSize: 17,
    color: Colors.dark.text.primary,
    flex: 1,
    fontWeight: '500',
  },
});
