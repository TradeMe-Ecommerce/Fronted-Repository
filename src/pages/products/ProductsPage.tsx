import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProducts, setFilters, selectFilteredProducts } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import ProductsHeader from '../../components/products/ProductsHeader';
import ProductsFilters from '../../components/products/ProductsFilters';
import ProductsGrid from '../../components/products/ProductsGrid';

const ProductsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.products);
  const filteredProducts = useSelector(selectFilteredProducts);
  const { categories } = useSelector((state: RootState) => state.categories);
  
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Cargar productos y categorías al montar el componente
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Actualizar filtros cuando cambien los valores locales
  useEffect(() => {
    dispatch(setFilters({
      searchTerm: searchQuery,
      categories: selectedCategories,
      location: location,
      status: status
    }));
  }, [dispatch, searchQuery, selectedCategories, location, status]);

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      return newCategories;
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    setLocation('');
    setStatus('');
    setSortBy('newest');
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductsHeader />
      
      <ProductsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        location={location}
        onLocationChange={handleLocationChange}
        status={status}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        onClearFilters={handleClearFilters}
      />

      <section className="py-12">
        <div className="container-app">
          <ProductsGrid
            products={sortedProducts}
            isLoading={isLoading}
          />
        </div>
      </section>
    </div>
  );
};

export default ProductsPage; 