import apiService from './api';
import { LoginCredentials, RegisterData, User } from '../types';

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await apiService.getAuthApi().post('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
    }
    return response.data;
  }

  async register(data: RegisterData) {
    const response = await apiService.getAuthApi().post('/api/auth/registro', data);
    return response.data;
  }

  async confirmEmail(token: string) {
    const response = await apiService.getAuthApi().get(`/api/auth/confirmar/${token}`);
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();