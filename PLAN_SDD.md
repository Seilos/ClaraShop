# Documento de Diseño de Software (SDD) - Tienda Duilio (Multi-tenant E-Commerce)

> **Estado**: borrador inicial | **Metodología**: Software Design Description (SDD)  
> **Arquitectura**: Clean / Hexagonal Architecture  
> **Estilo UI**: Apple-like Minimalist (Glassmorphism, High-end aesthetics, Dark/Light adaptive)

---

## 1. Visión del Proyecto y Objetivos

Construir una plataforma E-Commerce Multi-tenant tipo SPA instalable (PWA) de alta gama orientada a la venta directa y pedidos integrados con WhatsApp y Correo Electrónico.

### Principios Arquitectónicos
* **Cero fallas silenciosas**: Sistema de logging profesional estructurado (Pino) con niveles severos y captura global de excepciones (`uncaughtException`, `unhandledRejection`).
* **Reusabilidad Máxima**: Arquitectura modular orientada a dominio (DDD light / Hexagonal), evitando duplicación de lógica tanto en Backend como en Frontend.
* **Preparado para Supabase**: Desarrollo inicial en **SQLite local** mediante **Drizzle ORM** utilizando aislamiento por columna `tenant_id` (Row-Level Multi-tenancy) para migrar 1:1 a PostgreSQL / Supabase RLS sin reescribir consultas.
* **Multi-moneda nativa**: USD como moneda base con tasa de cambio configurable por tenant hacia una moneda secundaria local.

---

## 2. Stack Tecnológico

### Backend (Node.js)
* **Runtime & Server**: Node.js + Express (Modular Router Architecture).
* **Precisión Financiera (CERO Floats)**: `decimal.js` en Backend y Frontend. Todos los valores monetarios, tasas de cambio y montos de órdenes se manejan con 8 decimales de precisión (`DECIMAL(18, 8)` o cadenas exactas).
* **Base de Datos & ORM**: SQLite (`better-sqlite3`) + Drizzle ORM + UUIDv7.
* **Logging Profesional**: `pino` + `pino-pretty` (Dev) + Guardado automático en archivos rotativos (`logs/error.log`, `logs/combined.log`).
* **Seguridad & Auth**: JWT en cookies HTTP-only, `bcryptjs` / `argon2`, `cors`, `helmet`.
* **Validación de Schemas**: `zod` (única fuente de verdad compartida entre Backend y Frontend).
* **Testing**: `vitest` (unit tests) + `supertest` (tests de integración API).
* **Dev Memory System**: Base SQLite en `docs/dev_memory.sqlite` para registrar catálogo de funciones, contratos API y decisiones de diseño.
* **Emailing**: `nodemailer` (SMTP configurable por tenant / global).

### Frontend (React + Vite)
* **Build Tool**: Vite (React + TypeScript / JS ESNext).
* **Estado & Data Fetching**: `@tanstack/react-query` (Caching, Invalidation, Optimistic Updates).
* **Routing**: `@tanstack/react-router` o React Router v6 con guardias de subdominio.
* **HTTP Client**: `axios` con interceptores globales para manejo unificado de errores, notificaciones visuales (Toasts) y headers de tenant.
* **Validaciones de Formulario**: `@hookform/resolvers` + `zod` (validación en tiempo real en UI).
* **UI & Estilos**: Vanilla CSS con Sistema de Design Tokens (Apple Aesthetics: blur, sombras suaves, tipografía San Francisco/Inter, paleta HSL, responsive nativo mobile-first).
* **Iconografía**: `lucide-react`.

---

## 3. Estrategia Multi-tenant & Dominio

```
[Cliente Web / Mobile] 
        │
  (subdominio: tienda1.app.com)
        │
        ▼
[Middleware de Resolución de Tenant (Express)]
        │  1. Extrae subdominio/slug
        │  2. Consulta Tenant en DB / Cache
        │  3. Inyecta req.tenant Context
        ▼
[Controladores & Servicios]
        │  Filtra automáticamente por tenant_id
        ▼
[SQLite DB (Single DB con tenant_id)]
```

---

## 4. Hoja de Ruta / Fases de Desarrollo

