import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertServerEnv,
  getServiceRoleKey,
  getSiteUrl,
  MissingEnvError,
} from "./env";

const complete = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3005",
  VERCEL: "",
  VERCEL_ENV: "",
  VERCEL_URL: "",
  VERCEL_PROJECT_PRODUCTION_URL: "",
};

const vercelProduction = {
  VERCEL: "1",
  VERCEL_ENV: "production",
  VERCEL_URL: "app-abc123.vercel.app",
  VERCEL_PROJECT_PRODUCTION_URL: "app.vercel.app",
};

function stubEnv(values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) {
    vi.stubEnv(name, value);
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("assertServerEnv", () => {
  it("acepta un entorno completo", () => {
    stubEnv(complete);
    expect(() => assertServerEnv()).not.toThrow();
  });

  it.each([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
  ])("falla con el nombre de la variable cuando falta %s", (name) => {
    stubEnv({ ...complete, [name]: "" });
    expect(() => assertServerEnv()).toThrow(MissingEnvError);
    expect(() => assertServerEnv()).toThrow(name);
  });

  it("arranca sin la clave de servicio", () => {
    stubEnv({ ...complete, SUPABASE_SERVICE_ROLE_KEY: "" });
    expect(() => assertServerEnv()).not.toThrow();
  });
});

describe("getServiceRoleKey", () => {
  it("falla con el nombre de la variable cuando se usa sin definirla", () => {
    stubEnv({ ...complete, SUPABASE_SERVICE_ROLE_KEY: "" });
    expect(() => getServiceRoleKey()).toThrow("SUPABASE_SERVICE_ROLE_KEY");
  });
});

describe("getSiteUrl", () => {
  it("usa VERCEL_URL cuando no hay NEXT_PUBLIC_SITE_URL", () => {
    stubEnv({
      ...complete,
      NEXT_PUBLIC_SITE_URL: "",
      VERCEL_URL: "app-git-x.vercel.app",
    });
    expect(getSiteUrl()).toBe("https://app-git-x.vercel.app");
  });

  it("usa localhost fuera de Vercel", () => {
    stubEnv(complete);
    expect(getSiteUrl()).toBe("http://localhost:3005");
  });

  it("ignora localhost en producción de Vercel y usa el dominio de producción", () => {
    stubEnv({ ...complete, ...vercelProduction });
    expect(getSiteUrl()).toBe("https://app.vercel.app");
  });

  it("ignora localhost en una preview de Vercel y usa VERCEL_URL", () => {
    stubEnv({ ...complete, ...vercelProduction, VERCEL_ENV: "preview" });
    expect(getSiteUrl()).toBe("https://app-abc123.vercel.app");
  });

  it("respeta un valor no local en Vercel", () => {
    stubEnv({
      ...complete,
      ...vercelProduction,
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    });
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("quita la barra final", () => {
    stubEnv({ ...complete, NEXT_PUBLIC_SITE_URL: "https://example.com/" });
    expect(getSiteUrl()).toBe("https://example.com");
  });
});
