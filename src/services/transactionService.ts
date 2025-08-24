import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getToken, getUserId } from '../utils/auth';

const api = axios.create({
  baseURL: API_ENDPOINTS.TRANSACTIONS,
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
    console.log('Transaction API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Transaction API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

interface CreateTransactionData {
  userId: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  price: number;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';
  amount: number;
  productId: number;
}

export const transactionService = {
  createTransaction: async (inventoryId: number, transactionData: CreateTransactionData) => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Creating transaction with data:', {
        buyerId: userId,
        inventoryId,
        transactionData
      });

      const response = await api.post(`/${userId}`, {
        userId: transactionData.userId,
        status: transactionData.status,
        price: transactionData.price,
        paymentMethod: transactionData.paymentMethod,
        amount: transactionData.amount,
        productId: transactionData.productId,
      });

      console.log('Transaction API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating transaction:', {
        error,
        errorResponse: error.response?.data,
        status: error.response?.status,
        transactionData,
        inventoryId
      });
      throw error;
    }
  },

  getTransactionById: async (id: number) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  },

  getUserTransactions: async (userId: number) => {
    try {
      const response = await api.get(`/user/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Transaction API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Si es un error 500 y el mensaje indica que no hay transacciones, retornar array vacío
      if (error.response?.status === 500 && 
          error.response?.data?.includes('No transactions found')) {
        return [];
      }
      
      // Para otros errores, también retornar array vacío
      return [];
    }
  },

  updateTransactionStatus: async (transactionData: {
    id: number;
    userId: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    price: number;
    paymentMethod: string;
    amount: number;
    productId: number;
    orderId: number;
  }) => {
    try {
      const response = await api.put('', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },
};