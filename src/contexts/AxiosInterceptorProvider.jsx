// src/components/AxiosInterceptorProvider.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '@/api/axios';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

const AxiosInterceptorProvider = () => {
  const navigate = useNavigate();
  const {setUser,setIsAuthenticated} = useAuth();
  useEffect(() => {
    const id = axiosPrivate.interceptors.response.use(
      response => response,
      error => {
        const status = error?.response?.status;

        if ((status === 401)) {
            toast.error('Session expired. Please login again.');
            setIsAuthenticated(false);
            setUser(null); 
            navigate('/login');
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.response.eject(id);
    };
  }, [navigate, setIsAuthenticated, setUser]);

  return null;
};

export default AxiosInterceptorProvider;
