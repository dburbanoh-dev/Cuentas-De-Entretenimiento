import { describe, expect, it } from "vitest";
import { isApiPath, isGuestOnlyPath, isPublicPath } from "./routes";

describe("isPublicPath", () => {
  it.each(["/", "/login", "/signup", "/auth/confirm", "/api/health"])(
    "%s es pública",
    (path) => expect(isPublicPath(path)).toBe(true),
  );

  it.each(["/dashboard", "/api/me", "/api/health/extra", "/authx"])(
    "%s es privada",
    (path) => expect(isPublicPath(path)).toBe(false),
  );
});

describe("isGuestOnlyPath", () => {
  it("incluye login y signup", () => {
    expect(isGuestOnlyPath("/login")).toBe(true);
    expect(isGuestOnlyPath("/signup")).toBe(true);
    expect(isGuestOnlyPath("/dashboard")).toBe(false);
  });
});

describe("isApiPath", () => {
  it("detecta rutas de la API", () => {
    expect(isApiPath("/api/me")).toBe(true);
    expect(isApiPath("/apis")).toBe(false);
  });
});
