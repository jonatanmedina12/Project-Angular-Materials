#!/bin/sh

# Script de entrada para configurar variables de entorno dinámicamente en Angular

set -e

# Establecer valores por defecto
export PORT=${PORT:-80}
export API_URL=${API_URL:-http://localhost:8080}

echo "🚀 Iniciando aplicación Angular..."
echo "📡 Puerto: $PORT"
echo "🔗 API URL: $API_URL"

# Generar configuración de Nginx desde template
echo "📝 Generando configuración de Nginx..."
envsubst '${PORT} ${API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Verificar configuración de Nginx
echo "✅ Verificando configuración de Nginx..."
nginx -t

# Crear archivo de configuración runtime para Angular
echo "⚙️ Creando configuración runtime..."
cat > /usr/share/nginx/html/assets/config/runtime-config.json << EOF
{
  "apiUrl": "${API_URL}",
  "production": true,
  "environment": "production",
  "version": "1.0.0",
  "buildTime": "$(date -Iseconds)"
}
EOF

# Asegurar que el directorio de configuración existe
mkdir -p /usr/share/nginx/html/assets/config

# Actualizar archivo de salud con timestamp actual
echo "{\"status\":\"healthy\",\"timestamp\":\"$(date -Iseconds)\",\"port\":\"${PORT}\",\"apiUrl\":\"${API_URL}\"}" > /usr/share/nginx/html/health.json

echo "✅ Configuración completada"
echo "🎯 Ejecutando: $@"

# Ejecutar comando pasado como argumento
exec "$@"