### 📍 Fase 1: Setup del Proyecto & Infraestructura Base (COMPLETADO)
* [x] Inicialización del proyecto en estructura monorepo/modular (`backend/`, `frontend/`, `shared/`, `docs/`).
* [x] Configuración de dependencias **locales** (`npm install` en carpetas del proyecto).
* [x] Configuración del Logger Profesional (Pino) con transporte a archivo (`logs/`) y middleware de errores Express.
* [x] Implementación de Zod Schemas compartidos (`shared/schemas/`).
* [x] Setup de Vitest y Supertest para tests unitarios y de integración.
* [x] Setup del Dev Memory System (`docs/dev_memory.sqlite`) para auditoría interna de funciones y decisiones.
* [x] Definición del Design System CSS (Variables, Glassmorphism, Responsive Breakpoints).
* [x] Cliente HTTP Axios centralizado con interceptores de errores y logger de peticiones.
* [x] Repositorio Git local y estructura `.gitignore`.
* [x] Módulo compartido de precisión decimal de 8 decimales con `decimal.js`.

### 📍 Fase 2: Registro de Tenant, Auth & Sesiones (COMPLETADO)
* [x] Esquema DB: `tenants`, `users`, `sessions`, `password_resets`.
* [x] Endpoints de Registro (Nombre, Apellido, Teléfono, Correo, País, Ciudad, Dirección, Nombre de Tienda / Subdominio).
* [x] Endpoints de Autenticación (Login con Dual Token JWT + Refresh Token HttpOnly Cookie).
* [x] Pruebas de integración con Supertest para Registro y Login (`tests/integration/auth.test.js`).
* [x] Interfaz de Usuario (UI React) para Registro y Login estilo Apple (`frontend/src/pages/AuthPage.jsx`).
* [x] Componentes atómicos reutilizables (`Input.jsx`, `Button.jsx`, `LoginForm.jsx`, `RegisterForm.jsx`).


### 📍 Fase 3: Dashboard Lateral Tenant (COMPLETADO)
* [x] UI Dashboard con Sidebar colapsable y desplegable (`frontend/src/components/dashboard/Sidebar.jsx`).
* [x] Pantallas de Configuración:
  * [x] Perfil del Tenant (`ProfileSettings.jsx` - Datos registrados en Fase 2 visualizables y modificables).
  * [x] Configuración de Monedas & Tasa de cambio (`CurrencySettings.jsx` - USD Base + Moneda secundaria con precisión estricta a 8 decimales `decimal.js`).
* [x] Backend Endpoints: `GET/PUT /api/v1/tenant/profile` y `GET/PUT /api/v1/tenant/settings/currencies`.

### 📍 Fase 4: Base de Datos de Productos & Atributos Dinámicos (COMPLETADO)
* [x] Tablas dinámicas en SQLite con UUIDv7: `brands`, `categories`, `custom_attributes`, `product_attribute_values`, `products`.
* [x] Campos profesionales de producto: `sku`, `barcode`, `name`, `slug`, `model_name`, `color`, `size`, `material`, `warranty_info`, `price_usd_1/2/3` (8 decimales `decimal.js`), `cost_usd`, `stock_quantity`, `min_stock_alert`, `created_by`, `created_at`, `updated_by`, `updated_at`, `disabled_by`, `disabled_at`.
* [x] Backend Endpoints: `POST/GET/DELETE /api/v1/products` aislados por `tenant_id` y probados con Supertest (`tests/integration/product.test.js`).
* [x] Seed Script (`backend/src/db/seed.js`): Inicializa productos demo con UUIDv7 y precios exactos en 8 decimales.
* [x] Interfaz de Usuario React: `ProductsList.jsx` y `CreateProductModal.jsx` integrados en el Dashboard con diseño Apple.

### 📍 Fase 5: Tienda Pública & Procesamiento de Órdenes
* [ ] Buscador de productos con filtros en tiempo real y vista responsive grid.
* [ ] Carrito de compras local (Persistente en `localStorage`).
* [ ] Formulario de Checkout (Nombre, Contacto, Método de pago, País, Ciudad, Dirección aproximada).
* [ ] Generación de Pedido:
  1. Guardado de Orden en DB backend.
  2. Generación de enlace de WhatsApp (`wa.me/NUMERO_TENANT?text=ENCODED_ORDER`).
  3. Envío paralelo de Email de confirmación al correo del tenant y al cliente.

---

## 5. Estrategia Cero Fallas Silenciosas & Logging Profesional

Para garantizar que **NUNCA** se pierda un fallo silenciosamente:

