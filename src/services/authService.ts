import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { LoginRequest, AuthResponse, User, RegisterRequest } from '../types';
import { getToken } from '../utils/auth';

console.log('🔍 API_ENDPOINTS loaded:', API_ENDPOINTS);

const api = axios.create({
  baseURL: API_ENDPOINTS.AUTH,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('🔍 Main API instance created with baseURL:', API_ENDPOINTS.AUTH);

// Add auth token to requests
api.interceptors.request.use((config) => {
  console.log('🔍 Request interceptor - Original config:', {
    url: config.url,
    baseURL: config.baseURL,
    method: config.method
  });
  
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('🔍 Request interceptor - Final config:', {
    url: config.url,
    baseURL: config.baseURL,
    method: config.method,
    fullURL: `${config.baseURL}${config.url}`
  });
  
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🔍 Response interceptor - Error:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔍 LOGIN - Making request to:', `${API_ENDPOINTS.AUTH}/login`);
      const response = await api.post('/login', credentials);
      localStorage.setItem('userId', String(response.data.userId));
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { name, email, password } = userData;
      const response = await api.post('/register', { name, username: email, password });
      return response.data;
    } catch (error) {
      console.error('🔍 REGISTER - Registration error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔍 GET_USER - Making request to:', `${API_ENDPOINTS.AUTH}/me`);
      const response = await api.get('/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      console.log('🔍 UPDATE_PROFILE - Making request to:', `${API_ENDPOINTS.AUTH}/profile`);
      const response = await api.put('/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};