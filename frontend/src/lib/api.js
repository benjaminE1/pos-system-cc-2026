import axios from 'axios';

// TODO: En producción, esta URL debe apuntar al Load Balancer / API Gateway del backend
// No hardcodear URLs. Usar únicamente variables de entorno.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// TODO: Implementar interceptor para adjuntar el token JWT a cada petición
// cuando la autenticación esté implementada en el backend.
api.interceptors.request.use((config) => {
  // TODO: Descomentar cuando el backend valide tokens:
  // const token = localStorage.getItem('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: Redirigir a /login si el error es 401 y limpiar sesión
    // if (error.response?.status === 401) { ... }
    return Promise.reject(error);
  }
);

export default api;
