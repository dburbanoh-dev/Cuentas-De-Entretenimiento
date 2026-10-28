export class MissingEnvError extends Error {
  constructor(name: string) {
    super(`Falta la variable de entorno ${name}. Revisa .env.example.`);
    this.name = "MissingEnvError";
  }
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new MissingEnvError(name);
  }
  return value;
}

// Las variables NEXT_PUBLIC_* se leen con acceso literal para que Next.js
// pueda incrustarlas en el bundle del navegador.
export function getPublicEnv() {
  return {
    supabaseUrl: required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    supabaseAnonKey: required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

// No se exige al arrancar: solo la necesita createAdminClient, y así los
// entornos que no la usan no tienen por qué guardar este secreto.
export function getServiceRoleKey(): string {
  return required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

// En las previews de Vercel NEXT_PUBLIC_SITE_URL puede no estar definida;
// se usa la URL del despliegue que Vercel inyecta en VERCEL_URL.
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  throw new MissingEnvError("NEXT_PUBLIC_SITE_URL");
}

export function assertServerEnv(): void {
  getPublicEnv();
  getSiteUrl();
}
