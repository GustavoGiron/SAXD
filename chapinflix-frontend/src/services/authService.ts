import apiService from './api';
import { LoginCredentials, RegisterData, User } from '../types';

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await apiService.getAuthApi().post('/api/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Como el backend no retorna el usuario completo, 
      // guardamos la info básica del token
      const tokenPayload = this.parseJwt(response.data.token);
      const user = {
        id: tokenPayload.id,
        nombre_usuario: tokenPayload.nombre_usuario,
        tipo_suscripcion: tokenPayload.tipo_suscripcion
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        ...response.data,
        usuario: user
      };
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
    localStorage.removeItem('selectedProfile');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Helper para decodificar el JWT
  private parseJwt(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }
}

export default new AuthService();