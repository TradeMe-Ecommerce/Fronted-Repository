import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getCurrentUser } from '../../store/slices/authSlice';
import { isAuthenticated } from '../../utils/auth';
import Spinner from '../common/Spinner';

const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { isAuthenticated: authState, isLoading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated() && !authState) {
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          console.error('Error getting current user:', error);
        }
      }
    };
    checkAuth();
  }, [dispatch, authState]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !isAuthenticated() || !authState) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;