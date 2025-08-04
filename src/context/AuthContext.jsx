import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    if (token && userInfo) {
      const parsedUser = JSON.parse(userInfo);
      const normalizedUser = { ...parsedUser, uid: parsedUser.uid || parsedUser._id || parsedUser.id };
      setUser(normalizedUser);
      setToken(token);
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.register(userData);
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (userId, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.login(userId, password);
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        // Normalize user object to ensure uid is available
        const normalizedUser = { 
          ...data.user, 
          uid: data.user.uid || data.user._id || data.user.id 
        };
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      }
      return data;
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
