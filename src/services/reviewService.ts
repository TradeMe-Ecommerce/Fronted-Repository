import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getToken } from '../utils/auth';

const api = axios.create({
  baseURL: API_ENDPOINTS.REVIEWS,
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

interface CreateReviewData {
  transactionId: number;
  points: number;
  description: string;
}

interface ReviewDTO {
  id: number;
  transactionId: number;
  points: number;
  description: string;
  date: string;
}

export const reviewService = {
  getReviewByTransactionId: async (transactionId: number): Promise<ReviewDTO | null> => {
    try {
      const response = await api.get(`/transaction/${transactionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getAllReviews: async (): Promise<ReviewDTO[]> => {
    try {
      const response = await api.get('');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createReview: async (reviewData: CreateReviewData): Promise<ReviewDTO> => {
    try {
      const response = await api.post('', reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};