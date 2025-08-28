export interface User {
  id: number;
  nombre_usuario: string;
  correo: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  imagen_perfil?: string;
  tipo_usuario: 'gratuito' | 'premium';
}

export interface LoginCredentials {
  usuario: string;
  contraseña: string;
}

export interface RegisterData {
  nombre_usuario: string;
  correo: string;
  contraseña: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  imagen_perfil?: string;
}

export interface Content {
  id_contenido: number;
  titulo: string;
  descripcion?: string;
  imagen?: string;
  tipo?: string;
  fecha_agregado?: string;
}

export interface FavoriteItem {
  id: number;
  id_perfil: number;
  id_contenido: number;
  fecha_agregado: string;
  titulo?: string;
  tipo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}