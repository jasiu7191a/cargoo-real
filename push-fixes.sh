#!/usr/bin/env bash
# One-shot script to commit and push the 4 build-fix edits.
# Run from the cargoo-real-fixed folder: bash push-fixes.sh
set -e

# Clear the stale lock left behind by the Cowork sandbox (safe — nothing else is writing).
rm -f .git/index.lock

# Stage only the 4 fixed files (not the untracked cargoo-official/).
git add package.json "app/[lang]/blog/page.tsx" components/PricingCalculator.tsx app/globals.css

# Show what's about to be committed for sanity.
echo "--- staged ---"
git diff --cached --stat

# Commit.
git commit -m "fix: resolve build errors blocking deploy

- Add missing jose dependency (used in middleware, session, auth/login, probe)
- Remove inline onMouseEnter/onMouseLeave from blog index server component; replace with CSS :hover via new .blog-card-link class
- Widen PricingCalculator handleSubmit event type to React.SyntheticEvent so <Button onClick={...}> type-checks under strict mode"

# Push.
git push
