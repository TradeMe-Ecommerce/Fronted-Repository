import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  sub: string;
  userId: number;
  name: string;
  roles: string[];
}

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      removeToken();
      return false;
    }
    
    return true;
  } catch (error) {
    removeToken();
    return false;
  }
};

export const getUserId = (): number | null => {
  const raw = localStorage.getItem('userId');
  return raw ? Number(raw) : null;
};



export const getUsername = (): string | null => {
  return 'john_doe'; // Always return demo user
};

export const hasRole = (role: string): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.roles.includes(role);
  } catch (error) {
    return false;
  }
};

export const getTokenExpirationDate = (): Date | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

