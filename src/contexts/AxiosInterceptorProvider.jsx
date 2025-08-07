// src/components/AxiosInterceptorProvider.jsx

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosPrivate } from '@/api/axios';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import { toast } from 'sonner';
import { refresh } from '../features/auth/authSlice';

const AxiosInterceptorProvider = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const{ accessToken,error:refreshError }= useSelector(state => state.auth);

  useEffect(() => {
    // Attach access token to every request
    const requestInterceptor = axiosPrivate.interceptors.request.use(
      config => {
        if (accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // On 401, attempt refresh
    const responseInterceptor = axiosPrivate.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        const status = error?.response?.status;
        const requestUrl = error?.config?.url;

        const isAuthLogout = requestUrl?.includes('/auth/logout');
        const isRefreshCall = requestUrl?.includes('/auth/refresh');

        if (status === 401 && !originalRequest._retry && !isAuthLogout && !isRefreshCall) {
          originalRequest._retry = true;
            const res = await dispatch(refresh())
            console.log("refresh token res: ", res)
            if(res.meta.requestStatus == 'fulfilled'){
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${res.payload.accessToken}`;
              return axiosPrivate(originalRequest);

            }else{
            dispatch(logout());
            toast.error('Session expired. Please login again.');
            navigate('/login', { state: { from: location }, replace: true });
            return Promise.reject(refreshError)
          }

        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor);
      axiosPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, dispatch, navigate, location]);

  return null;
};

export default AxiosInterceptorProvider;
