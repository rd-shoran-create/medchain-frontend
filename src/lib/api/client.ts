import axios from 'axios';

// API client configuration
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Standardize error object
    const errorData = error.response?.data;
    const message = errorData?.error || errorData?.message || error.message || "Unknown API Error";
    return Promise.reject({ 
      error: message, 
      status: error.response?.status,
      raw: errorData || error
    });
  }
);
