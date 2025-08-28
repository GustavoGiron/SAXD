export const API_ENDPOINTS = {
  AUTH: import.meta.env.VITE_API_URL || 'http://localhost',
  INTERACTION: import.meta.env.VITE_API_URL || 'http://localhost',
  API_GATEWAY: import.meta.env.VITE_API_URL || 'http://localhost'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  MY_LISTS: '/my-lists',
  CONFIRM_EMAIL: '/confirmar/:token'
};