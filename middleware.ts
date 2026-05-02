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

// The bare root domain — only this gets the non-www → www redirect.
const ROOT_DOMAIN = 'cargooimport.eu'

function isPublicAppPath(pathname: string) {
  return /^\/(en|pl|de|fr)\/(blog|resources)(\/|$)/.test(pathname)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // 1. CANONICAL REDIRECT: cargooimport.eu → www.cargooimport.eu only.
  //    Subdomains (blog., admin.) and preview URLs (*.pages.dev) are left alone.
  if (host === ROOT_DOMAIN) {
    const url = request.nextUrl.clone()
    url.host = `www.${ROOT_DOMAIN}`
    return NextResponse.redirect(url, { status: 301 })
  }

  // 2. SMART SUBDOMAIN SHORTCUTS
  //    blog.cargooimport.eu  → /<locale>/blog  (unless already on a blog path)
  //    admin.cargooimport.eu → /admin          (unless already on an admin path)
  if (host === `blog.${ROOT_DOMAIN}`) {
    if (!pathname.startsWith('/en/blog') &&
        !pathname.startsWith('/pl/blog') &&
        !pathname.startsWith('/de/blog') &&
        !pathname.startsWith('/fr/blog') &&
        !pathname.startsWith('/api/') &&
        !pathname.startsWith('/_next/')) {
      const locale = getLocale(request)
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/blog`
      return NextResponse.redirect(url, { status: 302 })
    }
  }

  if (host === `admin.${ROOT_DOMAIN}`) {
    if (!pathname.startsWith('/admin') &&
        !pathname.startsWith('/api/') &&
        !pathname.startsWith('/_next/') &&
        !isPublicAppPath(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url, { status: 302 })
    }
  }

  // 3. BYPASS & AUTH: Handle all admin routes in one block
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

  // 4. BYPASS: Never touch api routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 5. LOCALIZATION: Handle language redirects for public pages only
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
