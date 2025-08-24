import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { getUserId } from '../../utils/auth';
import { 
  LogOut, 
  User, 
  ShoppingBag, 
  Heart, 
  Bell, 
  MessageSquare, 
  Menu, 
  X, 
  Search, 
  Package,
  Box,
  Star
} from 'lucide-react';


const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const { items = [] } = useSelector((state: RootState) => state.shoppingCart) || { items: [] };
  const [searchTerm, setSearchTerm] = useState('');
  
  
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?term=${searchTerm}`);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container-app">
        <div className="flex justify-between items-center py-3">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Icesi Trade</span>
            </Link>
          </div>

          {/* Search icon - hidden on mobile */}
          <div className="hidden md:flex items-center">
            <Link 
              to="/products" 
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Search className="h-5 w-5 text-gray-500 hover:text-primary-600" />
              <span className="text-gray-600">Search</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/messages" 
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors relative"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link 
                  to="/notifications" 
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/favorites" 
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                <Link 
                  to="/reviews" 
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Star className="h-5 w-5" />
                </Link>
                <Link 
                  to="/cart" 
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors relative"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {items && items.length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                      {items.length > 9 ? '9+' : items.length}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/sell" 
                  className="ml-2 px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm"
                >
                  Sell an Item
                </Link>
                <div className="relative" ref={profileMenuRef}>
                  <button 
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <User className="h-5 w-5" />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        to="/inventory" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Inventory
                      </Link>
                      <Link 
                        to={`/history`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        History
                      </Link>
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
          <div className="container-app py-2 space-y-2">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/products" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </div>
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </div>
                </Link>
                <Link 
                  to="/inventory" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Box className="h-5 w-5" />
                    <span>My Inventory</span>
                  </div>
                </Link>
                <Link 
                  to="/messages" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </div>
                </Link>
                <Link 
                  to="/notifications" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
                <Link 
                  to="/favorites" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>Favorites</span>
                  </div>
                </Link>
                <Link 
                  to="/reviews" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Reviews</span>
                  </div>
                </Link>
                <Link 
                  to="/cart" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-5 w-5" />
                    <span>Cart</span>
                    {items && items.length > 0 && (
                      <span className="ml-auto bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                        {items.length > 9 ? '9+' : items.length}
                      </span>
                    )}
                  </div>
                </Link>
                <Link 
                  to={`/history`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>History</span>
                  </div>
                </Link>
                <Link 
                  to="/sell" 
                  className="block px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-md mt-2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-center">
                    Sell an Item
                  </div>
                </Link>
              </>
            ) : (
              <div className="space-y-2">
                <Link 
                  to="/login" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;