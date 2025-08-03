// src/components/AxiosInterceptorProvider.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosPrivate } from '@/api/axios';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/authSlice';

const AxiosInterceptorProvider = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const location = useLocation()
  useEffect(() => {
    const id = axiosPrivate.interceptors.response.use(
      response => response,
      error => {
       const status = error?.response?.status;
        const requestUrl = error?.config?.url;
       const isAuthLogout = requestUrl?.includes('/auth/logout');

        if (status === 401 && isAuthLogout) {
      
            toast.error('Session expired. Please login again.');
            navigate('/login');
 
          dispatch(logout())
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.response.eject(id);
    };
  }, [dispatch,navigate]);

  return null;
};

export default AxiosInterceptorProvider;
