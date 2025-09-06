import axios, { AxiosInstance, AxiosResponse } from 'axios';

//const API_BASE_URL = 'https://lookingforgroup.cloud/api';
const API_BASE_URL = 'http://localhost:5000/api';

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

interface RefreshResponse {
  access_token: string;
}

class ApiService {
  private api: AxiosInstance;
  private tokens: AuthTokens | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.tokens?.access_token) {
          config.headers.Authorization = `Bearer ${this.tokens.access_token}`;
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

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${this.tokens?.access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            this.clearTokens();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setTokens(tokens: AuthTokens) {
    this.tokens = tokens;
  }

  clearTokens() {
    this.tokens = null;
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
      if (!this.tokens?.refresh_token) {
        throw new Error('No refresh token available');
      }

      const response: AxiosResponse<RefreshResponse> = await this.api.post('/auth/refresh');
      
      // Update access token
      if (this.tokens) {
        this.tokens.access_token = response.data.access_token;
      }

      return response.data;
    } catch (error) {
      console.error('Refresh token API error:', error);
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
