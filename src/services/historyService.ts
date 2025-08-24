import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getToken } from '../utils/auth';

const api = axios.create({
  baseURL: API_ENDPOINTS.HISTORY,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('History API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('History API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const historyService = {
  getHistoryByUserId: async (userId: number) => {
    try {
      const response = await api.get(`/user/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching history:', error);
      // Si es un error 500 y el mensaje indica que no hay transacciones, retornar estructura vacía
      if (error.response?.status === 500 && error.response?.data?.includes('No transactions found')) {
        return {
          orders: [],
          totalOrders: 0
        };
      }
      // Para otros errores, también retornar estructura vacía
      return {
        orders: [],
        totalOrders: 0
      };
    }
  },
}; 