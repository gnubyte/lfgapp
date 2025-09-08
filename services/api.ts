import axios, { AxiosInstance, AxiosResponse } from 'axios';

//const API_BASE_URL = 'https://lookingforgroup.cloud/api';
const API_BASE_URL = 'http://localhost:5000/api'; // Direct connection in production

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
  };
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
  };
}

interface RefreshResponse {
  access_token: string;
}

export interface TimelinePost {
  id: number;
  type: 'group_post' | 'user_post' | 'event_created' | 'event_updated' | 'event_deleted';
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
    display_name: string;
    profile_picture?: string;
  };
  group?: {
    id: number;
    name: string;
  };
  event?: {
    id: number;
    title: string;
    event_date: string;
    location?: string;
  };
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

interface TimelineResponse {
  items: TimelinePost[];
  has_more?: boolean;
  next_cursor?: string;
  prev_cursor?: string;
}

class ApiService {
  private api: AxiosInstance;
  private tokens: AuthTokens | null = null;
  private isRefreshing: boolean = false;
  private refreshAttempts: number = 0;
  private lastRefreshAttempt: number = 0;
  private readonly maxCooldown: number = 500000; // 500 seconds in milliseconds
  private readonly baseCooldown: number = 1000; // 1 second base cooldown

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.tokens?.access_token) {
          // Ensure the token is properly formatted
          const token = this.tokens.access_token.trim();
          if (token.startsWith('Bearer ')) {
            config.headers.Authorization = token;
          } else {
            config.headers.Authorization = `Bearer ${token}`;
          }
          console.log(`🔑 [${new Date().toISOString()}] Adding token to request:`, token.substring(0, 20) + '...');
          console.log(`🔑 [${new Date().toISOString()}] Full Authorization header:`, config.headers.Authorization);
        } else {
          console.log(`❌ [${new Date().toISOString()}] No token available for request`);
          console.log(`❌ [${new Date().toISOString()}] Current tokens state:`, this.tokens);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !this.isRefreshing) {
          // Check if we can attempt a refresh (cooldown check)
          if (!this.canAttemptRefresh()) {
            const remainingCooldown = this.getRefreshCooldown() - (Date.now() - this.lastRefreshAttempt);
            console.log(`⏳ [${new Date().toISOString()}] Refresh on cooldown, waiting ${Math.round(remainingCooldown / 1000)}s before next attempt`);
            return Promise.reject(error);
          }

          console.log(`🔄 [${new Date().toISOString()}] 401 error detected, attempting token refresh...`);
          originalRequest._retry = true;
          this.isRefreshing = true;
          this.lastRefreshAttempt = Date.now();
          this.refreshAttempts++;

          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              console.log(`✅ [${new Date().toISOString()}] Token refresh successful, retrying request`);
              this.resetRefreshAttempts();
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${this.tokens?.access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.error(`❌ [${new Date().toISOString()}] Token refresh failed (attempt ${this.refreshAttempts}):`, refreshError);
            // Don't clear tokens immediately, let cooldown handle retries
            if (this.refreshAttempts >= 5) {
              console.log(`🚫 [${new Date().toISOString()}] Max refresh attempts reached, clearing tokens`);
              this.clearTokens();
            }
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setTokens(tokens: AuthTokens) {
    this.tokens = tokens;
    console.log(`🔑 [${new Date().toISOString()}] Tokens set in API service:`, {
      access_token: tokens.access_token ? tokens.access_token.substring(0, 20) + '...' : 'none',
      refresh_token: tokens.refresh_token ? tokens.refresh_token.substring(0, 20) + '...' : 'none'
    });
  }

  clearTokens() {
    this.tokens = null;
    this.refreshAttempts = 0;
    this.lastRefreshAttempt = 0;
  }

  // Calculate cooldown based on number of attempts (exponential backoff)
  private getRefreshCooldown(): number {
    const exponentialDelay = this.baseCooldown * Math.pow(2, this.refreshAttempts);
    return Math.min(exponentialDelay, this.maxCooldown);
  }

  // Check if enough time has passed since last refresh attempt
  private canAttemptRefresh(): boolean {
    const now = Date.now();
    const timeSinceLastAttempt = now - this.lastRefreshAttempt;
    const requiredCooldown = this.getRefreshCooldown();
    
    console.log(`⏰ [${new Date().toISOString()}] Refresh cooldown check:`, {
      attempts: this.refreshAttempts,
      timeSinceLastAttempt: Math.round(timeSinceLastAttempt / 1000) + 's',
      requiredCooldown: Math.round(requiredCooldown / 1000) + 's',
      canAttempt: timeSinceLastAttempt >= requiredCooldown
    });
    
    return timeSinceLastAttempt >= requiredCooldown;
  }

  // Reset refresh attempts on successful refresh
  private resetRefreshAttempts() {
    this.refreshAttempts = 0;
    this.lastRefreshAttempt = 0;
    console.log(`✅ [${new Date().toISOString()}] Refresh attempts reset after successful refresh`);
  }

  // Get current refresh status for debugging
  getRefreshStatus() {
    const now = Date.now();
    const timeSinceLastAttempt = now - this.lastRefreshAttempt;
    const requiredCooldown = this.getRefreshCooldown();
    const remainingCooldown = Math.max(0, requiredCooldown - timeSinceLastAttempt);
    
    return {
      attempts: this.refreshAttempts,
      isRefreshing: this.isRefreshing,
      timeSinceLastAttempt: Math.round(timeSinceLastAttempt / 1000),
      requiredCooldown: Math.round(requiredCooldown / 1000),
      remainingCooldown: Math.round(remainingCooldown / 1000),
      canAttempt: timeSinceLastAttempt >= requiredCooldown
    };
  }

  // Manually reset refresh cooldown (for testing or emergency use)
  resetRefreshCooldown() {
    this.refreshAttempts = 0;
    this.lastRefreshAttempt = 0;
    console.log(`🔄 [${new Date().toISOString()}] Refresh cooldown manually reset`);
  }

  async login(username: string, password: string): Promise<LoginResponse | null> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', {
        username,
        password,
      });

      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse | null> {
    try {
      const response: AxiosResponse<RegisterResponse> = await this.api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user API error:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<RefreshResponse | null> {
    try {
      console.log(`🔄 [${new Date().toISOString()}] Starting token refresh (attempt ${this.refreshAttempts + 1})...`);
      if (!this.tokens?.refresh_token) {
        throw new Error('No refresh token available');
      }

      // Check cooldown before attempting refresh
      if (!this.canAttemptRefresh()) {
        const remainingCooldown = this.getRefreshCooldown() - (Date.now() - this.lastRefreshAttempt);
        throw new Error(`Refresh on cooldown, wait ${Math.round(remainingCooldown / 1000)}s`);
      }

      // Create a new axios instance for refresh to avoid interceptor loops
      const refreshApi = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });

      // Add only the refresh token to the request
      refreshApi.interceptors.request.use((config) => {
        if (this.tokens?.refresh_token) {
          config.headers.Authorization = `Bearer ${this.tokens.refresh_token}`;
          console.log(`🔑 [${new Date().toISOString()}] Using refresh token for refresh request`);
        }
        return config;
      });

      // Don't add response interceptor to refresh API to avoid loops

      const response: AxiosResponse<RefreshResponse> = await refreshApi.post('/auth/refresh');
      console.log(`✅ [${new Date().toISOString()}] Token refresh API call successful`);
      
      // Update access token
      if (this.tokens) {
        this.tokens.access_token = response.data.access_token;
        console.log(`🔑 [${new Date().toISOString()}] Access token updated in memory`);
      }

      return response.data;
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Refresh token API error:`, error);
      throw error;
    }
  }

  async logout() {
    try {
      // The API doesn't have a logout endpoint, so we just clear local tokens
      this.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getTimeline(params?: {
    since?: string;
    before?: string;
    limit?: number;
  }): Promise<TimelineResponse | null> {
    try {
      console.log('🌐 Making timeline API request with params:', params);
      console.log('🌐 Current tokens:', this.tokens ? 'available' : 'none');
      
      const queryParams: Record<string, any> = {};
      if (params?.since) queryParams.since = params.since;
      if (params?.before) queryParams.before = params.before;
      if (params?.limit) queryParams.limit = params.limit;
      
      const response = await this.api.get('/timeline/', {
        params: queryParams
      });
      console.log('🌐 Timeline API response:', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Timeline API error:', error);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
      }
      throw error;
    }
  }

  // Generic method for making authenticated requests
  async request<T>(config: any): Promise<T> {
    try {
      const response = await this.api(config);
      return response.data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
