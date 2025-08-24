import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchFavorites } from '../../store/slices/favoriteSlice';
import ProductCard from '../../components/products/ProductCard';
import Spinner from '../../components/common/Spinner';
import { Heart } from 'lucide-react';

const Favorites: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading: productsLoading } = useSelector((state: RootState) => state.products);
  const { favorites, isLoading: favoritesLoading } = useSelector((state: RootState) => state.favorites);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchFavorites());
  }, [dispatch]);

  const favoriteProducts = products.filter(product => favorites.includes(product.id));
  const isLoading = productsLoading || favoritesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="container-app py-12">
        <div className="text-center">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No favorites yet</h2>
          <p className="mt-2 text-gray-600">
            Start adding products to your favorites to keep track of items you're interested in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold mb-6">Favorite Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favoriteProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;