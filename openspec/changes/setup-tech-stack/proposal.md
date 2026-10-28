# Proposal

## Why

El repositorio solo contiene la configuración de OpenSpec y un README; no hay aplicación. Antes de construir cualquier funcionalidad necesitamos una base técnica común: una app Next.js con backend integrado, conectada a Supabase (base de datos y autenticación) y desplegable en Vercel, para que los siguientes cambios se enfoquen en el producto y no en la infraestructura.

## What Changes

- Crear una aplicación Next.js (App Router, TypeScript) en la raíz del repositorio.
- Implementar el backend dentro de la misma app mediante Route Handlers (`app/api/**`) y Server Actions; no habrá un servicio separado.
- Integrar Supabase como base de datos Postgres y proveedor de autenticación, usando `@supabase/ssr` para sesiones basadas en cookies.
- Añadir registro, inicio y cierre de sesión con email y contraseña, y protección de rutas privadas.
- Añadir un endpoint de salud (`/api/health`) que reporte el estado de la app y la conectividad con la base de datos.
- Inicializar Supabase CLI en el repo (`supabase/`) para gestionar migraciones versionadas y desarrollo local.
- Definir las variables de entorno necesarias, un `.env.example` y documentar la configuración en el README.
- Preparar el despliegue en Vercel (proyecto enlazado al repositorio, variables de entorno por entorno, previews por PR).

## Capabilities

### New Capabilities
- `user-auth`: registro, inicio y cierre de sesión con email y contraseña sobre Supabase Auth, persistencia de la sesión y protección de rutas privadas.
- `system-health`: endpoint de salud que expone el estado del servicio y la conectividad con la base de datos, usado para verificar despliegues.

### Modified Capabilities
<!-- Ninguna: no existen specs previas en el proyecto. -->

## Impact

- **Código nuevo**: estructura completa de la app Next.js (`src/app/`, `src/lib/supabase/`, middleware de sesión), carpeta `supabase/` con configuración y migraciones.
- **Dependencias**: `next`, `react`, `react-dom`, `typescript`, `@supabase/supabase-js`, `@supabase/ssr`, herramientas de lint/format; Supabase CLI como dependencia de desarrollo.
- **Servicios externos**: un proyecto de Supabase (al menos uno para producción; opcionalmente otro para previews) y un proyecto de Vercel conectado al repositorio de GitHub.
- **Secretos**: URL y anon key de Supabase como variables públicas; la service role key solo en el servidor y nunca expuesta al cliente.
- **Fuera de alcance**: modelo de datos del dominio (cuentas de entretenimiento), proveedores OAuth, recuperación de contraseña, roles y permisos, y CI más allá de las previews de Vercel.
