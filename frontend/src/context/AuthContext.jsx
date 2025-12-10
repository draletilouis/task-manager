import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { AuthContext } from './AuthContextDefinition';

// Decode JWT token to extract user data
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialize state from localStorage
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    return token && storedUser ? JSON.parse(storedUser) : null;
  });

  // Login user and store tokens
  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data;

    // Decode token to get userId
    const decoded = decodeToken(accessToken);
    const userData = { id: decoded.userId, email };

    // Store tokens and user data
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    navigate('/workspaces');
  };

  // Register new user then login
  const register = async (email, password, name) => {
    await apiClient.post('/auth/register', { email, password, name });
    await login(email, password);
  };

  // Logout user and clear storage
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};