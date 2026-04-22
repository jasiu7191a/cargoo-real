#!/usr/bin/env bash
# Push the second wave of fixes:
#   1. Scaffold i18n dictionary (en/pl/de/fr) and wire into blog index + post pages
#   2. Fix hardcoded base URL in lib/seo.ts (cargoo.com -> cargooimport.eu)
#   3. Neutralize the duplicate unprotected [lang]/admin/ tree (redirects to real /admin)
#   4. Delete the [lang]/admin/ tree entirely from the repo
#
# Usage: bash push-fixes.sh
set -e

# Clear any stale lock left behind by the sandbox.
rm -f .git/index.lock

# Stage all source edits.
git add lib/dictionaries.ts \
        lib/dictionaries/en.json \
        lib/dictionaries/pl.json \
        lib/dictionaries/de.json \
        lib/dictionaries/fr.json \
        "app/[lang]/blog/page.tsx" \
        "app/[lang]/blog/[slug]/page.tsx" \
        lib/seo.ts

# Remove the deprecated duplicate admin tree (the [lang]/admin/* routes were
# unprotected by middleware; the real admin lives at /admin).
git rm -rf "app/[lang]/admin" 2>/dev/null || true

# Sanity check what we're about to commit.
echo "--- staged changes ---"
git diff --cached --stat

# Commit.
git commit -m "feat: i18n scaffold + security/deprecation cleanup

- Add server-side dictionary loader (lib/dictionaries.ts) with en/pl/de/fr
  bundles for the blog chrome (hero, subtitle, empty state, CTA, nav).
- Wire blog index and blog post pages through getDictionary(params.lang)
  so /pl, /de, /fr actually serve translated UI strings (post content
  itself still comes from the DB).
- Also localize the post date format via toLocaleDateString(params.lang).
- Delete the duplicate unprotected app/[lang]/admin/* route tree. These
  pages bypassed the middleware JWT check (which only matches /admin/*)
  and duplicated the real admin at /admin. Removed entirely.
- Fix lib/seo.ts: baseUrl was hardcoded to cargoo.com — changed to
  cargooimport.eu to match every other URL in the codebase."

# Push.
git push
