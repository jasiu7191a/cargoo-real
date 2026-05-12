// Legacy sitemap endpoint — kept for backward compatibility with
// cargoo/sitemap-index.xml which still references /api/sitemap.xml.
// The canonical sitemap implementation lives in app/sitemap/route.ts and
// includes hreflang alternates per URL + lastmod from blog posts. We
// re-export GET so both /api/sitemap.xml and /sitemap serve identical
// content.

export { GET } from "@/app/sitemap/route";

export const dynamic = "force-dynamic";
