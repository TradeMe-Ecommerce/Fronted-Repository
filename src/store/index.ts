import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import favoriteReducer from './slices/favoriteSlice';
import shoppingCartReducer from './slices/shoppingCartSlice';
import notificationReducer from './slices/notificationSlice';
import messageReducer from './slices/messageSlice';
import inventoryReducer from './slices/inventorySlice';

console.log('Initializing store with reducers:', {
  auth: !!authReducer,
  products: !!productReducer,
  categories: !!categoryReducer,
  favorites: !!favoriteReducer,
  shoppingCart: !!shoppingCartReducer,
  notifications: !!notificationReducer,
  messages: !!messageReducer,
  inventory: !!inventoryReducer
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    categories: categoryReducer,
    favorites: favoriteReducer,
    shoppingCart: shoppingCartReducer,
    notifications: notificationReducer,
    messages: messageReducer,
    inventory: inventoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;