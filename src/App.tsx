import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';

import { fetchFavorites }     from './store/slices/favoriteSlice';
import { fetchNotifications } from './store/slices/notificationSlice';
import { fetchCart }          from './store/slices/shoppingCartSlice';

import { isAuthenticated }    from './utils/auth';
import { webSocketService }   from './services/webSocketService';

/* ---------- Layouts ---------- */
import MainLayout     from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

/* ---------- Pages ---------- */
import HomePage         from './pages/home/HomePage';
import Login            from './pages/auth/Login';
import Register         from './pages/auth/Register';
import ProductsPage     from './pages/products/ProductsPage';
import ProductDetails   from './pages/products/ProductDetails';
import ProductCreate    from './pages/products/ProductCreate';
import UserProfile      from './pages/profile/UserProfile';
import UserPurchases    from './pages/profile/UserPurchases';
import UserListings     from './pages/profile/UserListings';
import UserReviews      from './pages/profile/UserReviews';
import Messages         from './pages/messages/Messages';
import MessageRoom      from './pages/messages/MessageRoom';
import Notifications    from './pages/notifications/Notifications';
import Favorites        from './pages/favorites/Favorites';
import ShoppingCart     from './pages/shopping-cart/ShoppingCart';
import SearchResults    from './pages/search/SearchResults';
import InventoryPage    from './pages/inventory/InventoryPage';
import ProductInventories from './pages/ProductInventories';
import HistoryPage from './components/history/HistoryPage';
import CreateReviewPage from './pages/CreateReviewPage';
import ReviewsPage from './pages/ReviewsPage';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated: authOK, token } = useSelector(
    (s: RootState) => s.auth,
  );

  /* ----------- Carga de datos al iniciar ----------- */
  useEffect(() => {
    const bootstrap = async () => {
      if (isAuthenticated()) {
        try {
          await Promise.all([
            dispatch(fetchFavorites()).unwrap(),
            dispatch(fetchNotifications()).unwrap(),
            dispatch(fetchCart()).unwrap(),
          ]);
        } catch (err) {
          console.error('Error initializing app:', err);
        }
      }
    };
    bootstrap();

    return () => {
      webSocketService.disconnect();
    };
  }, [dispatch]);

  /* ----------- Gestión WebSocket ----------- */
  useEffect(() => {
    if (authOK && token) {
      webSocketService.connect(token).catch(err =>
        console.error('WS connect failed:', err.message),
      );
    } else {
      webSocketService.disconnect();
    }
  }, [authOK, token]);

  /* ----------- Rutas ----------- */
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Privadas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/search" element={<SearchResults />} />
          
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/purchases" element={<UserPurchases />} />
          <Route path="/profile/listings" element={<UserListings />} />
          <Route path="/profile/reviews" element={<UserReviews />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/create-review/:transactionId" element={<CreateReviewPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          
          <Route path="/sell" element={<ProductCreate />} />
          
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<MessageRoom />} />
          
          <Route path="/notifications" element={<Notifications />} />
          
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/product/:productId/inventories" element={<ProductInventories />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="p-8">Not Found</div>} />
    </Routes>
  );
}

export default App;
