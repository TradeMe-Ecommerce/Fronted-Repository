import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { Product, ProductFilters, Category } from '../types';
import { getToken, getUserId } from '../utils/auth';
import { getImagesByProductId } from '../mocks/imageMocks';

const api = axios.create({
  baseURL: API_ENDPOINTS.PRODUCTS,
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función para transformar los datos del producto
const transformProductData = (product: any): Product => {
  //console.log('Product data before transform:', product);
  
  if (!product || !product.images) {
    //console.log('No product or images found');
    return {
      ...product,
      images: []
    };
  }
  
  const transformedProduct = {
    ...product,
    images: product.images.map((img: any) => ({
      id: img.id,
      productId: product.id,
      image: img.image || img.url || getImagesByProductId(product.id, 1)[0]
    }))
  };
  
  //console.log('Transformed product:', transformedProduct);
  return transformedProduct;
};

// Función para agregar un producto al inventario
const addToInventory = async (productId: number, stock: number = 1) => {
  try {
    const userId = getUserId();
    const token = getToken();
    const response = await axios.post(
      `${API_ENDPOINTS.USERS}/${userId}/add-inventory?productId=${productId}&stock=${stock}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding product to inventory:', error);
    throw error;
  }
};

export const productService = {
  getAllProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.searchTerm) {
        params.append('name', filters.searchTerm);
      }
      
      if (filters?.categories && filters.categories.length > 0) {
        filters.categories.forEach(categoryId => {
          params.append('categoryId', categoryId.toString());
        });
      }
      
      if (filters?.minPrice) {
        params.append('minPrice', filters.minPrice.toString());
      }
      
      if (filters?.maxPrice) {
        params.append('maxPrice', filters.maxPrice.toString());
      }
      
      if (filters?.status) {
        params.append('status', filters.status);
      }
      
      if (filters?.location) {
        params.append('location', filters.location);
      }

      console.log('Fetching products with params:', params.toString());
      const response = await api.get('', { params });
      console.log('Products response:', response.data);
      
      return response.data.map((product: any) => ({
        ...product,
        images: product.images.map((img: any) => ({
          id: img.id,
          url: img.url
        }))
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await api.get(`/${id}`);
      return transformProductData(response.data);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  createProduct: async (productData: {
    name: string;
    description: string;
    price: number;
    date: string;
    location: string;
    status: string;
    categories: Category[];
  }): Promise<Product> => {
    try {
      const response = await api.post('', productData);
      return transformProductData(response.data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id: number, product: FormData): Promise<Product> => {
    try {
      const response = await api.put(`/${id}`, product, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return transformProductData(response.data);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id: number): Promise<void> => {
    try {
      await api.delete(`/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  updateProductStatus: async (id: number, status: string): Promise<Product> => {
    try {
      const response = await api.patch(`/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id} status:`, error);
      throw error;
    }
  },
};

export default productService;