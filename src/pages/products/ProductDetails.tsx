import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProductById, updateProductStatus } from '../../store/slices/productSlice';
import { addToFavorites, removeFromFavorites } from '../../store/slices/favoriteSlice';
import { addToCart } from '../../store/slices/shoppingCartSlice';
import { createRoom } from '../../store/slices/messageSlice';
import Spinner from '../../components/common/Spinner';
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Tag,
  ChevronLeft,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { selectedProduct, isLoading } = useSelector((state: RootState) => state.products);
  const { favorites } = useSelector((state: RootState) => state.favorites);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { items = [] } = useSelector((state: RootState) => state.shoppingCart);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(parseInt(id)));
    }
  }, [dispatch, id]);

  if (isLoading || !selectedProduct) {
    return (
      <div className="container-app py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isFavorite = favorites.includes(selectedProduct.id);
  const isOwnProduct = user?.id === selectedProduct.id;
  const isInCart = items.some(item => item.productId === selectedProduct?.id);

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (isFavorite) {
      dispatch(removeFromFavorites(selectedProduct.id));
    } else {
      dispatch(addToFavorites(selectedProduct.id));
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: selectedProduct.id, quantity: 1 })).unwrap();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    navigate(`/product/${selectedProduct.id}/inventories`);
  };

  const handleStatusChange = (status: string) => {
    dispatch(updateProductStatus({ id: selectedProduct.id, status }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const nextImage = () => {
    if (selectedProduct.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <Link to="/products" className="text-primary-600 hover:text-primary-800 flex items-center">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="relative">
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={selectedProduct.images[currentImageIndex]?.image || 'https://via.placeholder.com/600x600?text=No+Image'}
                alt={selectedProduct.name}
                className="w-full h-full object-contain"
              />
            </div>
            
            {selectedProduct.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            
            {/* Thumbnail gallery */}
            {selectedProduct.images.length > 1 && (
              <div className="flex mt-4 space-x-2 overflow-x-auto">
                {selectedProduct.images.map((image, index) => (
                  <div 
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`
                      w-20 h-20 flex-shrink-0 cursor-pointer border-2 rounded overflow-hidden
                      ${currentImageIndex === index ? 'border-primary-500' : 'border-transparent'}
                    `}
                  >
                    <img
                      src={image.image}
                      alt={`${selectedProduct.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6">
            <div className="mb-4">
              <span className={`
                inline-block px-3 py-1 rounded-full text-sm font-medium
                ${selectedProduct.status === 'available' ? 'bg-success-100 text-success-800' : 
                  selectedProduct.status === 'sold' ? 'bg-error-100 text-error-800' : 
                  'bg-warning-100 text-warning-800'}
              `}>
                {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {selectedProduct.name}
            </h1>
            
            <div className="text-3xl font-bold text-primary-600 mb-6">
              {formatPrice(selectedProduct.price)}
            </div>
            
            <div className="mb-6 space-y-2 text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                <span>{selectedProduct.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                <span>Listed on {selectedProduct.date}</span>
              </div>
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {selectedProduct.categories.map((category) => (
                    <span 
                      key={category.id}
                      className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded text-sm"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {selectedProduct.description}
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              {isOwnProduct ? (
                <>
                  <div className="text-sm text-gray-500 mb-2">Manage your listing:</div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => navigate(`/product/edit/${selectedProduct.id}`)}
                      className="btn-primary px-4 py-2 flex-1"
                    >
                      Edit Listing
                    </button>
                    <select
                      value={selectedProduct.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="form-input flex-1"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleAddToCart}
                    disabled={!isAuthenticated || isAddingToCart || isInCart}
                    className="btn-primary px-4 py-2 flex-1"
                  >
                    {isAddingToCart ? 'Adding...' : isInCart ? 'In Cart' : 'Add to Cart'}
                  </button>
                  <button 
                    onClick={handleContactSeller}
                    className="btn-secondary px-4 py-2 flex-1"
                  >
                    Contact Seller
                  </button>
                  <button 
                    onClick={handleFavoriteToggle}
                    className={`btn-outline px-4 py-2 flex-1 ${isFavorite ? 'text-primary-600' : ''}`}
                  >
                    <Heart className={`h-5 w-5 inline-block ${isFavorite ? 'fill-current' : ''}`} />
                    <span className="ml-2">{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                  </button>
                </>
              )}
            </div>

            {!isAuthenticated && (
              <div className="mt-4 text-center text-sm text-gray-500">
                <Link to="/login" className="text-primary-600 hover:text-primary-800">
                  Sign in
                </Link> to contact the seller, add to cart, or add to favorites
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;