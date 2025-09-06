import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'lfg_auth_tokens';
const USER_KEY = 'lfg_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedTokens, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY)
      ]);

      if (storedTokens && storedUser) {
        const tokens: AuthTokens = JSON.parse(storedTokens);
        const userData: User = JSON.parse(storedUser);
        
        // Set tokens in API service
        apiService.setTokens(tokens);
        
        // Verify token is still valid by fetching user profile
        const currentUser = await apiService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, try to refresh
          const refreshed = await refreshToken();
          if (!refreshed) {
            await clearAuth();
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.login(username, password);
      
      if (response) {
        const { access_token, refresh_token, user: userData } = response;
        
        // Store tokens and user data
        await Promise.all([
          AsyncStorage.setItem(TOKEN_KEY, JSON.stringify({ access_token, refresh_token })),
          AsyncStorage.setItem(USER_KEY, JSON.stringify(userData))
        ]);
        
        // Set tokens in API service
        apiService.setTokens({ access_token, refresh_token });
        
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuth();
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await apiService.refreshToken();
      if (response) {
        const { access_token } = response;
        
        // Get current tokens and update access token
        const storedTokens = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedTokens) {
          const tokens: AuthTokens = JSON.parse(storedTokens);
          tokens.access_token = access_token;
          
          await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
          apiService.setTokens(tokens);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const clearAuth = async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY)
      ]);
      
      apiService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
