/**
 * Google Search Console API client.
 *
 * GSC gives us full impressions / clicks / CTR / position per URL+query —
 * 10× more useful than the Custom Search API (which only tells you whether
 * a page is indexed and has a hard 100 queries/day cap).
 *
 * Setup steps (user-facing — documented in the final report):
 *   1. Google Cloud Console → enable "Search Console API"
 *   2. Create a service account, download the JSON key
 *   3. In Google Search Console → Settings → Users → add the service
 *      account's email with "Restricted" permission
 *   4. Paste the JSON (as a single line) into Cloudflare Pages env var
 *      GSC_SERVICE_ACCOUNT_JSON
 *   5. Set GSC_SITE_URL to either `sc-domain:cargooimport.eu` (Domain
 *      property) or `https://www.cargooimport.eu/` (URL-prefix property).
 *
 * If the env vars are missing this module returns `null` from
 * `getServiceAccountToken()` and callers should fall back to the legacy
 * Custom Search path.
 */

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

interface CachedToken { token: string; expiresAt: number; }
let _cached: CachedToken | null = null;

function parseServiceAccount(): ServiceAccount | null {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

function base64UrlEncode(input: string | Uint8Array): string {
  const b64 = typeof input === "string"
    ? Buffer.from(input, "utf-8").toString("base64")
    : Buffer.from(input).toString("base64");
  return b64.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Strip header/footer + whitespace, then base64-decode to DER
  const stripped = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(Buffer.from(stripped, "base64"));
  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

/**
 * Returns a 1-hour bearer token for the GSC API, or null if the service
 * account env var is missing/malformed. Token is cached in-process across
 * requests (Worker isolate lifetime, typically 5-30 minutes).
 */
export async function getServiceAccountToken(): Promise<string | null> {
  const sa = parseServiceAccount();
  if (!sa) return null;

  if (_cached && _cached.expiresAt > Date.now() + 60_000) {
    return _cached.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: sa.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const signingInput =
    base64UrlEncode(JSON.stringify(header)) + "." + base64UrlEncode(JSON.stringify(claim));

  const key = await importPrivateKey(sa.private_key);
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );
  const jwt = signingInput + "." + base64UrlEncode(new Uint8Array(sig));

  const tokenRes = await fetch(claim.aud, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    console.error("GSC token exchange failed:", await tokenRes.text());
    return null;
  }

  const body = (await tokenRes.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) return null;

  _cached = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return _cached.token;
}

export interface GscRow {
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date?: string;
}

/**
 * Run a Search Analytics query against the configured property.
 *
 * `dimensions` can be any combination of "query" | "page" | "date" | "country".
 *
 * `filterPage` matches by URL contains — pass the full canonical URL of a
 * blog post (e.g. `https://www.cargooimport.eu/en/blog/my-slug`) to get
 * per-page metrics, or omit to aggregate across the whole property.
 *
 * Returns an empty array (not null) if the API call fails, so callers can
 * `.length` it without null-guarding.
 */
export async function querySearchAnalytics(opts: {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  dimensions?: ("query" | "page" | "date" | "country")[];
  filterPage?: string;
  rowLimit?: number;
}): Promise<GscRow[]> {
  const token = await getServiceAccountToken();
  if (!token) return [];

  const site = process.env.GSC_SITE_URL;
  if (!site) {
    console.warn("GSC_SITE_URL not configured — falling back to no-op");
    return [];
  }

  const body: any = {
    startDate: opts.startDate,
    endDate: opts.endDate,
    dimensions: opts.dimensions ?? ["page"],
    rowLimit: opts.rowLimit ?? 100,
  };

  if (opts.filterPage) {
    body.dimensionFilterGroups = [
      {
        filters: [
          { dimension: "page", operator: "equals", expression: opts.filterPage },
        ],
      },
    ];
  }

  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    console.error("GSC searchAnalytics failed:", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as { rows?: any[] };
  if (!Array.isArray(data.rows)) return [];

  return data.rows.map(r => {
    const keys: string[] = Array.isArray(r.keys) ? r.keys : [];
    const dims = opts.dimensions ?? ["page"];
    const row: GscRow = {
      clicks: Number(r.clicks ?? 0),
      impressions: Number(r.impressions ?? 0),
      ctr: Number(r.ctr ?? 0),
      position: Number(r.position ?? 0),
    };
    dims.forEach((dim, i) => {
      (row as any)[dim] = keys[i];
    });
    return row;
  });
}
