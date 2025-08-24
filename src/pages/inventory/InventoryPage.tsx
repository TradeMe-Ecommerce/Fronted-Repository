import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchUserInventories, removeFromInventory, updateInventory, addToInventory } from '../../store/slices/inventorySlice';
import { fetchProducts } from '../../store/slices/productSlice';
import Spinner from '../../components/common/Spinner';
import { Package, Trash2, Plus, Save, X } from 'lucide-react';
import { getUserId } from '../../utils/auth';
import { Product } from '../../types';

interface InventoryProduct extends Product {
  stock: number;
}

const InventoryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products: inventoryProducts, isLoading: isInventoryLoading } = useSelector((state: RootState) => state.inventory);
  const { products: allProducts, isLoading: isProductsLoading } = useSelector((state: RootState) => state.products);
  const [activeTab, setActiveTab] = useState<'inventory' | 'add'>('inventory');
  const [editingStock, setEditingStock] = useState<{ [key: number]: number }>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = useCallback(() => {
    const userId = getUserId();
    if (userId) {
      dispatch(fetchUserInventories(userId));
      dispatch(fetchProducts());
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveFromInventory = useCallback(async (productId: number) => {
    const userId = getUserId();
    if (userId) {
      try {
        await dispatch(removeFromInventory({ userId, productId })).unwrap();
        loadData();
      } catch (error) {
        console.error('Error removing from inventory:', error);
      }
    }
  }, [dispatch, loadData]);

  const handleAddToInventory = useCallback(async (productId: number) => {
    const userId = getUserId();
    if (userId) {
      try {
        await dispatch(addToInventory({ userId, productId })).unwrap();
        loadData();
      } catch (error) {
        console.error('Error adding to inventory:', error);
      }
    }
  }, [dispatch, loadData]);

  const handleStockChange = (productId: number, newStock: number) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: newStock
    }));
  };

  const handleUpdateStock = async (productId: number) => {
    const userId = getUserId();
    if (userId && editingStock[productId] !== undefined) {
      setIsUpdating(true);
      try {
        await dispatch(updateInventory({
          userId,
          productId,
          stock: editingStock[productId]
        })).unwrap();
        setEditingStock(prev => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      } catch (error) {
        console.error('Error updating stock:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const isLoading = isInventoryLoading || isProductsLoading;

  // Add this new function to check if a product is in inventory
  const isProductInInventory = (productId: number): boolean => {
    return inventoryProducts.some(invProduct => invProduct.id === productId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`${
              activeTab === 'inventory'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Current Inventory
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`${
              activeTab === 'add'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Add Products
          </button>
        </nav>
      </div>

      {activeTab === 'inventory' ? (
        // Current Inventory Tab
        <div>
          {inventoryProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Your inventory is empty</h2>
              <p className="mt-2 text-gray-600">
                Add some products to your inventory to see them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(inventoryProducts as InventoryProduct[]).map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">ID: {product.id}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromInventory(product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from inventory"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-gray-900">{product.description}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Price</p>
                      <p className="text-gray-900">${product.price}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Stock</p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          value={editingStock[product.id] ?? product.stock}
                          onChange={(e) => handleStockChange(product.id, parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border rounded-md"
                        />
                        {editingStock[product.id] !== undefined && (
                          <button
                            onClick={() => handleUpdateStock(product.id)}
                            disabled={isUpdating}
                            className="p-1 text-primary-600 hover:text-primary-700"
                            title="Save changes"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Add Products Tab
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">ID: {product.id}</p>
                  </div>
                  <button
                    onClick={() => handleAddToInventory(product.id)}
                    disabled={isProductInInventory(product.id)}
                    className={`p-2 transition-colors ${
                      isProductInInventory(product.id)
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-primary-500'
                    }`}
                    title={isProductInInventory(product.id) ? 'Already in inventory' : 'Add to inventory'}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900">{product.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-gray-900">${product.price}</p>
                  </div>

                  {isProductInInventory(product.id) && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In your inventory
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage; 