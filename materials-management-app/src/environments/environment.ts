// Este archivo será reemplazado durante el build para production
// El entorno de desarrollo será usado por defecto

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082/api',  // URL del microservicio de materiales
  authUrl: 'http://localhost:8081/api'  // URL del microservicio de autenticación (si existe)
};