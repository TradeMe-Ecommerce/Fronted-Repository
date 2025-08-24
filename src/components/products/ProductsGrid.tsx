import React from 'react';
import ProductCard from './ProductCard';
import Spinner from '../common/Spinner';
import { Product } from '../../types/product';

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {products.length} products
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
};

export default ProductsGrid; 