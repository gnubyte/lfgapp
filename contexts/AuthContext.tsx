import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearAuth: () => Promise<void>;
  forceLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'lfg_auth_tokens';
const USER_KEY = 'lfg_user';

// Global flag to prevent multiple auth loading attempts
let authLoadAttempted = false;
let loadingStateChanges = 0;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Debug wrapper for setIsLoading
  const debugSetIsLoading = (value: boolean) => {
    loadingStateChanges++;
    console.log(`🔄 [${new Date().toISOString()}] setIsLoading called with:`, value, 'from:', new Error().stack?.split('\n')[2], 'change #:', loadingStateChanges);
    
    // If we've had too many loading state changes, force it to false
    if (loadingStateChanges > 10) {
      console.log(`🚨 [${new Date().toISOString()}] Too many loading state changes (${loadingStateChanges}), forcing to false`);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(value);
  };
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Load stored auth data on app start
  useEffect(() => {
    console.log(`🔄 [${new Date().toISOString()}] useEffect triggered, authLoadAttempted:`, authLoadAttempted, 'isLoadingAuth:', isLoadingAuth);
    if (!authLoadAttempted) {
      loadStoredAuth();
    } else {
      console.log(`⏳ [${new Date().toISOString()}] Auth already attempted, skipping...`);
    }
  }, []); // Empty dependency array - only run once on mount

  // Prevent multiple auth loading attempts
  useEffect(() => {
    if (authLoadAttempted && !isLoadingAuth && isLoading) {
      console.log(`🚨 [${new Date().toISOString()}] Detected stuck loading state, forcing login`);
      debugSetIsLoading(false);
    }
  }, [authLoadAttempted, isLoadingAuth, isLoading]);

  const loadStoredAuth = useCallback(async () => {
    // Only check the global flag, not the loading state
    if (authLoadAttempted) {
      console.log('⏳ Auth already attempted, skipping...');
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;

    try {
      authLoadAttempted = true;
      setIsLoadingAuth(true);
      console.log(`🔄 [${new Date().toISOString()}] Starting auth load process...`);
      
      // Set a timeout to ensure loading state gets reset
      timeoutId = setTimeout(() => {
        console.log(`⏰ [${new Date().toISOString()}] Auth loading timeout (5s), clearing auth and redirecting to login`);
        clearAuth();
      }, 5000); // 5 second timeout
      
      console.log(`🔄 [${new Date().toISOString()}] Loading stored auth...`);
      const [storedTokens, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY)
      ]);
      
      // Clear timeout since we got here successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      console.log(`🔍 [${new Date().toISOString()}] Stored tokens:`, storedTokens ? 'found' : 'not found');
      console.log(`🔍 [${new Date().toISOString()}] Stored user:`, storedUser ? 'found' : 'not found');

      if (storedTokens && storedUser) {
        try {
          const tokens: AuthTokens = JSON.parse(storedTokens);
          const userData: User = JSON.parse(storedUser);
          
          console.log(`🔑 [${new Date().toISOString()}] Loaded tokens from storage:`, {
            access_token: tokens.access_token ? tokens.access_token.substring(0, 20) + '...' : 'none',
            refresh_token: tokens.refresh_token ? tokens.refresh_token.substring(0, 20) + '...' : 'none'
          });
          
          // Validate tokens exist
          if (!tokens.access_token || !tokens.refresh_token) {
            console.log(`❌ [${new Date().toISOString()}] Invalid token format, clearing auth`);
            await clearAuth();
            return;
          }
          
          // Set tokens in API service
          apiService.setTokens(tokens);
          
          // Verify token is still valid by fetching user profile with timeout
          console.log(`🔍 [${new Date().toISOString()}] Verifying token with API...`);
          const apiTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API verification timeout')), 3000)
          );
          
          try {
            const currentUser = await Promise.race([
              apiService.getCurrentUser(),
              apiTimeout
            ]);
            
            if (currentUser) {
              console.log(`✅ [${new Date().toISOString()}] Token is valid, user authenticated`);
              setUser(currentUser);
              setIsAuthenticated(true);
              setIsLoadingAuth(false);
              debugSetIsLoading(false);
            } else {
              console.log(`❌ [${new Date().toISOString()}] Token is invalid, trying to refresh...`);
              // Token is invalid, try to refresh with timeout
              const refreshTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Token refresh timeout')), 2000)
              );
              
              try {
                const refreshed = await Promise.race([
                  refreshToken(),
                  refreshTimeout
                ]);
                
                if (!refreshed) {
                  console.log(`❌ [${new Date().toISOString()}] Token refresh failed, clearing auth`);
                  await clearAuth();
                }
              } catch (refreshError) {
                console.log(`❌ [${new Date().toISOString()}] Token refresh error:`, refreshError);
                await clearAuth();
              }
            }
          } catch (apiError) {
            console.log(`❌ [${new Date().toISOString()}] API verification error:`, apiError);
            await clearAuth();
          }
        } catch (parseError) {
          console.error(`❌ [${new Date().toISOString()}] Error parsing stored auth data:`, parseError);
          await clearAuth();
        }
      } else {
        console.log(`❌ [${new Date().toISOString()}] No stored auth found, redirecting to login`);
        // Set loading states to false before redirecting
        setIsLoadingAuth(false);
        debugSetIsLoading(false);
        // Redirect to login if no auth found
        router.replace('/login');
      }
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Error loading stored auth:`, error);
      await clearAuth();
    } finally {
      // Clear timeout if it's still active
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      console.log(`🔄 [${new Date().toISOString()}] Setting loading states to false in finally block`);
      setIsLoadingAuth(false);
      debugSetIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      debugSetIsLoading(true);
      console.log('🔄 Attempting login...');
      const response = await apiService.login(username, password);
      
      if (response) {
        const { access_token, refresh_token, user: userData } = response;
        
        console.log('🔑 Login response received:', {
          access_token: access_token ? access_token.substring(0, 20) + '...' : 'none',
          refresh_token: refresh_token ? refresh_token.substring(0, 20) + '...' : 'none',
          user: userData ? `${userData.username} (${userData.email})` : 'none'
        });
        
        // Validate response data
        if (!access_token || !refresh_token) {
          console.log('❌ Invalid login response data - missing tokens');
          return false;
        }
        
        // Handle case where user data is missing or invalid
        let finalUserData = userData;
        if (!userData || (typeof userData === 'string' && userData === 'none') || typeof userData !== 'object') {
          console.log('⚠️ User data missing from login response, fetching separately...');
          try {
            // Set tokens first so we can make authenticated requests
            await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify({ access_token, refresh_token }));
            apiService.setTokens({ access_token, refresh_token });
            
            // Fetch user data
            finalUserData = await apiService.getCurrentUser();
            console.log('✅ User data fetched separately:', finalUserData);
          } catch (error) {
            console.error('❌ Failed to fetch user data:', error);
            return false;
          }
        }
        
        // Store tokens and user data
        try {
          await Promise.all([
            AsyncStorage.setItem(TOKEN_KEY, JSON.stringify({ access_token, refresh_token })),
            AsyncStorage.setItem(USER_KEY, JSON.stringify(finalUserData))
          ]);
          console.log('✅ Tokens and user data stored successfully');
        } catch (storageError) {
          console.error('❌ Error storing auth data:', storageError);
          return false;
        }
        
        // Set tokens in API service
        apiService.setTokens({ access_token, refresh_token });
        console.log('🔑 Tokens set in API service');
        
        setUser(finalUserData);
        setIsAuthenticated(true);
        console.log('✅ User authenticated, navigating to tabs');
        router.replace('/(tabs)');
        return true;
      }
      console.log('❌ No response from login API');
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    } finally {
      debugSetIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      debugSetIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response) {
        const { access_token, refresh_token, user: newUser } = response;
        
        // Store tokens and user data
        await Promise.all([
          AsyncStorage.setItem(TOKEN_KEY, JSON.stringify({ access_token, refresh_token })),
          AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser))
        ]);
        
        // Set tokens in API service
        apiService.setTokens({ access_token, refresh_token });
        console.log('🔑 Registration successful, tokens stored and set');
        
        setUser(newUser);
        setIsAuthenticated(true);
        router.replace('/(tabs)');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      debugSetIsLoading(false);
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
      console.log(`🧹 [${new Date().toISOString()}] Clearing authentication data...`);
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY)
      ]);
      
      apiService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      authLoadAttempted = false; // Reset the global flag
      loadingStateChanges = 0; // Reset the counter
      console.log(`✅ [${new Date().toISOString()}] Auth cleared, redirecting to login`);
      router.replace('/login');
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Error clearing auth:`, error);
      // Force redirect even if clearing fails
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      authLoadAttempted = false; // Reset the global flag
      loadingStateChanges = 0; // Reset the counter
      router.replace('/login');
    }
  };

  // Manual reset function for debugging
  const resetAuthLoading = () => {
    authLoadAttempted = false;
    setIsLoadingAuth(false);
    debugSetIsLoading(true);
    console.log(`🔄 [${new Date().toISOString()}] Auth loading state manually reset`);
  };

  // Force login function to break out of loading state
  const forceLogin = useCallback(() => {
    console.log(`🚨 [${new Date().toISOString()}] Force login called - breaking out of loading state`);
    authLoadAttempted = false;
    setIsLoadingAuth(false);
    loadingStateChanges = 0; // Reset the counter
    debugSetIsLoading(false);
    setIsAuthenticated(false);
    setUser(null);
    // Don't call router.replace here - let the layout handle navigation
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    clearAuth,
    forceLogin
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
