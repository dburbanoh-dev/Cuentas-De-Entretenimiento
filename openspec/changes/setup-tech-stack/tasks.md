# Tasks

## 1. Base del proyecto Next.js

- [x] 1.1 Crear la app con `create-next-app` en la raíz (TypeScript, ESLint, Tailwind, `src/`, alias `@/*`, npm) conservando `README.md` y `openspec/`; verificar que `npm run dev` sirve la página inicial en `http://localhost:3000`
- [x] 1.2 Fijar Node.js 22 (`.nvmrc` y `engines` en `package.json`) y versiones exactas de dependencias; verificar que `npm ci` instala sin errores
- [x] 1.3 Añadir Prettier con script `format` y Vitest con script `test`; verificar que `npm run lint`, `npm run format -- --check` y `npm test` terminan sin errores
- [x] 1.4 Revisar `.gitignore` para excluir `.env*.local`, `.vercel` y `supabase/.temp`; verificar con `git status` que no aparecen tras crear un `.env.local` de prueba

## 2. Integración con Supabase

- [x] 2.1 Instalar `@supabase/supabase-js`, `@supabase/ssr`, `server-only` y `supabase` (dev); verificar que aparecen en `package.json` y `npx supabase --version` responde
- [x] 2.2 Crear `src/lib/env.ts` que valida `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_SITE_URL` (con fallback a `VERCEL_URL`), y `.env.example`; verificar con una prueba de Vitest que falta una variable produce un error con su nombre
- [x] 2.3 Crear los clientes `src/lib/supabase/client.ts`, `server.ts` y `admin.ts` (este último con `import "server-only"`); verificar que `npm run build` pasa y que importar `admin.ts` desde un componente cliente hace fallar el build
- [x] 2.4 Ejecutar `npx supabase init` y enlazar el proyecto remoto de desarrollo con `npx supabase link`; verificar que existen `supabase/config.toml` y `supabase/migrations/`
- [x] 2.5 Documentar en `README.md` la creación del proyecto Supabase, las variables y los comandos de la CLI; verificar siguiendo el README desde un clon limpio hasta `npm run dev`

## 3. Endpoint de salud (spec `system-health`)

- [x] 3.1 Crear la migración `health_check` (función que devuelve 1, `GRANT EXECUTE` a `anon`) y aplicarla con `npx supabase db push`; verificar con `select public.health_check();` en el SQL editor
- [x] 3.2 Implementar `GET /api/health` con timeout de 3 s, `await connection()` y `Cache-Control: no-store`; verificar con `curl -i http://localhost:3000/api/health` que responde 200 con `status`, `database` y `timestamp`
- [x] 3.3 Añadir pruebas de Vitest del handler con el cliente simulado: éxito (200), error de base de datos (503 sin mensaje interno) y timeout (503 antes de 5 s); verificar que `npm test` las ejecuta y pasan

## 4. Autenticación (spec `user-auth`)

- [x] 4.1 Implementar el proxy de sesión (`src/proxy.ts`) que refresca cookies y redirige rutas privadas a `/login` y usuarios autenticados desde `/login` y `/signup` a `/dashboard`, dejando públicas `/`, `/auth/**` y `/api/health`; verificar en el navegador que `/dashboard` sin sesión redirige a `/login`
- [x] 4.2 Crear una utilidad que traduce errores de Supabase Auth a mensajes genéricos ("Email o contraseña incorrectos", longitud mínima, email ya registrado) con pruebas de Vitest; verificar que `npm test` las pasa
- [ ] 4.3 Crear `/signup` con Server Action (`signUp`, validación de contraseña de 8+ caracteres) y la ruta `/auth/confirm` que canjea el token; verificar registrando un email real y confirmando desde el enlace recibido
- [ ] 4.4 Crear `/login` con Server Action (`signInWithPassword`) que redirige a `/dashboard`; verificar inicio de sesión correcto y el mensaje genérico con contraseña incorrecta
- [ ] 4.5 Crear la página privada `/dashboard` en `src/app/(private)/` que valida con `getUser()` en el servidor y muestra el email, más la acción de cerrar sesión; verificar que tras cerrar sesión `/dashboard` vuelve a redirigir a `/login`
- [x] 4.6 Añadir un Route Handler privado de ejemplo (`GET /api/me`) que responde 401 sin sesión; verificar con `curl -i` sin cookies que devuelve 401
- [ ] 4.7 Configurar en Supabase Site URL y Redirect URLs (localhost, producción y patrón de previews) y documentarlo en `README.md`; verificar que el enlace de confirmación vuelve a la app en local
- [x] 4.8 Verificar que la service role key no llega al cliente buscando su valor en `.next/static` tras `npm run build` (no debe aparecer)

## 5. Despliegue en Vercel

- [ ] 5.1 Importar el repositorio en Vercel (preset Next.js, rama de producción `main`) y cargar las variables por entorno; verificar que el despliegue de preview de esta rama termina en estado Ready
- [ ] 5.2 Documentar en `README.md` el flujo de despliegue (previews por rama, `vercel env pull`, aplicar migraciones antes de fusionar a `main`); verificar que los comandos documentados funcionan

## 6. Verificación integrada

- [ ] 6.1 En la URL de preview de Vercel: `GET /api/health` responde 200 con `"database": "ok"`, y el flujo registro → confirmación → login → `/dashboard` → cerrar sesión funciona de principio a fin
- [x] 6.2 Ejecutar `npx openspec validate setup-tech-stack --strict` y `npm run lint && npm test && npm run build`; verificar que todo pasa

## Workflow follow-up

- Abrir un PR de la rama de trabajo hacia `develop` para revisión.
- Archivar el cambio con `/opsx:archive` cuando esté fusionado y verificado en producción.
