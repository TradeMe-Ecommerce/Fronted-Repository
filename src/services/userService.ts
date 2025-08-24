// services/userService.ts
import api from './api';
import { User } from '../types';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getToken } from '../utils/auth';

interface UpdateUserProfileData {
  name: string;
  email: string;
  phone: string;
}

export const userService = {
  getUserProfile: async (userId: number) => {
    try {
      const token = getToken();
      //console.log('Fetching user profile for ID:', userId);
      //console.log('Using token:', token);
      
      const response = await axios.get(`${API_ENDPOINTS.USERS}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      //console.log('User profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get(`users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  async getUserById(id: number): Promise<User> {
    const response = await api.get(`users/${id}`);
    return response.data;
  },
  async getCurrentUser(): Promise<User> {
    const response = await api.get('users/me');
    return response.data;
  },
  updateUserProfile: async (userId: number, data: UpdateUserProfileData) => {
    try {
      const token = getToken();
      const response = await axios.put(`${API_ENDPOINTS.USERS}`, {
        id: userId,
        ...data
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
}; 
