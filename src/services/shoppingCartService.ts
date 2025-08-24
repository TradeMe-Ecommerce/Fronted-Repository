import axios from 'axios';
import { getToken, getUserId } from '../utils/auth';
import { productService } from './productService';
import {API_BASE_URL as API_URL} from '../config/api';

// Configurar interceptor para logging
axios.interceptors.request.use(request => {
  if (request.url?.includes('/shopping-cart')) {
    console.log('Cart Request:', {
      method: request.method,
      url: request.url,
      params: request.params
    });
  }
  return request;
});

axios.interceptors.response.use(
  response => {
    if (response.config.url?.includes('/shopping-cart')) {
      console.log('Cart Response:', {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  error => {
    if (error.config?.url?.includes('/shopping-cart')) {
      console.error('Cart Error:', {
        status: error.response?.status,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

// Función para obtener el ID numérico del usuario
const getNumericUserId = (): number => {
  const userId = getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
};

export const shoppingCartService = {
  getCart: async () => {
    try {
      const userId = getNumericUserId();
      const token = getToken();
      const response = await axios.get(`${API_URL}/shopping-cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.data || !response.data.cartListings) {
        console.warn('Unexpected cart response format:', response.data);
        return { items: [], products: [] };
      }

      // Obtener los IDs de los productos del carrito
      const productIds = response.data.cartListings.map((item: any) => item.productId);
      
      // Obtener los detalles de los productos usando el productService
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

      // Filtrar productos nulos y mapear los items del carrito
      const validProducts = products.filter(product => product !== null);
      const items = response.data.cartListings.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity
      }));

      return { items, products: validProducts };
    } catch (error) {
      console.error('Error fetching shopping cart:', error);
      return { items: [], products: [] };
    }
  },

  getCartProducts: async (productIds: number[]) => {
    try {
      const token = getToken();
      // Enviar cada ID como un parámetro separado
      const params = new URLSearchParams();
      productIds.forEach(id => {
        params.append('ids', id.toString());
      });

      const response = await axios.get(`${API_URL}/shopping-cart/cart-listings`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cart products:', error);
      return [];
    }
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    try {
      const userId = getNumericUserId();
      const token = getToken();
      const url = `${API_URL}/shopping-cart/${userId}/add-product?productId=${productId}&quantity=${quantity}`;
      
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  removeFromCart: async (productId: number) => {
    try {
      const userId = getNumericUserId();
      const token = getToken();
      const url = `${API_URL}/shopping-cart/${userId}/remove-product?productId=${productId}`;
      
      const response = await axios.delete(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to remove product from cart');
      }

      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  updateCartItem: async (productId: number, quantity: number) => {
    try {
      const userId = getNumericUserId();
      const token = getToken();
      const url = `${API_URL}/shopping-cart/${userId}/update-product`;
      
      const response = await axios.put(
        url,
        {},
        {
          params: {
            productId,
            quantity
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },
}; 