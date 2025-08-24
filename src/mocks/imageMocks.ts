// Array de URLs de imágenes mock de productos
export const productImages = [
  'https://picsum.photos/seed/product1/300/200',
  'https://picsum.photos/seed/product2/300/200',
  'https://picsum.photos/seed/product3/300/200',
  'https://picsum.photos/seed/product4/300/200',
  'https://picsum.photos/seed/product5/300/200',
  'https://picsum.photos/seed/product6/300/200',
  'https://picsum.photos/seed/product7/300/200',
  'https://picsum.photos/seed/product8/300/200',
];

// Función para obtener una imagen aleatoria del array
export const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * productImages.length);
  return productImages[randomIndex];
};

// Función para obtener una imagen específica por índice
export const getImageByIndex = (index: number) => {
  return productImages[index % productImages.length];
};

// Función para obtener múltiples imágenes aleatorias
export const getRandomImages = (count: number) => {
  const images = [...productImages];
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * images.length);
    result.push(images[randomIndex]);
    images.splice(randomIndex, 1);
    
    // Si nos quedamos sin imágenes, volvemos a llenar el array
    if (images.length === 0) {
      images.push(...productImages);
    }
  }
  
  return result;
};

// Función para obtener una imagen basada en el ID del producto
export const getImageByProductId = (productId: number) => {
  return getImageByIndex(productId);
};

// Función para obtener múltiples imágenes basadas en el ID del producto
export const getImagesByProductId = (productId: number, count: number) => {
  const baseIndex = productId % productImages.length;
  const result = [];
  
  for (let i = 0; i < count; i++) {
    result.push(getImageByIndex(baseIndex + i));
  }
  
  return result;
}; 