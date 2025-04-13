import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import Cookies from 'js-cookie';


export const countriesApi = "https://restcountries.com/v3.1/all?fields=name,flags";


const api = axios.create({
  baseURL: `${import.meta.env.VITE_REACT_APP_API}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); 
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));


const handleApiError = (error: AxiosError) => {
  if (error.response) {
    console.error('API Error Response:', error.response.data);
    throw error.response.data;
  } else if (error.request) {
    console.error('API Error Request:', error.request);
    throw new Error('No response received from the server.');
  } else {
    console.error('API Error Message:', error.message);
    throw new Error('An unexpected error occurred.');
  }
};

export const apiService = {
  
    login: async <T>(data: { email: string; password: string }, config?: AxiosRequestConfig): Promise<T> => {
      try {
        const response = await api.post<T>('/user/login', data, config);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    post: async <T, D>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> => {
      try {
        // await delay(5000)
        const response = await api.post<T>(url, data, config);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },
  
    get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      try {
        // await delay(5000)
        const response = await api.get<T>(url, config);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    getById: async <T>(url: string, id: string, config?: AxiosRequestConfig): Promise<T> => {
      try {
         // await delay(5000)
        const response = await api.get<T>(`${url}/${id}`, config);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    put: async <T, D>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> => {
      try {
        // await delay(5000)
        const response = await api.put<T>(url, data, config);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },

    delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      try {


        const response = await api.delete<T>(url, config);
        return response.data;
      } catch (error) {
        handleApiError(error as AxiosError);
        throw error;
      }
    },
  };
  
  