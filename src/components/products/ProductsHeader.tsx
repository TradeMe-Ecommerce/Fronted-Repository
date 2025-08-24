import React from 'react';

const ProductsHeader: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
      <div className="container-app">
        <h1 className="text-4xl font-bold mb-4">Browse Products</h1>
        <p className="text-lg text-primary-100">
          Find exactly what you're looking for in our extensive collection of products
        </p>
      </div>
    </section>
  );
};

export default ProductsHeader; 