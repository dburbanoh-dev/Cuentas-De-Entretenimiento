import { describe, expect, it } from "vitest";
import { AUTH_MESSAGES, parseCredentials, toAuthMessage } from "./messages";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) {
    data.set(name, value);
  }
  return data;
}

describe("toAuthMessage", () => {
  it("usa el mismo mensaje para email inexistente y contraseña incorrecta", () => {
    expect(toAuthMessage({ code: "invalid_credentials" })).toBe(
      "Email o contraseña incorrectos",
    );
    expect(toAuthMessage({ code: "user_not_found" })).toBe(
      "Email o contraseña incorrectos",
    );
  });

  it("indica la longitud mínima cuando la contraseña es corta", () => {
    expect(toAuthMessage({ code: "weak_password", reasons: ["length"] })).toBe(
      AUTH_MESSAGES.passwordTooShort,
    );
    expect(AUTH_MESSAGES.passwordTooShort).toContain("8");
  });

  it("explica el motivo real de una contraseña débil", () => {
    expect(
      toAuthMessage({ code: "weak_password", reasons: ["characters"] }),
    ).toBe(AUTH_MESSAGES.passwordCharacters);
    expect(toAuthMessage({ code: "weak_password", reasons: ["pwned"] })).toBe(
      AUTH_MESSAGES.passwordPwned,
    );
    expect(toAuthMessage({ code: "weak_password" })).toBe(
      AUTH_MESSAGES.passwordWeak,
    );
  });

  it("devuelve un error genérico para un email ya registrado", () => {
    expect(toAuthMessage({ code: "user_already_exists" })).toBe(
      AUTH_MESSAGES.signupFailed,
    );
    expect(toAuthMessage({ code: "email_exists" })).toBe(
      AUTH_MESSAGES.signupFailed,
    );
  });

  it("trata el límite de peticiones", () => {
    expect(toAuthMessage({ status: 429 })).toBe(AUTH_MESSAGES.rateLimited);
  });

  it("no expone códigos desconocidos", () => {
    expect(toAuthMessage({ code: "unexpected_failure" })).toBe(
      AUTH_MESSAGES.generic,
    );
    expect(toAuthMessage(null)).toBe(AUTH_MESSAGES.generic);
  });
});

describe("parseCredentials", () => {
  it("acepta un email válido y una contraseña de 8 caracteres", () => {
    expect(
      parseCredentials(
        form({ email: " ana@example.com ", password: "12345678" }),
      ),
    ).toEqual({
      ok: true,
      value: { email: "ana@example.com", password: "12345678" },
    });
  });

  it("rechaza contraseñas de menos de 8 caracteres", () => {
    expect(
      parseCredentials(form({ email: "ana@example.com", password: "1234567" })),
    ).toEqual({ ok: false, message: AUTH_MESSAGES.passwordTooShort });
  });

  it("rechaza emails inválidos", () => {
    expect(
      parseCredentials(form({ email: "ana", password: "12345678" })),
    ).toEqual({ ok: false, message: AUTH_MESSAGES.invalidEmail });
  });
});
