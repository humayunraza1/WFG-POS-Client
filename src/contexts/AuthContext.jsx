import { createContext, useContext, useEffect, useState } from 'react';
import axios from '@/api/axios';
import { toast } from 'sonner';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('/auth/me', { withCredentials: true });
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post('/auth/login', { username, password });
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success('Login successful', {
        description: `Welcome back, ${res.data.user.username}!`
      });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(message);
      toast.error('Login failed', { description: message });
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.warn('Server logout failed, logging out locally.');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const createAccount = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post('/auth/create', { username, password });
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success('Account created successfully', {
        description: `Welcome, ${res.data.user.username}!`
      });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Account creation failed.';
      setError(message);
      toast.error('Signup failed', { description: message });
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        createAccount,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};