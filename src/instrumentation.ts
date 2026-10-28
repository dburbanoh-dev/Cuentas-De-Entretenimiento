import { assertServerEnv } from "@/lib/env";

// Se ejecuta una vez al arrancar el servidor: falla pronto si falta configuración.
export function register() {
  assertServerEnv();
}
