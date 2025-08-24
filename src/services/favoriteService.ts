import axios from 'axios';
import { getToken, getUserId } from '../utils/auth';
import {API_BASE_URL as API_URL} from '../config/api';


// Función para obtener el ID numérico del usuario
const getNumericUserId = (): number => {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
};

export const favoriteService = {
  getUserFavorites: async () => {
    try {
      const userId = getNumericUserId();
      const response = await axios.get(`${API_URL}/favorite/${userId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user favorites:', error);
      // Si es un error 500, retornar estructura vacía
      if (error.response?.status === 500) {
        return { productIds: [] };
      }
      // Para otros errores, también retornar estructura vacía
      return { productIds: [] };
    }
  },

  addToFavorites: async (productId: number) => {
    try {
      const userId = getNumericUserId();
      const response = await axios.post(
        `${API_URL}/favorite/${userId}/products/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  removeFromFavorites: async (productId: number) => {
    try {
      const userId = getNumericUserId();
      const response = await axios.delete(
        `${API_URL}/favorite/${userId}/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  isFavorite: async (productId: number) => {
    try {
      const userId = getNumericUserId();
      const response = await axios.get(
        `${API_URL}/favorite/${userId}/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      throw error;
    }
  },
};