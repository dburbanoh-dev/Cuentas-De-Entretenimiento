export const LOGIN_PATH = "/login";
export const HOME_PATH = "/dashboard";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/api/health"]);
const PUBLIC_PREFIXES = ["/auth/"];
const GUEST_ONLY_PATHS = new Set(["/login", "/signup"]);

export function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATHS.has(pathname);
}

export function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}
