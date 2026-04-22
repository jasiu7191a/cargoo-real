import { NextResponse, type NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { jwtVerify } from "jose"

const locales = ['en', 'pl', 'de', 'fr']
const defaultLocale = 'en'
// No fallback: a missing secret must be a hard failure, not a public default.
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET env var is required but not set.");
}
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

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
  
  // 1. BYPASS & AUTH: Handle all admin routes in one block
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Skip protection for login page and its assets
    if (pathname === '/admin/login' || pathname.startsWith('/admin-assets/')) {
      return NextResponse.next()
    }

    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 2. BYPASS: Never touch api routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 3. LOCALIZATION: Handle language redirects for public pages only
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
    // Direct match for admin
    '/admin',
    '/admin/:path*',
    // Public pages matcher
    '/((?!api|_next/static|_next/image|favicon.ico|assets|img|js|admin-assets).*)',
  ],
}
