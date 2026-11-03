# Design

## Context

El repo está vacío salvo por OpenSpec (ver proposal.md, Why). El desarrollo se hace en Windows, el despliegue es en Vercel y la base de datos y la autenticación las provee Supabase. Las ramas siguen el flujo `develop` → `main`; Vercel debe publicar `main` como producción y cualquier otra rama como preview.

## Goals / Non-Goals

**Goals:**
- Un único proyecto Next.js que sirva frontend y backend, desplegable en Vercel sin configuración adicional.
- Clientes de Supabase separados por contexto (navegador, servidor, administración) para que las reglas de seguridad sean fáciles de respetar.
- Esquema de base de datos versionado con migraciones desde el primer día.
- Desarrollo local reproducible con `npm run dev` contra un proyecto Supabase remoto o local.

**Non-Goals:**
- Tablas del dominio de negocio (solo la función de salud y lo que Supabase Auth crea).
- Pipeline de CI propio (lint/test en GitHub Actions) más allá de las previews de Vercel.
- Monorepo o paquetes compartidos.

## Decisions

### 1. Next.js App Router con TypeScript, backend integrado
Versión estable más reciente de Next.js, creada con `create-next-app` (TypeScript, ESLint, Tailwind CSS, carpeta `src/`, alias `@/*`). El backend vive en Route Handlers (`src/app/api/**/route.ts`) para endpoints HTTP y Server Actions para mutaciones desde formularios.
- *Alternativa*: API separada (Express/Hono). Descartada por elección del usuario: duplica despliegues, CORS y manejo de sesión.
- *Alternativa*: Supabase Edge Functions. Descartada como base; se puede añadir puntualmente si una tarea lo requiere.

### 2. `@supabase/ssr` con tres clientes
- `src/lib/supabase/client.ts`: cliente de navegador (`createBrowserClient`) con URL y anon key públicas.
- `src/lib/supabase/server.ts`: cliente de servidor (`createServerClient`) que lee y escribe cookies vía `next/headers`; usado en Server Components, Server Actions y Route Handlers.
- `src/lib/supabase/admin.ts`: cliente con service role key, importado solo desde código de servidor y marcado con `import "server-only"` para que el build falle si llega al cliente.
- *Alternativa*: `@supabase/auth-helpers-nextjs`. Descartado: está deprecado en favor de `@supabase/ssr`.

### 3. Renovación de sesión y protección de rutas en el middleware
El proxy de Next.js 16 (`src/proxy.ts`, el antiguo middleware) refresca la sesión en cada petición y redirige a `/login` cuando no hay usuario en rutas privadas. Convención de rutas:
- Públicas: `/`, `/login`, `/signup`, `/auth/**`, `/api/health`.
- Privadas: grupo `src/app/(private)/**` (página inicial `/dashboard`) y `/api/**` salvo las públicas.
Las páginas privadas vuelven a validar con `supabase.auth.getUser()` en el servidor; el middleware no es la única barrera. Los Route Handlers privados responden 401 en vez de redirigir.

### 4. Auth con email y contraseña vía Server Actions
`/signup` y `/login` usan formularios con Server Actions que llaman a `signUp` / `signInWithPassword`. La confirmación por email queda activada en Supabase (configuración por defecto) y se añade `src/app/auth/confirm/route.ts` para canjear el token del enlace. Los errores de Supabase se traducen a mensajes genéricos (ver spec `user-auth`).

### 5. Chequeo de base de datos con una función SQL
Una migración crea `public.health_check()` (función `SECURITY INVOKER` que devuelve `1`) con `GRANT EXECUTE` a `anon`. `/api/health` la invoca vía `rpc('health_check')` con un timeout de 3 s, llama a `await connection()` para ejecutarse en cada petición (la app usa Cache Components, que no admite `export const dynamic`) y responde con `Cache-Control: no-store`.
- *Alternativa*: consultar una tabla. Descartada: obliga a crear una tabla y políticas RLS solo para esto.
- *Alternativa*: usar la service role key. Descartada: el endpoint es público y no necesita privilegios.

### 6. Supabase CLI y migraciones
`supabase init` crea `supabase/config.toml` y `supabase/migrations/`. La CLI se instala como dependencia de desarrollo (`npm i -D supabase`) y se usa con `npx supabase`. Las migraciones se aplican a remoto con `supabase db push` tras `supabase link`. El desarrollo local con `supabase start` requiere Docker y es opcional.

### 7. Variables de entorno
| Variable | Ámbito | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | cliente y servidor | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente y servidor | clave pública (o la publishable key si el proyecto usa el nuevo formato) |
| `SUPABASE_SERVICE_ROLE_KEY` | solo servidor (opcional) | operaciones administrativas; se exige solo al usar `createAdminClient` |
| `NEXT_PUBLIC_SITE_URL` | cliente y servidor | URL base para redirecciones de auth |

`src/lib/env.ts` valida al arrancar las variables que la app siempre necesita y falla con un mensaje claro; la service role key se valida solo al usarse, para no obligar a cada entorno a guardar ese secreto. En desarrollo local la app corre en el puerto 3005 (`npm run dev`). Se versiona `.env.example`; `.env.local` queda en `.gitignore`.

### 8. Despliegue en Vercel
Proyecto de Vercel importado desde GitHub con framework preset Next.js. Rama de producción `main`; `develop` y las ramas de PR generan previews. Variables configuradas por entorno en Vercel (Production / Preview / Development) y descargables con `vercel env pull .env.local`. En Supabase se registran como Redirect URLs el dominio de producción y el patrón de previews (`https://*-<equipo>.vercel.app/**`).

### 9. Herramientas
npm como gestor de paquetes, Node.js 22 LTS (`engines` y `.nvmrc`), ESLint de `create-next-app` más Prettier, y Vitest para pruebas unitarias del handler de salud y de la traducción de errores de auth.

## Risks / Trade-offs

- [Previews usan la misma base de datos que producción] → Empezar con un proyecto Supabase para Preview/Development y otro para Production; si solo hay uno al inicio, documentarlo y no correr migraciones destructivas.
- [Service role key filtrada al cliente] → `server-only` en `admin.ts`, nombre sin prefijo `NEXT_PUBLIC_`, y un escenario de spec que lo verifica.
- [Redirecciones de auth rotas en previews por URL dinámica] → Redirect URLs con comodín en Supabase y `NEXT_PUBLIC_SITE_URL` derivada de `VERCEL_URL` cuando no esté definida.
- [Cambios de API entre versiones de Next.js (middleware → proxy) o de claves de Supabase] → Fijar versiones exactas en `package.json` y seguir la guía oficial de `@supabase/ssr` para la versión instalada.
- [Supabase local requiere Docker en Windows] → Opcional; el flujo por defecto usa un proyecto remoto de desarrollo.

## Migration Plan

1. Crear proyectos en Supabase y en Vercel (acción manual de la persona dueña de las cuentas).
2. Implementar en una rama desde `develop`, verificar en local y en la preview de Vercel (`/api/health` en 200, flujo de registro y login).
3. Aplicar migraciones al proyecto de producción con `supabase db push` antes de fusionar a `main`.
4. Rollback: revertir el despliegue en Vercel ("Promote" del despliegue anterior); la única migración (`health_check`) es aditiva y se puede eliminar con `DROP FUNCTION`.

## Open Questions

- ¿Un solo proyecto Supabase o dos (producción y preview)? No cambia el código, solo las variables en Vercel.
- Dominio propio para producción; se puede asignar más tarde en Vercel.
