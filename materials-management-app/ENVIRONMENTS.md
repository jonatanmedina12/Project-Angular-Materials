# Configuración de Environments

## Descripción

Este proyecto utiliza múltiples environments para manejar diferentes configuraciones según el entorno de ejecución (desarrollo, QA, producción).

## Estructura de Environments

### Archivos TypeScript (Angular)
```
src/environments/
├── environment.ts          # Desarrollo (por defecto)
├── environment.prod.ts     # Producción
└── environment.qa.ts       # QA/Testing
```

### Archivos .env (Configuración externa)
```
env/
├── enviroments.env         # Variables por defecto
├── enviroments.dev.env     # Variables de desarrollo
├── enviroments.prod.env    # Variables de producción
├── enviroments.qa.env      # Variables de QA
└── enviroments.example.env # Ejemplo/plantilla
```

## Configuración Actual

### Development (por defecto)
- API URL: `http://localhost:8080/api`
- Auth URL: `http://localhost:8081/api`

### Production
- API URL: `https://api.production.com/api`
- Auth URL: `https://auth.production.com/api`

### QA
- API URL: `http://qa.server.com:8080/api`
- Auth URL: `http://qa.server.com:8081/api`

## Scripts Disponibles

### Desarrollo
```bash
npm start              # Inicia en modo desarrollo
npm run start:dev      # Inicia en modo desarrollo (explícito)
npm run build:dev      # Build para desarrollo
```

### QA
```bash
npm run start:qa       # Inicia en modo QA
npm run build:qa       # Build para QA
```

### Producción
```bash
npm run build:prod     # Build para producción
```

## Uso en el Código

### Importar environment
```typescript
import { environment } from '../../../environments/environment';

// Usar las variables
const apiUrl = environment.apiUrl;
const authUrl = environment.authUrl;
const isProduction = environment.production;
```

### Usar el ConfigService (Recomendado)
```typescript
import { ConfigService } from '../core/services/config.service';

constructor(private configService: ConfigService) {}

// Obtener URLs
const apiUrl = this.configService.apiUrl;
const authUrl = this.configService.authUrl;

// Construir URLs completas
const materialUrl = this.configService.buildApiUrl('/materials');
const loginUrl = this.configService.buildAuthUrl('/auth/login');

// Verificar environment
const isProduction = this.configService.isProduction;
const envName = this.configService.environmentName;
```

## Servicios Actualizados

Los siguientes servicios ya están configurados para usar environments:

- ✅ `AuthService` - Usa `environment.authUrl`
- ✅ `MaterialService` - Usa `environment.apiUrl`
- ✅ `CityService` - Usa `environment.apiUrl`
- ✅ `ConfigService` - Servicio utilitario para environments

## Configuración en Angular

El archivo `angular.json` está configurado con:

- **Development**: Usa `environment.ts`
- **Production**: Reemplaza con `environment.prod.ts`
- **QA**: Reemplaza con `environment.qa.ts`

## Personalización

### Para cambiar URLs:

1. **Durante desarrollo**: Modifica `src/environments/environment.ts`
2. **Para producción**: Modifica `src/environments/environment.prod.ts`
3. **Para QA**: Modifica `src/environments/environment.qa.ts`

### Para agregar nuevas variables:

1. Agregar en todos los archivos environment:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  authUrl: 'http://localhost:8081/api',
  name: 'development',
  // Nueva variable
  newVariable: 'valor'
};
```

2. Actualizar el `ConfigService` si es necesario:
```typescript
get newVariable(): string {
  return environment.newVariable;
}
```

## Debugging

Para ver la configuración actual en la consola del navegador:
```typescript
this.configService.logConfig();
```

## Notas Importantes

1. **Nunca commitear credenciales reales** en los archivos de environment
2. Los archivos `.env` en la carpeta `env/` son para referencia externa
3. Los cambios en environment requieren reiniciar el servidor de desarrollo
4. En producción, asegúrate de que las URLs sean HTTPS
