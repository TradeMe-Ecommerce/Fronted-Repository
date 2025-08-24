import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProducts, setFilters } from '../../store/slices/productSlice';
import ProductCard from '../../components/products/ProductCard';
import ProductFilters from '../../components/products/ProductFilters';
import Spinner from '../../components/common/Spinner';

const SearchResults: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const { products, isLoading, filters } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    const term = searchParams.get('term');
    if (term) {
      dispatch(setFilters({ ...filters, searchTerm: term }));
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold mb-6">
        {searchParams.get('term') 
          ? `Search Results for "${searchParams.get('term')}"`
          : 'Browse Products'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <ProductFilters />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900">No results found</h2>
              <p className="mt-2 text-gray-600">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;