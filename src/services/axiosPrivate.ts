import axios from 'axios';
import { store } from '../redux/store';
import { logout, setAuthTokens } from '../redux/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-api.com/api';

const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosPrivate.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.authorizationToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = store.getState().auth.refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

      
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/users`,
          { refresh: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const newAccessToken = refreshResponse.data.access;
        const newRefreshToken = refreshResponse.data.refresh;

    
        store.dispatch(
          setAuthTokens({
            authorizationToken: newAccessToken,
            refreshToken: newRefreshToken,
          })
        );

      
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosPrivate;
