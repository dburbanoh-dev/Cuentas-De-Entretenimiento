export const MIN_PASSWORD_LENGTH = 8;

export const AUTH_MESSAGES = {
  invalidCredentials: "Email o contraseña incorrectos",
  invalidEmail: "Ingresa un email válido.",
  passwordTooShort: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  passwordCharacters:
    "La contraseña debe combinar los tipos de caracteres requeridos (por ejemplo, letras, números y símbolos).",
  passwordPwned:
    "Esa contraseña aparece en filtraciones conocidas. Elige una diferente.",
  passwordWeak: "La contraseña no cumple los requisitos de seguridad.",
  signupFailed: "No se pudo crear la cuenta con esos datos.",
  emailNotConfirmed: "Confirma tu email antes de iniciar sesión.",
  rateLimited: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
  generic: "Ocurrió un error. Inténtalo de nuevo.",
} as const;

type AuthErrorLike =
  | { code?: string; status?: number; reasons?: readonly string[] }
  | null
  | undefined;

// Supabase indica por qué rechazó la contraseña: longitud, tipos de
// caracteres o aparición en filtraciones.
function weakPasswordMessage(reasons: readonly string[] = []): string {
  if (reasons.includes("length")) {
    return AUTH_MESSAGES.passwordTooShort;
  }
  if (reasons.includes("characters")) {
    return AUTH_MESSAGES.passwordCharacters;
  }
  if (reasons.includes("pwned")) {
    return AUTH_MESSAGES.passwordPwned;
  }
  return AUTH_MESSAGES.passwordWeak;
}

// Traduce errores de Supabase Auth a mensajes para la persona usuaria,
// sin revelar detalles internos ni cuál credencial falló.
export function toAuthMessage(error: AuthErrorLike): string {
  switch (error?.code) {
    case "invalid_credentials":
    case "user_not_found":
      return AUTH_MESSAGES.invalidCredentials;
    case "weak_password":
      return weakPasswordMessage(error.reasons);
    case "user_already_exists":
    case "email_exists":
      return AUTH_MESSAGES.signupFailed;
    case "email_not_confirmed":
      return AUTH_MESSAGES.emailNotConfirmed;
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return AUTH_MESSAGES.rateLimited;
  }
  if (error?.status === 429) {
    return AUTH_MESSAGES.rateLimited;
  }
  return AUTH_MESSAGES.generic;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Credentials = { email: string; password: string };

export function parseCredentials(
  formData: FormData,
): { ok: true; value: Credentials } | { ok: false; message: string } {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, message: AUTH_MESSAGES.invalidEmail };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: AUTH_MESSAGES.passwordTooShort };
  }
  return { ok: true, value: { email, password } };
}
