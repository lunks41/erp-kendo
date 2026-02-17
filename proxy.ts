import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Define public routes (path without locale prefix)
const publicRoutes = ["/login", "/register", "/forgot-password", "/reports"];

// Define auth routes that require authentication but not company selection
const authRoutes = ["/company-select"];

const intlMiddleware = createIntlMiddleware(routing);

function getPathWithoutLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|ar|ja)(\/|$)/);
  if (!match) return pathname;
  return (match[2] === "/" ? pathname.slice(match[0].length - 1) : "/") || "/";
}

function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(en|ar|ja)(?=\/|$)/);
  return match ? match[1] : routing.defaultLocale;
}

function jwtDecode(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= (decoded.exp as number) * 1000;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const isRedirect = intlResponse.status >= 300 && intlResponse.status < 400;
  if (isRedirect) {
    return intlResponse;
  }

  const { pathname } = request.nextUrl;
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const locale = getLocaleFromPath(pathname);
  const prefix = `/${locale}`;

  const token = request.cookies.get("auth-token")?.value;

  if (!token && !publicRoutes.includes(pathWithoutLocale)) {
    return NextResponse.redirect(new URL(`${prefix}/login`, request.url));
  }

  if (token && !publicRoutes.includes(pathWithoutLocale)) {
    try {
      const decoded = jwtDecode(token);
      if (!decoded || !decoded.exp) {
        return NextResponse.redirect(new URL(`${prefix}/login`, request.url));
      }
      if (isTokenExpired(token)) {
        return NextResponse.redirect(new URL(`${prefix}/login`, request.url));
      }
    } catch {
      return NextResponse.redirect(new URL(`${prefix}/login`, request.url));
    }
  }

  if (
    token &&
    !authRoutes.includes(pathWithoutLocale) &&
    !publicRoutes.includes(pathWithoutLocale)
  ) {
    const pathParts = pathWithoutLocale.split("/").filter(Boolean);
    if (pathParts.length < 1) {
      return NextResponse.redirect(new URL(`${prefix}/company-select`, request.url));
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