1. **Backend (Express + Pino)**:
   * **Traceability (reqId + tenantId)**: Cada petición HTTP recibe un ID único de rastreo.
   * **Archivos Rotativos de Logs**: Todo error grave se escribe en `logs/error.log` con stack trace completo y payload sanitized.
   * **Unhandled Exceptions & Rejections**: Event listeners globales en el proceso Node capturan cualquier promesa rota o excepción no atrapada.

2. **Frontend (Axios + Error Boundaries)**:
   * **Axios Global Interceptor**: Captura fallos 4xx/5xx y errores de red. Dispara notificaciones UI (Toasts).
   * **Telemetry Endpoint**: Errores críticos de JS en el navegador cliente se reportan automáticamente al backend (`POST /api/v1/telemetry/errors`) para ser auditados por Pino.

3. **Estructura del Log (Pino)**:
```json
{
  "level": 50,
  "time": 1727390000000,
  "pid": 1234,
  "tenant_id": "uuidv7-tenant-slug",
  "reqId": "req-abc-123",
  "action": "CREATE_PRODUCT_ATTEMPT",
  "err": {
    "message": "Validation failed",
    "stack": "ZodError: ..."
  },
  "msg": "Acción de usuario fallida en servidor"
}
```

## 6. Arquitectura Headless (API-First) y Gestión de Sesiones

### 6.1 Diseño Headless (API REST Pura)
El backend está diseñado como una **API REST desacoplada (`/api/v1/`)**:
* **Consumidores múltiples**: El frontend React SPA actual es solo un consumidor. En el futuro se puede conectar con tu SaaS administrativo en Supabase, una App Móvil o servicios de terceros.
* **Autenticación Agnóstica**: Funciona via `Authorization: Bearer <JWT>` o cookies HTTP-only de sesión.
* **Independencia de DB**: Al pasar de SQLite a Supabase PostgreSQL a futuro, los endpoints y contratos JSON de la API permanecerán 100% idénticos.

### 6.2 Gestión de Sesiones & "Recordarme" (Persistencia en Dispositivo)
Para limitar y controlar las sesiones de usuario:
* **Estrategia Dual-Token**:
  * **Access Token (JWT corta duración - 15 min)**: Para autorizar cada petición HTTP rápida.
  * **Refresh Token (Larga duración - 7 días con "Recordarme", o Token de Sesión temporal sin "Recordarme")**: Almacenado de forma segura en cookies `HttpOnly; SameSite=Lax; Secure`.
* **Tabla `sessions` en SQLite**:
  * Registra `id`, `user_id`, `tenant_id`, `refresh_token_hash`, `user_agent`, `ip_address`, `expires_at`, `is_revoked`.
  * **Límite de Dispositivos**: Permite configurar un máximo de N sesiones activas por usuario (ej. max 3 dispositivos simultáneos).
  * **Cierre Remoto**: El usuario puede revocar sesiones específicas ("Cerrar sesión en otros dispositivos") desde el panel de control.

---

## 7. Registro de Cambios y Avances
* **2026-09-26**: Creación del plan SDD inicial y validación de arquitectura.
* **2026-09-26**: Inclusión de Zod (validación única), Vitest (testing) y Dev Memory SQLite.
* **2026-09-26**: Inclusión de Arquitectura Headless API-First y estrategia Dual-Token con límite de sesiones activas.
* **2026-09-26**: Cambio de marca a **ClaraShop**. Rediseño completo de la interfaz de autenticación (`AuthPage.jsx`, `LoginForm.jsx`, `RegisterForm.jsx`):
  * **Inspiración Facebook Clean**: Eliminación de pestañas superiores y descripciones redundantes. Inputs limpios sin etiquetas externas (descripciones ubicadas dentro del `placeholder`).
  * **Branding & Lema**: Logotipo de tienda y slogan *"Hacemos lo imposible Posible."*.
  * **Diseño Responsive Adaptativo**: En pantallas móviles la sección hero gráfica se oculta automáticamente, mostrando el logo y el lema centrados por encima de la tarjeta de autenticación.
  * **Fondo de Tarjeta con Estilo Glassmorphism**: Capa gráfica integrada con opacidad sutil, superposición de cristal y desenfoque `backdrop-filter`.
  * **Estilo de Botones de Alta Gama ("Luxury")**:
    * Botón primario (`.btn-luxury-primary`): Gradiente zafiro/azul real con bisel de luz interno y sombra proyectada.
    * Botón secundario (`.btn-luxury-secondary`): Gradiente esmeralda/jade de lujo con elevación sutil.



