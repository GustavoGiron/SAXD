import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

class ApiService {
  private authApi: any;
  private interactionApi: any;

  constructor() {
    this.authApi = axios.create({
      baseURL: API_ENDPOINTS.AUTH,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.interactionApi = axios.create({
      baseURL: API_ENDPOINTS.INTERACTION,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token si existe
    const addAuthToken = (config: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    this.authApi.interceptors.request.use(addAuthToken);
    this.interactionApi.interceptors.request.use(addAuthToken);
  }

  getAuthApi() {
    return this.authApi;
  }

  getInteractionApi() {
    return this.interactionApi;
  }
}

export default new ApiService();