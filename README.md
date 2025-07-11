# 📦 Material Management System

Sistema de gestión de materiales desarrollado con **Angular 19** y **NG-ZORRO** para el frontend, implementando una arquitectura moderna basada en **features** y **signals**.

## 🚀 Características Principales

### ✨ Frontend (Angular 19)
- **Signals & Computed**: Manejo reactivo de estado moderno
- **Standalone Components**: Arquitectura moderna sin módulos
- **NG-ZORRO (Ant Design)**: Librería de componentes elegante y funcional
- **Lazy Loading**: Carga bajo demanda de features
- **Responsive Design**: Adaptado para desktop, tablet y móvil
- **TypeScript**: Tipado fuerte y desarrollo robusto

### 🏗️ Arquitectura
```
src/app/
├── core/                    # Servicios y modelos compartidos
│   ├── models/             # Interfaces y tipos
│   ├── services/           # Servicios de datos
│   └── interceptors/       # Interceptores HTTP
├── features/               # Funcionalidades por dominio
│   └── materials/          # Feature de materiales
│       ├── components/     # Componentes específicos
│       ├── pages/          # Páginas/containers
│       └── material.routes.ts
├── shared/                 # Componentes reutilizables
│   ├── components/         # Loading, ErrorMessage, etc.
│   └── utils/              # Utilidades
└── app.routes.ts           # Rutas principales
```

### 📋 Funcionalidades Implementadas
- ✅ **CRUD Completo** de materiales
- ✅ **Filtros Avanzados** (tipo, fecha, ciudad)
- ✅ **Búsqueda** en tiempo real
- ✅ **Validaciones** de formularios
- ✅ **Paginación** y selección múltiple
- ✅ **Manejo de errores** centralizado
- ✅ **Estados de carga** reactivos
- ✅ **Navegación** con breadcrumbs

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Angular CLI 19+

### 1. Crear el proyecto
```bash
ng new material-management-app --standalone --routing --style=scss
cd material-management-app
```

### 2. Instalar NG-ZORRO
```bash
ng add ng-zorro-antd
```

### 3. Instalar dependencias adicionales
```bash
npm install @angular/animations
```

### 4. Configurar el entorno
Copiar los archivos generados en la estructura correspondiente.

### 5. Ejecutar la aplicación
```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

## 🎯 Uso de la Aplicación

### 📋 Lista de Materiales
- **Ver todos** los materiales en tabla paginada
- **Filtrar** por tipo, fecha de compra, ciudad
- **Seleccionar múltiples** materiales para acciones en lote
- **Buscar** en tiempo real

### ➕ Crear/Editar Material
- **Formulario** con validaciones en tiempo real
- **Selección** jerárquica departamento → ciudad
- **Validación** de fechas (compra ≤ venta)
- **Formateo** automático de precios

### 🎨 Interfaz Responsive
- **Desktop**: Layout completo con sidebar
- **Tablet**: Menú colapsable
- **Móvil**: Sidebar oculto, componentes optimizados

## 🔧 Tecnologías Utilizadas

### Frontend
- **Angular 19**: Framework principal
- **TypeScript 5.4**: Lenguaje de desarrollo
- **NG-ZORRO**: Librería de componentes UI
- **RxJS**: Programación reactiva
- **SCSS**: Preprocesador CSS

### Herramientas de Desarrollo
- **Angular CLI**: Tooling y scaffolding
- **ESLint**: Linting de código
- **Prettier**: Formateo de código

## 📂 Estructura de Features

### Materials Feature
```
features/materials/
├── components/
│   ├── material-list/      # Lista con tabla y acciones
│   ├── material-form/      # Formulario create/edit
│   └── material-filters/   # Filtros avanzados
├── pages/
│   ├── material-list-page/ # Container de lista
│   └── material-form-page/ # Container de formulario
└── material.routes.ts      # Rutas del feature
```

## 🎨 Componentes NG-ZORRO Utilizados

- **Layout**: `nz-layout`, `nz-sider`, `nz-header`
- **Navegación**: `nz-menu`, `nz-breadcrumb`
- **Datos**: `nz-table`, `nz-pagination`
- **Formularios**: `nz-form`, `nz-input`, `nz-select`, `nz-date-picker`
- **Feedback**: `nz-message`, `nz-spin`, `nz-alert`
- **General**: `nz-button`, `nz-icon`, `nz-tag`, `nz-card`

## ⚙️ Configuración del Backend

El frontend está preparado para conectarse con un backend Spring Boot:

```typescript
// Configuración base en services
private readonly baseUrl = 'http://localhost:8080/api/materials';
```

### Endpoints Esperados
- `GET /api/materials` - Listar todos
- `GET /api/materials/search` - Buscar con filtros
- `POST /api/materials` - Crear nuevo
- `PUT /api/materials/{id}` - Actualizar
- `GET /api/cities` - Listar ciudades
- `GET /api/cities/departments` - Listar departamentos

## 🚀 Scripts Disponibles

```bash
ng serve          # Desarrollo (http://localhost:4200)
ng build          # Build de producción
ng test           # Ejecutar tests
ng lint           # Linting del código
ng generate       # Generar componentes/servicios
```

## 📱 Responsive Breakpoints

```scss
// Mobile
@media (max-width: 480px) { }

// Tablet
@media (max-width: 768px) { }

// Desktop
@media (min-width: 769px) { }
```

## 🔒 Validaciones Implementadas

### Formulario de Material
- **Nombre**: Requerido, 2-100 caracteres
- **Descripción**: Requerido, 10-500 caracteres  
- **Tipo**: Requerido
- **Precio**: Requerido, mayor a 0
- **Fechas**: Compra ≤ Venta
- **Ciudad**: Requerida
- **Estado**: Requerido
