import { createContext, useContext, useEffect, useState } from 'react';
import  axiosPublic, {axiosPrivate} from '@/api/axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate()
  // Check auth status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const res = await axiosPrivate.get('/auth/me', { withCredentials: true });
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        navigate('/login')
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
      const res = await axiosPrivate.post('/auth/login', { username, password });
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
      await axiosPrivate.post('/auth/logout', {}, { withCredentials: true });
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
      const res = await axiosPrivate.post('/auth/create', { username, password });
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
         setIsAuthenticated,
         setUser,
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