# Cuentas de Entretenimiento

Aplicación Next.js (App Router, TypeScript, Tailwind CSS) con backend integrado (Route Handlers y Server Actions), base de datos y autenticación en Supabase, y despliegue en Vercel.

La planificación vive en `openspec/` (ver `openspec/changes/` y `openspec/specs/`).

## Requisitos

- Node.js 22 (`.nvmrc`) y npm
- Una cuenta de Supabase y otra de Vercel
- Docker solo si quieres correr Supabase en local (opcional)

## Puesta en marcha

El servidor de desarrollo usa el puerto 3005 (`npm run dev`), porque en algunos equipos el 3000 lo ocupan otros servicios.

```bash
npm ci
cp .env.example .env.local   # completa los valores (ver abajo)
npm run dev                  # http://localhost:3005
```

### Variables de entorno

| Variable                        | Dónde se usa             | De dónde sale                                                  |
| ------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | cliente y servidor       | Supabase > Project Settings > API > Project URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente y servidor       | Supabase > Project Settings > API Keys > anon / publishable    |
| `SUPABASE_SERVICE_ROLE_KEY`     | solo servidor (opcional) | Supabase > Project Settings > API Keys > service_role / secret |
| `NEXT_PUBLIC_SITE_URL`          | servidor                 | URL base de la app; en previews de Vercel se usa `VERCEL_URL`  |

La app valida al arrancar (`src/instrumentation.ts`) la URL, la clave pública y la URL base, y falla con el nombre de la que falta. La clave de servicio es opcional: solo se exige cuando se usa `createAdminClient`. Nunca lleva el prefijo `NEXT_PUBLIC_` y solo se importa desde `src/lib/supabase/admin.ts`, que está protegido con `server-only`.

## Supabase

### Crear y enlazar el proyecto

1. Crea un proyecto en [supabase.com](https://supabase.com) (recomendado: uno para producción y otro para desarrollo y previews).
2. Copia la URL y las claves a `.env.local`.
3. Enlaza el repo y aplica las migraciones:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Para comprobarlo, ejecuta `select public.health_check();` en el SQL Editor: debe devolver `1`.

### Configuración de Auth (en el panel de Supabase)

En **Authentication > URL Configuration**:

- **Site URL**: `http://localhost:3005` en el proyecto de desarrollo; el dominio de producción en el de producción.
- **Redirect URLs**:
  - `http://localhost:3005/**`
  - `https://<dominio-de-produccion>/**`
  - `https://*-<equipo-de-vercel>.vercel.app/**` (previews)

En **Authentication > Providers > Email**: confirmación de email activada y longitud mínima de contraseña 8.

El enlace de confirmación vuelve a `/auth/confirm`, que acepta tanto el formato por defecto (`?code=`) como una plantilla personalizada con `?token_hash=...&type=email`. Con el formato por defecto, el enlace inicia la sesión solo en el navegador donde se hizo el registro; si se abre en otro navegador o dispositivo, el email queda confirmado igual y la app muestra `/auth/confirmed` para que la persona inicie sesión.

### Comandos útiles de la CLI

```bash
npx supabase migration new <nombre>   # nueva migración en supabase/migrations
npx supabase db push                  # aplica migraciones al proyecto enlazado
npx supabase start                    # Supabase local (requiere Docker)
```

`supabase/config.toml` solo configura el entorno local.

## Rutas

| Ruta              | Acceso  | Descripción                                             |
| ----------------- | ------- | ------------------------------------------------------- |
| `/`               | público | Portada                                                 |
| `/signup`         | público | Registro con email y contraseña                         |
| `/login`          | público | Inicio de sesión                                        |
| `/auth/confirm`   | público | Canje del enlace de confirmación                        |
| `/auth/confirmed` | público | Email confirmado en otro navegador: pide iniciar sesión |
| `/dashboard`      | privado | Página inicial con sesión; permite cerrar sesión        |
| `/api/health`     | público | Estado de la app y de la base de datos (200 o 503)      |
| `/api/me`         | privado | Usuario actual; 401 sin sesión                          |

`src/proxy.ts` renueva la sesión en cada petición, redirige las páginas privadas a `/login` y responde 401 en la API privada. Si Supabase Auth no responde, las rutas privadas devuelven 503 en vez de cerrar la sesión. Las páginas privadas vuelven a validar la sesión en el servidor.

## Scripts

```bash
npm run dev            # servidor de desarrollo en http://localhost:3005
npm run build          # build de producción
npm run lint           # ESLint
npm run format         # Prettier (escribe)
npm run format:check   # Prettier (solo comprueba)
npm test               # Vitest
```

## Despliegue en Vercel

1. En Vercel, **Add New > Project** e importa este repositorio (preset Next.js, sin cambios de build).
2. En **Settings > Git**, rama de producción `main`. `develop` y las ramas de PR generan previews automáticamente.
3. En **Settings > Environment Variables**, carga las variables de la tabla anterior por entorno:
   - **Production**: proyecto Supabase de producción y `NEXT_PUBLIC_SITE_URL` con el dominio final.
   - **Preview** y **Development**: proyecto Supabase de desarrollo; `NEXT_PUBLIC_SITE_URL` se puede omitir.
4. Para usar en local las mismas variables:

```bash
npx vercel link
npx vercel env pull .env.local
```

5. Antes de fusionar a `main`, aplica las migraciones pendientes al proyecto de producción (`npx supabase link` con su `project-ref` y `npx supabase db push`).
6. Tras cada despliegue, comprueba `https://<dominio>/api/health`: debe responder `200` con `"database": "ok"`.

Rollback: en Vercel, **Deployments > (despliegue anterior) > Promote to Production**.
