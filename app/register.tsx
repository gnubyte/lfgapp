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

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const success = await register(registerData);
      
      if (success) {
        Alert.alert(
          'Success!',
          'Account created successfully. Welcome to LFG!',
          [{ text: 'OK' }]
        );
        // Navigation is handled by AuthContext
      } else {
        Alert.alert('Registration Failed', 'Unable to create account. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific API errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.detail) {
          Alert.alert('Registration Failed', errorData.detail);
        } else {
          Alert.alert('Registration Failed', 'Please check your information and try again.');
        }
      } else if (error.response?.status === 409) {
        Alert.alert('Registration Failed', 'Username or email already exists.');
      } else {
        Alert.alert('Registration Error', 'Unable to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
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
            <ThemedText style={styles.title}>Join LFG</ThemedText>
            <ThemedText style={styles.subtitle}>
              Create your gaming account
            </ThemedText>
          </ThemedCard>

          {/* Registration Form */}
          <ThemedCard style={styles.form}>
            <ThemedText style={styles.formTitle}>Create Account</ThemedText>
            
            {/* Username */}
            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="person.fill" size={20} color={Colors.dark.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                placeholder="Username"
                placeholderTextColor={Colors.dark.text.muted}
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>
            {errors.username && <ThemedText style={styles.errorText}>{errors.username}</ThemedText>}

            {/* Email */}
            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="envelope.fill" size={20} color={Colors.dark.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor={Colors.dark.text.muted}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>
            {errors.email && <ThemedText style={styles.errorText}>{errors.email}</ThemedText>}

            {/* First Name */}
            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="person.circle.fill" size={20} color={Colors.dark.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.first_name && styles.inputError]}
                placeholder="First Name"
                placeholderTextColor={Colors.dark.text.muted}
                value={formData.first_name}
                onChangeText={(value) => handleInputChange('first_name', value)}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>
            {errors.first_name && <ThemedText style={styles.errorText}>{errors.first_name}</ThemedText>}

            {/* Last Name */}
            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="person.circle.fill" size={20} color={Colors.dark.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.last_name && styles.inputError]}
                placeholder="Last Name"
                placeholderTextColor={Colors.dark.text.muted}
                value={formData.last_name}
                onChangeText={(value) => handleInputChange('last_name', value)}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>
            {errors.last_name && <ThemedText style={styles.errorText}>{errors.last_name}</ThemedText>}

            {/* Password */}
            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="lock.fill" size={20} color={Colors.dark.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                placeholderTextColor={Colors.dark.text.muted}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>
            {errors.password && <ThemedText style={styles.errorText}>{errors.password}</ThemedText>}

            {/* Confirm Password */}
            <ThemedView style={styles.inputContainer}>
              <IconSymbol name="lock.fill" size={20} color={Colors.dark.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.dark.text.muted}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </ThemedView>
            {errors.confirmPassword && <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>}

            <ThemedButton
              title={isLoading ? "Creating Account..." : "Create Account"}
              onPress={handleRegister}
              disabled={isLoading}
              variant="primary"
              size="large"
              style={styles.registerButton}
              icon={isLoading ? <ActivityIndicator color={Colors.dark.text.primary} /> : <IconSymbol name="person.badge.plus" size={20} color={Colors.dark.text.primary} />}
            />

            <Pressable
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <ThemedText style={styles.loginButtonText}>
                Already have an account? <ThemedText style={styles.loginLinkText}>Sign In</ThemedText>
              </ThemedText>
            </Pressable>
          </ThemedCard>

          {/* Terms */}
          <ThemedView style={styles.terms}>
            <ThemedText style={styles.termsText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </ThemedText>
          </ThemedView>
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
    fontWeight: '600',
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
    marginBottom: 16,
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
  inputError: {
    borderColor: Colors.primary.red,
    backgroundColor: Colors.dark.surface,
  },
  errorText: {
    color: Colors.primary.red,
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
  },
  registerButton: {
    marginTop: 20,
  },
  loginButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  loginButtonText: {
    color: Colors.dark.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  loginLinkText: {
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  terms: {
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 14,
    color: Colors.dark.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
