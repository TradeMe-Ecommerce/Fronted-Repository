import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { getToken } from '../utils/auth';
import { Product } from '../types';
import { productService } from './productService';

interface InventoryItem {
  id: number;
  productId: number;
  stock: number;
  userId: number;
}

const api = axios.create({
  baseURL: API_ENDPOINTS.USERS,
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
    console.log('Inventory API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Inventory API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const inventoryService = {
  async getUserInventories(userId: number): Promise<Product[]> {
    try {
      console.log('Fetching inventories for user:', userId);
      const response = await api.get(`/${userId}/inventories`);
      console.log('Inventories response:', response.data);

      // Obtener los IDs de los productos del inventario
      const productIds = response.data.map((item: InventoryItem) => item.productId);
      console.log('Product IDs from inventory:', productIds);

      // Obtener los detalles de los productos usando Promise.all
      const products = await Promise.all(
        productIds.map(async (productId: number) => {
          try {
            return await productService.getProductById(productId);
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            return null;
          }
        })
      );

      // Filtrar productos nulos y combinar con la información del inventario
      const validProducts = products.filter((product): product is Product => product !== null);
      const inventoryWithProducts = response.data.map((item: InventoryItem) => {
        const product = validProducts.find(p => p.id === item.productId);
        if (!product) return null;
        return {
          ...product,
          stock: item.stock,
          inventoryId: item.id
        };
      }).filter((item): item is Product => item !== null);

      return inventoryWithProducts;
    } catch (error) {
      console.error('Error fetching user inventories:', error);
      throw error;
    }
  },

  async addToInventory(userId: number, productId: number): Promise<Product> {
    try {
      console.log('Adding to inventory:', { userId, productId });
      const response = await api.post(`/${userId}/add-inventory`, null, {
        params: {
          productId,
          stock: 1 // Default stock value
        }
      });
      console.log('Add to inventory response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding product to inventory:', error);
      throw error;
    }
  },

  async removeFromInventory(userId: number, productId: number): Promise<void> {
    try {
      console.log('Removing from inventory:', { userId, productId });
      const response = await api.delete(`/${userId}/remove-inventory`, {
        params: {
          productId
        }
      });
      console.log('Remove from inventory response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing product from inventory:', error);
      throw error;
    }
  },

  getProductInventories: async (productId: number) => {
    try {
      const token = getToken();
      const response = await api.get(`/inventories/productid?id=${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product inventories:', error);
      throw error;
    }
  },

  async updateInventory(userId: number, productId: number, stock: number): Promise<void> {
    try {
      console.log('Updating inventory:', { userId, productId, stock });
      const response = await api.put(`/${userId}/update-inventory`, null, {
        params: {
          productId,
          stock
        }
      });
      console.log('Update inventory response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  },
}; 