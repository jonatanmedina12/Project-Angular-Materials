# Etapa de construcción
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias globales necesarias
RUN npm install -g @angular/cli@18

# Copiar archivos de configuración de Node.js
COPY package*.json ./

# Instalar dependencias del proyecto
RUN npm ci --only=production --silent

# Copiar código fuente
COPY . .

# Construir aplicación Angular para producción
RUN npm run build:prod

# Etapa de producción con Nginx
FROM nginx:alpine AS runtime

# Instalar curl para health checks
RUN apk add --no-cache curl gettext

# Copiar configuración personalizada de Nginx
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copiar archivos construidos de Angular desde etapa de build
COPY --from=build /app/dist/materials-management-app /usr/share/nginx/html

# Copiar script de entrada personalizado
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Crear archivo de salud para health checks
RUN echo '{"status":"healthy","timestamp":"'$(date -Iseconds)'"}' > /usr/share/nginx/html/health.json

# Configurar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Cambiar a usuario nginx
USER nginx

# Exponer puerto (Railway asigna automáticamente)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-80}/health.json || exit 1

# Punto de entrada
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]