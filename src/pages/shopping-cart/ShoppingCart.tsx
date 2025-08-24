import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchCart, removeFromCart, updateCartItem } from '../../store/slices/shoppingCartSlice';
import ProductCard from '../../components/products/ProductCard';
import Spinner from '../../components/common/Spinner';
import { ShoppingBag, Trash2, Plus, Minus, X, Receipt } from 'lucide-react';

const ShoppingCart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items = [], products = [], isLoading } = useSelector((state: RootState) => state.shoppingCart);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const loadCart = useCallback(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    loadCart();
  }, [dispatch, loadCart]);

  const handleRemoveFromCart = useCallback(async (productId: number) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
      loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [dispatch, loadCart]);

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(productId);
    try {
      await dispatch(updateCartItem({ productId, quantity: newQuantity })).unwrap();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      const cartItem = items.find(item => item.productId === product.id);
      return total + (product.price * (cartItem?.quantity || 1));
    }, 0);
  };

  const ReceiptModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Order Receipt</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="text-sm text-gray-600">Date: {currentDate}</p>
            <p className="text-sm text-gray-600">Time: {currentTime}</p>
          </div>

          <div className="space-y-4 mb-4">
            {products.map((product) => {
              const cartItem = items.find(item => item.productId === product.id);
              if (!cartItem) return null;
              
              return (
                <div key={product.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {cartItem.quantity}</p>
                  </div>
                  <p className="font-medium">${(product.price * cartItem.quantity).toFixed(2)}</p>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-bold text-primary-600">${calculateTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="container-app py-12">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">
            Add some products to your cart to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productos */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((product) => {
              const cartItem = items.find(item => item.productId === product.id);
              return (
                <div key={product.id} className="relative bg-white rounded-lg shadow-md overflow-hidden">
                  <ProductCard product={product} />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleRemoveFromCart(product.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                  {cartItem && (
                    <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-full shadow-md flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(product.id, cartItem.quantity - 1)}
                        disabled={updatingItem === product.id || cartItem.quantity <= 1}
                        className="p-1 hover:text-primary-600 disabled:text-gray-300"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium min-w-[2rem] text-center">
                        {updatingItem === product.id ? (
                          <Spinner size="sm" />
                        ) : (
                          cartItem.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(product.id, cartItem.quantity + 1)}
                        disabled={updatingItem === product.id}
                        className="p-1 hover:text-primary-600 disabled:text-gray-300"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen del carrito */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Cart Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <button 
                  onClick={() => setShowReceipt(true)}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Receipt className="h-5 w-5" />
                  <span>View Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReceipt && <ReceiptModal onClose={() => setShowReceipt(false)} />}
    </div>
  );
};

export default ShoppingCart; 