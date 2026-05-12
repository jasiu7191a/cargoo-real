#!/usr/bin/env node
/**
 * One-shot cleanup of a test article left behind by an auth-verification
 * run against /api/agent/trigger (id: cmp2x3x180000xarkwvrrfniy, slug
 * en-test-auth-check-no-publish). Going forward, that endpoint accepts
 * `?dryRun=true` / `{ "dryRun": true }` so this kind of artifact shouldn't
 * recur — this script exists purely to undo the one that already shipped.
 *
 * Written as .mjs (not .ts) to match scripts/sync-email-templates.mjs and
 * stay runnable without installing tsx. PrismaClient is fine to import
 * from JS — the generated client ships its own JS entry.
 *
 * Usage:
 *   # Dry-run — fetch & print the row, no deletion:
 *   node scripts/cleanup-test-article.mjs
 *
 *   # Actually delete:
 *   node scripts/cleanup-test-article.mjs --confirm
 *
 * Requires DATABASE_URL in env (export it before running, or use a .env
 * loader). Delete this file from the repo after you've run it successfully.
 */
import { PrismaClient } from "@prisma/client";

const ARTICLE_ID = "cmp2x3x180000xarkwvrrfniy";
const confirm = process.argv.includes("--confirm");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Export it first, e.g.:");
  console.error('  export DATABASE_URL="postgres://..."   # bash/zsh');
  console.error('  $env:DATABASE_URL="postgres://..."     # PowerShell');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const post = await prisma.blogPost.findUnique({ where: { id: ARTICLE_ID } });

  if (!post) {
    console.log(`No BlogPost found with id=${ARTICLE_ID}. Already deleted?`);
    process.exit(0);
  }

  console.log("Found article:");
  console.log({
    id: post.id,
    slug: post.slug,
    title: post.title,
    lang: post.lang,
    status: post.status,
    targetKeyword: post.targetKeyword,
    publishedAt: post.publishedAt,
    metaDescription: post.metaDescription,
    contentPreview: (post.content ?? "").slice(0, 300) + (post.content && post.content.length > 300 ? "…" : ""),
  });

  if (!confirm) {
    console.log("\nDry run only. Re-run with --confirm to delete:");
    console.log("  node scripts/cleanup-test-article.mjs --confirm");
    process.exit(0);
  }

  await prisma.blogPost.delete({ where: { id: ARTICLE_ID } });
  console.log(`\nDeleted BlogPost ${ARTICLE_ID}.`);
} catch (err) {
  console.error("Cleanup failed:", err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
