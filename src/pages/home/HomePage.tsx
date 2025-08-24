import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import ProductCard from '../../components/products/ProductCard';
import Spinner from '../../components/common/Spinner';
import { ArrowRight, Search, ShieldCheck, Tag, Truck, X } from 'lucide-react';
import { Category } from '../../types';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, isLoading, error } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector((state: RootState) => state.categories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProducts()).unwrap(),
          dispatch(fetchCategories()).unwrap()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  const renderProducts = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => dispatch(fetchProducts())}
            className="text-primary-600 hover:text-primary-800"
          >
            Try again
          </button>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No products found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  const CategoryModal: React.FC<{ category: Category; onClose: () => void }> = ({ category, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-primary-700">{category.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="prose">
            <p className="text-gray-600">{category.description}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Buy and Sell with Confidence</h1>
              <p className="text-lg mb-6 text-primary-100">
                Icesi Trade provides a safe and efficient platform for buying and selling products between users.
              </p>
              <div className="flex space-x-4">
                <Link 
                  to="/products" 
                  className="btn px-6 py-3 bg-white text-primary-700 hover:bg-primary-50"
                >
                  Browse Products
                </Link>
                <Link 
                  to="/sell" 
                  className="btn px-6 py-3 border-2 border-white hover:bg-white hover:text-primary-700 transition-colors"
                >
                  Sell an Item
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12 flex justify-center">
              <img 
                src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="People trading" 
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-app">
          <h2 className="text-3xl font-bold text-center mb-12">How Icesi Trade Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="bg-primary-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Products</h3>
              <p className="text-gray-600">
                Browse through our wide selection of products or use search and filters to find exactly what you're looking for.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="bg-primary-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <Tag className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">List Your Items</h3>
              <p className="text-gray-600">
                Create detailed listings with images, descriptions, and set your own price to attract potential buyers.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-md transition-shadow">
              <div className="bg-primary-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe Transactions</h3>
              <p className="text-gray-600">
                Our secure messaging system and user reviews help ensure safe and trustworthy transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container-app">
          <h2 className="text-2xl font-bold mb-8">Browse Categories</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <button 
                key={category.id} 
                onClick={() => setSelectedCategory(category)}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <h3 className="text-lg font-medium group-hover:text-primary-600 transition-colors">{category.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container-app">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-800 flex items-center">
              View all products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {renderProducts()}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-accent-500 text-white">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start selling?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already buying and selling on Icesi Trade. List your first item in minutes!
          </p>
          <Link 
            to="/sell" 
            className="btn px-8 py-3 bg-white text-accent-600 hover:bg-accent-50 transition-colors"
          >
            Start Selling Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;