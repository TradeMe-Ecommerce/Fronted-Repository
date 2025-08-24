import React from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import { Category } from '../../types';

interface ProductsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: number[];
  onCategoryChange: (categoryId: number) => void;
  location: string;
  onLocationChange: (location: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categories: Category[];
  onClearFilters: () => void;
}

const ProductsFilters: React.FC<ProductsFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  location,
  onLocationChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  categories,
  onClearFilters,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search query changed:', e.target.value);
    onSearchChange(e.target.value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Location changed:', e.target.value);
    onLocationChange(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Status changed:', e.target.value);
    onStatusChange(e.target.value);
  };

  const handleCategoryClick = (categoryId: number) => {
    console.log('Category clicked:', categoryId);
    onCategoryChange(categoryId);
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="container-app py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 w-full"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Location */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 w-full"
              placeholder="Enter location..."
              value={location}
              onChange={handleLocationChange}
            />
          </div>

          {/* Status */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="form-input pl-10 w-full"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="">All Status</option>
              <option value="Disponible">Disponible</option>
              <option value="Vendido">Vendido</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              className="form-input w-full"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${selectedCategories.includes(category.id)
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}
                `}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || location || status || selectedCategories.length > 0) && (
          <div className="mt-4 flex justify-end">
            <button
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={onClearFilters}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsFilters; 