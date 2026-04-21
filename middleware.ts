import { NextResponse, type NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { jwtVerify } from "jose"

const locales = ['en', 'pl', 'de', 'fr']
const defaultLocale = 'en'
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "diagnostic-secret-atomic-1234567890-abcdefghijklmnopqrstuvwxyz-!!!");

function getLocale(request: NextRequest) {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  try {
    return match(languages, locales, defaultLocale)
  } catch (e) {
    return defaultLocale
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. AUTH PROTECTION: Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (err) {
      console.error("JWT Verify Error:", err);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 2. BYPASS: Never touch api routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 3. LOCALIZATION: Handle language redirects for public pages
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameHasLocale) return

  const locale = getLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // Include /admin in the matcher so we can protect it
    '/admin/:path*',
    // Public pages matcher
    '/((?!api|_next/static|_next/image|favicon.ico|assets|img|js|admin-assets).*)',
  ],
}
