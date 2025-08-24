import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchFavorites } from '../../store/slices/favoriteSlice';
import { ProductCard } from '../products/ProductCard';
import { productService } from '../../services/productService';
import { Product } from '../../types';

const FavoritesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { favorites, isLoading, error } = useSelector((state: RootState) => state.favorites);
  const [products, setProducts] = React.useState<Product[]>([]);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await productService.getProducts();
        const favoriteProducts = allProducts.filter(product => favorites.includes(product.id));
        setProducts(favoriteProducts);
      } catch (error) {
        console.error('Error fetching favorite products:', error);
      }
    };

    if (favorites.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [favorites]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Favorites Yet</h2>
          <p className="text-gray-600">Add some products to your favorites to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage; 