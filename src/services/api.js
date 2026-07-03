import axios from 'axios';

// Cấu hình axios instance
const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000, // 10 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để log request/response (debug)
api.interceptors.request.use(
  (config) => {
    console.log('🌐 Request:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status);
    return response;
  },
  (error) => {
    console.log('❌ Error:', error.message);
    return Promise.reject(error);
  }
);

export default api;