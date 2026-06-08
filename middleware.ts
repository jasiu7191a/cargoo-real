import { NextResponse, type NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { jwtVerify } from "jose"

const locales = ['en', 'pl', 'de', 'fr']
const defaultLocale = 'en'

// Posts removed in the 2026-06 blog cleanup (2 test articles + 10 merged
// duplicates). Each maps to the canonical successor it was folded into, so the
// old URL 301s instead of 404-ing. Keep in sync with the DB deletions
// (scripts/execute-cleanup.mjs). Targets are LIVE posts — never add a target
// that is itself a key here, or you create a redirect loop.
const DELETED_REDIRECTS: Record<string, string> = {
  'pl-test-connectivity-check-import-guide-china-eu': '/pl/blog/pl-end-of-de-minimis-exemption-july-2026-ecommerce-preparation-vat-customs',
  'en-test-auth-check-no-publish': '/en/blog/en-ioss-july-2026-eu-3-euro-duty-full-container-imports-vs-temu-shein',
  'en-eu-made-in-europe-industrial-accelerator-act-2026-china-importers-guide': '/en/blog/en-eu-industrial-accelerator-act-2026-china-importers-guide',
  'en-made-in-europe-industrial-accelerator-act-2026-china-import-guide': '/en/blog/en-eu-industrial-accelerator-act-2026-china-importers-guide',
  'en-find-reliable-1688-suppliers-eu-import-2026-verification-guide': '/en/blog/en-find-reliable-chinese-factory-suppliers-eu-ecommerce-2026-alibaba-canton-fair',
  'en-eu-new-trade-weapon-china-overcapacity-import-guide-2026': '/en/blog/en-eu-trade-deficit-china-2026-importer-guide',
  'en-how-to-negotiate-moq-payment-terms-incoterms-chinese-factories-eu-ecommerce-2026': '/en/blog/en-negotiate-moq-payment-terms-chinese-factories-eu-importer-guide-2026',
  'en-how-to-verify-a-chinese-factory-before-ordering-eu-import-2026-supplier-due-diligence-checklist': '/en/blog/en-how-to-verify-chinese-factory-legitimacy-7-due-diligence-steps-eu-ecommerce-importers-2026',
  'de-eu-new-trade-instrument-chinese-overcapacity-2026-german-importers-guide': '/de/blog/de-eu-industry-law-2026-china-import-germany-guide',
  'de-cbam-co2-grenzausgleich-china-import-2026-pflichten-deutsche-importeure': '/de/blog/de-cbam-pflichten-2026-deutsche-online-shops-stahl-aluminium-china',
  'pl-nowe-clo-ue-3-euro-lipiec-2026-polskie-sklepy-import-chiny': '/pl/blog/pl-end-of-de-minimis-exemption-july-2026-ecommerce-preparation-vat-customs',
  'fr-tva-import-china-france-2026-guide-sme-ecommerce-vat-customs': '/fr/blog/fr-import-china-france-2026-vat-duties-ecommerce-guide',
}

// Note: CORS for /api/* is handled by next.config.js `headers()` (static)
// and per-route OPTIONS handlers (returning 204). Don't set CORS headers
// from middleware — doing so concatenates with the static config and the
// browser rejects the resulting comma-joined `Access-Control-Allow-*`
// values as malformed.
// Evaluated lazily inside the middleware function so a missing secret only
// blocks admin routes, not public pages.
const getSecret = () => {
  const s = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("SESSION_SECRET (or NEXTAUTH_SECRET) env var is required but not set.");
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

function publicLegalPath(pathname: string) {
  const match = pathname.match(/^\/(en|pl|de|fr)\/(terms|privacy|refund)\/?$/)
  if (!match) return null

  const [, lang, slug] = match
  if (lang === 'en') return `/${slug}`
  return `/cargoo-${lang}/${slug}`
}

function nextWithLocale(request: NextRequest, locale: string) {
  const headers = new Headers(request.headers)
  headers.set('x-cargoo-locale', locale)
  return NextResponse.next({ request: { headers } })
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

  const legalPath = publicLegalPath(pathname)
  if (legalPath) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = `www.${ROOT_DOMAIN}`
    url.pathname = legalPath
    return NextResponse.redirect(url, { status: 301 })
  }

  // 1b. CANONICALISE BLOG CONTENT — one URL per post.
  //     Every post must live at exactly: https://www.cargooimport.eu/{slugLang}/blog/{slug}
  //     This 301s away the three duplicate surfaces that were getting indexed:
  //       - /{lang}/resources/{slug}            (duplicate render of the same post)
  //       - /{wrongLang}/blog|resources/{slug}  (slug carries its own lang prefix, e.g. fr-…)
  //       - blog.cargooimport.eu/{lang}/...     (duplicate host)
  //     Loop-safe: the target (/{slugLang}/blog/{slug} on www) fails every redirect
  //     condition below, so it passes through untouched.
  const contentMatch = pathname.match(/^\/(en|pl|de|fr)\/(blog|resources)\/([^/]+)\/?$/)
  if (contentMatch) {
    const [, urlLang, section, slug] = contentMatch

    // Deleted/merged posts → 301 to their canonical successor (zero 404s).
    // Runs before canonicalisation so a deleted slug under /resources/ still
    // lands on its successor instead of a now-missing /blog/{slug}.
    const deletedTarget = DELETED_REDIRECTS[slug]
    if (deletedTarget) {
      const url = request.nextUrl.clone()
      url.protocol = 'https:'
      url.host = `www.${ROOT_DOMAIN}`
      url.pathname = deletedTarget
      url.search = ''
      return NextResponse.redirect(url, { status: 301 })
    }

    const slugLangMatch = slug.match(/^(en|pl|de|fr)-/)
    const correctLang = slugLangMatch ? slugLangMatch[1] : urlLang
    const isProdHost =
      host === `www.${ROOT_DOMAIN}` || host === `blog.${ROOT_DOMAIN}` || host === ROOT_DOMAIN
    const needsHostFix = isProdHost && host !== `www.${ROOT_DOMAIN}`
    if (section === 'resources' || urlLang !== correctLang || needsHostFix) {
      const url = request.nextUrl.clone()
      url.protocol = 'https:'
      if (isProdHost) url.host = `www.${ROOT_DOMAIN}`
      url.pathname = `/${correctLang}/blog/${slug}`
      url.search = ''
      return NextResponse.redirect(url, { status: 301 })
    }
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

    const token = request.cookies.get("cargoo_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, getSecret());
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
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
  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1] || defaultLocale
    return nextWithLocale(request, locale)
  }

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
    // Public pages matcher (api routes are excluded; CORS for /api is
    // handled by next.config.js headers() + per-route OPTIONS handlers).
    '/((?!api|sitemap|_next/static|_next/image|favicon.ico|assets|css|img|js|admin-assets|google[^/]*).*)',
  ],
}
