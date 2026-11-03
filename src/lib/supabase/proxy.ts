import { createServerClient } from "@supabase/ssr";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";
import {
  HOME_PATH,
  LOGIN_PATH,
  isApiPath,
  isGuestOnlyPath,
  isPublicPath,
} from "@/lib/auth/routes";

// Renueva la sesión en cada petición y aplica la protección de rutas.
export async function updateSession(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  let response = NextResponse.next({ request });
  // Cabeceras anti-caché que @supabase/ssr pide al renovar la sesión.
  const sessionHeaders: Record<string, string> = {};

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        Object.assign(sessionHeaders, headers);
        for (const [key, value] of Object.entries(sessionHeaders)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // No ejecutar código entre createServerClient y getClaims: es lo que renueva la sesión.
  const { data, error } = await supabase.auth.getClaims();
  const { pathname } = request.nextUrl;

  // Si Supabase Auth no responde, no se puede saber si hay sesión: se informa
  // de la caída en vez de tratar a todos como no autenticados.
  if (isAuthRetryableFetchError(error) && !isPublicPath(pathname)) {
    const unavailable = isApiPath(pathname)
      ? NextResponse.json(
          { error: "Servicio no disponible" },
          { status: 503, headers: { "Retry-After": "30" } },
        )
      : new NextResponse(
          "Servicio temporalmente no disponible. Inténtalo de nuevo en unos segundos.",
          { status: 503, headers: { "Retry-After": "30" } },
        );
    return withSession(unavailable, response, sessionHeaders);
  }

  const isAuthenticated = Boolean(data?.claims?.sub);

  if (!isAuthenticated && !isPublicPath(pathname)) {
    if (isApiPath(pathname)) {
      return withSession(
        NextResponse.json({ error: "No autenticado" }, { status: 401 }),
        response,
        sessionHeaders,
      );
    }
    return withSession(
      redirectTo(request, LOGIN_PATH),
      response,
      sessionHeaders,
    );
  }

  if (isAuthenticated && isGuestOnlyPath(pathname)) {
    return withSession(
      redirectTo(request, HOME_PATH),
      response,
      sessionHeaders,
    );
  }

  return response;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

// Conserva las cookies renovadas y sus cabeceras anti-caché al responder con
// algo distinto de NextResponse.next().
function withSession(
  target: NextResponse,
  source: NextResponse,
  headers: Record<string, string>,
) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  for (const [key, value] of Object.entries(headers)) {
    target.headers.set(key, value);
  }
  return target;
}
