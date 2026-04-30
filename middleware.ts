import { NextResponse, type NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { jwtVerify } from "jose"

const locales = ['en', 'pl', 'de', 'fr']
const defaultLocale = 'en'
// Evaluated lazily inside the middleware function so a missing secret only
// blocks admin routes, not public pages.
const getSecret = () => {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET env var is required but not set.");
  return new TextEncoder().encode(s);
};

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

  // Redirect non-www to www (canonical domain)
  const host = request.headers.get('host') || ''
  if (
    !host.startsWith('www.') &&
    !host.includes('localhost') &&
    !host.includes('127.0.0.1') &&
    !host.endsWith('.vercel.app') &&
    !host.endsWith('.pages.dev')
  ) {
    const url = request.nextUrl.clone()
    url.host = `www.${host}`
    return NextResponse.redirect(url, { status: 301 })
  }
  
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
      await jwtVerify(token, getSecret());
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
    '/((?!api|sitemap|_next/static|_next/image|favicon.ico|assets|img|js|admin-assets|google[^/]*).*)',
  ],
}
