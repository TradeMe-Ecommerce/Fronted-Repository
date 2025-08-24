// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  name: string;
  phone: string;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number | null;
  userId: number | null;
  token: string;
  tokenType: string;
  expiresIn: number;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  date: string;
  location: string;
  status: string;
  categories: Category[];
  images: ProductImage[];
}

export interface ProductImage {
  id: number;
  url: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description: string;
}

// Messaging types
export interface Room {
  id: number;
  userId: number;
  messages: Message[];
  peerUserId: number;
  peerUserName: string;
}

export interface Message {
  userId: number | null;
  id: number;
  roomId: number;
  senderId: number;
  message: string;
  date: string; 
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  date: string;
  description: string;
}

// Favorites types
export interface Favorite {
  id: number;
  userId: number;
  productIds: number[];
}

// Review types
export interface Review {
  id: number;
  transactionId: number;
  points: number;
  description: string;
  date: string; 
}

// Error types
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// Product filter types
export interface ProductFilters {
  searchTerm?: string;
  categories?: number[];
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  location?: string;
}

// Transaction types
export interface Transaction {
  id: number;
  userId: number;
  status: string;
  price: number;
  paymentMethod: string;
  amount: number;
  productId: number;
}