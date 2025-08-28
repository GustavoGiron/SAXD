export const API_ENDPOINTS = {
  AUTH: import.meta.env.VITE_AUTH_SERVICE || 'http://localhost:3000',
  INTERACTION: import.meta.env.VITE_INTERACTION_SERVICE || 'http://localhost:3002',
  API_GATEWAY: import.meta.env.VITE_API_URL || 'http://localhost:8080'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  MY_LISTS: '/my-lists',
  CONFIRM_EMAIL: '/confirmar/:token'
};