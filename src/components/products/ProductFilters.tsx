import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { setFilters, clearFilters } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { Filter, X } from 'lucide-react';
import { ProductFilters as FiltersType } from '../../types';

const ProductFilters: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);
  const { filters } = useSelector((state: RootState) => state.products);
  
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FiltersType>({
    categories: [],
    minPrice: undefined,
    maxPrice: undefined,
    location: '',
    status: '',
    searchTerm: '',
  });

  // Initialize local filters from redux state
  useEffect(() => {
    setLocalFilters({
      ...filters,
    });
  }, [filters]);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleFilterChange = (name: keyof FiltersType, value: any) => {
    setLocalFilters({
      ...localFilters,
      [name]: value,
    });
  };

  const handleCategoryChange = (categoryId: number) => {
    const currentCategories = localFilters.categories || [];
    
    if (currentCategories.includes(categoryId)) {
      handleFilterChange('categories', currentCategories.filter(id => id !== categoryId));
    } else {
      handleFilterChange('categories', [...currentCategories, categoryId]);
    }
  };

  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      categories: [],
      minPrice: undefined,
      maxPrice: undefined,
      location: '',
      status: '',
      searchTerm: '',
    });
    dispatch(clearFilters());
  };

  return (
    <div className="mb-6">
      {/* Mobile filter dialog */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        <button
          type="button"
          className="inline-flex items-center md:hidden px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Mobile filter panel */}
      {isOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
          
          <div className="relative max-w-xs w-full bg-white shadow-xl pb-12 flex flex-col overflow-y-auto">
            <div className="px-4 py-5 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile filters */}
            <div className="px-4 space-y-6">
              {/* Price filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Price</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="min-price-mobile" className="sr-only">Minimum Price</label>
                    <input
                      type="number"
                      id="min-price-mobile"
                      placeholder="Min"
                      className="form-input"
                      value={localFilters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <label htmlFor="max-price-mobile" className="sr-only">Maximum Price</label>
                    <input
                      type="number"
                      id="max-price-mobile"
                      placeholder="Max"
                      className="form-input"
                      value={localFilters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>

              {/* Location filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Location</h3>
                <div className="mt-2">
                  <input
                    type="text"
                    id="location-mobile"
                    placeholder="Enter location"
                    className="form-input"
                    value={localFilters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
              </div>

              {/* Status filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Status</h3>
                <div className="mt-2">
                  <select
                    id="status-mobile"
                    className="form-input"
                    value={localFilters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

              {/* Categories filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Categories</h3>
                <div className="mt-2 space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        id={`category-${category.id}-mobile`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={(localFilters.categories || []).includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                      />
                      <label
                        htmlFor={`category-${category.id}-mobile`}
                        className="ml-3 text-sm text-gray-600"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleApplyFilters}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleClearFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop filters (always visible) */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          {/* Price filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900">Price</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="min-price" className="sr-only">Minimum Price</label>
                <input
                  type="number"
                  id="min-price"
                  placeholder="Min"
                  className="form-input"
                  value={localFilters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <label htmlFor="max-price" className="sr-only">Maximum Price</label>
                <input
                  type="number"
                  id="max-price"
                  placeholder="Max"
                  className="form-input"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Location filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900">Location</h3>
            <div className="mt-2 relative">
              <input
                type="text"
                id="location"
                placeholder="Enter location"
                className="form-input pl-10"
                value={localFilters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Status filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900">Status</h3>
            <div className="mt-2">
              <select
                id="status"
                className="form-input"
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-end space-x-2">
            <button
              type="button"
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleApplyFilters}
            >
              Apply
            </button>
            <button
              type="button"
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleClearFilters}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Categories (Desktop) */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">Categories</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <div 
                key={category.id}
                className={`
                  cursor-pointer px-3 py-1 rounded-full text-sm 
                  ${(localFilters.categories || []).includes(category.id)
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}
                `}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;