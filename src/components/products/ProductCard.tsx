import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { addToFavorites, removeFromFavorites } from '../../store/slices/favoriteSlice';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Product } from '../../types';
import { getUserId } from '../../utils/auth';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { favorites } = useSelector((state: RootState) => state.favorites);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Efecto para inicializar y debuggear la URL de la imagen
  useEffect(() => {
    //console.log('Product data:', product);
    //console.log('Product images:', product.images);
    const initialUrl = product.images?.[0]?.image || '/images/products/default-product.jpg';
    //console.log('Initial image URL:', initialUrl);
    setImageUrl(initialUrl);
  }, [product]);

  const isFavorite = favorites.includes(product.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFavorite) {
        await dispatch(removeFromFavorites(product.id));
      } else {
        await dispatch(addToFavorites(product.id));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-success-100 text-success-800';
      case 'sold':
        return 'bg-error-100 text-error-800';
      case 'reserved':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageError = () => {
    setImageUrl('/images/products/default-product.jpg');
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    //console.log('Image loaded successfully:', imageUrl);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isFavorite ? (
            <FaHeart className="text-red-500 text-xl" />
          ) : (
            <FaRegHeart className="text-gray-500 text-xl hover:text-red-500" />
          )}
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(product.status)}`}>
            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {product.categories.map((category) => (
            <span 
              key={category.id}
              className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full"
            >
              {category.name}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-primary-600 font-bold">{formatPrice(product.price)}</span>
          <span className="text-sm text-gray-500">{product.location}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;