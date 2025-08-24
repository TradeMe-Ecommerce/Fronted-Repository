import { Category } from '../types';
import api from './api';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/category');
    return response.data;
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get(`/categor/${id}`);
    return response.data;
  }
};