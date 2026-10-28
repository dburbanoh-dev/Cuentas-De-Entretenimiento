import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { HOME_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

// Canjea el enlace de confirmación de email. Admite el formato con token_hash
// (plantilla de email personalizada) y el formato con code (plantilla por defecto).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();
  let destination = "/auth/error";
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      destination = HOME_PATH;
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // Supabase solo emite el code después de verificar el email. Si el canje
    // falla (enlace abierto en otro navegador o dispositivo), el email ya está
    // confirmado y solo falta iniciar sesión.
    destination = error ? "/auth/confirmed" : HOME_PATH;
  }

  const url = request.nextUrl.clone();
  url.search = "";
  url.pathname = destination;
  return NextResponse.redirect(url);
}
