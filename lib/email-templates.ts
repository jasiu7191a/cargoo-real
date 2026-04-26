/**
 * Branded HTML email templates for Cargoo cold outreach.
 *
 * Each template contains two placeholders:
 *   {{BODY}}      — replaced with the email body <p> tags
 *   {{UNSUB_URL}} — replaced with the signed unsubscribe URL
 *
 * sendColdEmail() in mail.ts handles both substitutions automatically,
 * so the agent only needs to send the plain <p> body content as bodyHtml.
 */

const HEADER = (badge: string, homeUrl: string) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050505;padding:40px 16px 48px;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <tr>
        <td style="background-color:#0a0a0a;padding:26px 32px 22px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="vertical-align:middle;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="vertical-align:top;padding-right:12px;">
                  <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td width="40" height="40" style="width:40px;height:40px;background:linear-gradient(135deg,#ff5500,#ff7733);border-radius:10px;text-align:center;font-size:22px;font-weight:900;color:#ffffff;font-family:Arial,Helvetica,sans-serif;line-height:40px;">C</td>
                  </tr></table>
                </td>
                <td style="vertical-align:middle;">
                  <a href="${homeUrl}" style="color:#ffffff;font-size:17px;font-weight:800;letter-spacing:-0.4px;display:block;line-height:1.15;text-decoration:none;">Cargoo Import</a>
                  <span style="color:#64748b;font-size:11px;font-weight:500;display:block;margin-top:2px;letter-spacing:0.2px;">cargooimport.eu</span>
                </td>
              </tr></table>
            </td>
            <td align="right" style="vertical-align:middle;">
              <span style="background:rgba(255,85,0,0.12);color:#ff5500;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:5px 11px;border-radius:100px;border:1px solid rgba(255,85,0,0.25);white-space:nowrap;">${badge}</span>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr><td style="background:linear-gradient(90deg,#ff5500 0%,#ff7733 35%,#2962ff 100%);height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr>
        <td style="background-color:#111111;padding:34px 32px 30px;font-size:15px;line-height:1.75;color:#e2e8f0;">
          {{BODY}}
        </td>
      </tr>`;

const FOOTER_ROW = (pillars: string, footerLine1: string, footerLine2: string) => `
      <tr>
        <td style="background-color:#0d0d0d;border-top:1px solid rgba(255,255,255,0.06);padding:16px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            ${pillars}
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#050505;border-top:1px solid rgba(255,255,255,0.06);padding:18px 32px 20px;">
          <p style="margin:0 0 4px;font-size:12px;line-height:1.6;color:#475569;">${footerLine1}</p>
          <p style="margin:0;font-size:11px;line-height:1.6;color:#334155;">${footerLine2}</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`;

const PILLAR = (bg: string, color: string, text: string) =>
  `<td align="center" style="padding:4px 8px;"><span style="background:${bg};color:${color};font-size:12px;font-weight:700;padding:5px 10px;border-radius:6px;white-space:nowrap;display:inline-block;">${text}</span></td>`;

const DIVIDER = `<td width="1" style="background:rgba(255,255,255,0.06);">&nbsp;</td>`;

export const emailTemplates: Record<string, string> = {
  en: HEADER("Import Agent", "https://www.cargooimport.eu") +
    FOOTER_ROW(
      PILLAR("rgba(255,85,0,0.1)", "#ff5500", "&#127981; Factory Direct") + DIVIDER +
      PILLAR("rgba(41,98,255,0.1)", "#5281ff", "&#128269; Quality Inspection") + DIVIDER +
      PILLAR("rgba(255,85,0,0.1)", "#ff5500", "&#128230; Full Landed Cost"),
      `<a href="https://www.cargooimport.eu" style="color:#ff5500;text-decoration:none;font-weight:700;">cargooimport.eu</a>&nbsp;&middot;&nbsp;<span style="color:#475569;">EU&ndash;China Sourcing &amp; Logistics</span>`,
      `You're receiving this because we believe your business could benefit from direct China sourcing. <a href="{{UNSUB_URL}}" style="color:#475569;text-decoration:underline;">Unsubscribe</a>`
    ),

  de: HEADER("Import-Agent", "https://www.cargooimport.eu/cargoo-de/") +
    FOOTER_ROW(
      PILLAR("rgba(255,85,0,0.1)", "#ff5500", "&#127981; Direkt ab Werk") + DIVIDER +
      PILLAR("rgba(41,98,255,0.1)", "#5281ff", "&#128269; Qualit&auml;tskontrolle") + DIVIDER +
      PILLAR("rgba(255,85,0,0.1)", "#ff5500", "&#128230; Landed-Cost-Kalkulation"),
      `<a href="https://www.cargooimport.eu/cargoo-de/" style="color:#ff5500;text-decoration:none;font-weight:700;">cargooimport.eu</a>&nbsp;&middot;&nbsp;<span style="color:#475569;">EU&ndash;China-Beschaffung &amp; Logistik</span>`,
      `Sie erhalten diese Nachricht, weil wir glauben, dass Ihr Unternehmen vom Direktimport aus China profitieren k&ouml;nnte. <a href="{{UNSUB_URL}}" style="color:#475569;text-decoration:underline;">Abmelden</a>`
    ),

  pl: HEADER("Agent Importowy", "https://www.cargooimport.eu/cargoo-pl/") +
    FOOTER_ROW(
      PILLAR("rgba(255,85,0,0.1)", "#ff5500", "&#127981; Z fabryki") + DIVIDER +
      PILLAR("rgba(41,98,255,0.1)", "#5281ff", "&#128269; Kontrola jako&#347;ci") + DIVIDER +
      PILLAR("rgba(255,85,0,0.1)", "#ff5500", "&#128230; Pe&#322;ny kosztorys"),
      `<a href="https://www.cargooimport.eu/cargoo-pl/" style="color:#ff5500;text-decoration:none;font-weight:700;">cargooimport.eu</a>&nbsp;&middot;&nbsp;<span style="color:#475569;">Sourcing i logistyka EU&ndash;Chiny</span>`,
      `Piszemy, bo uwa&#380;amy, &#380;e Twoja firma mog&#322;aby skorzysta&#263; na bezpo&#347;rednim imporcie z Chin. <a href="{{UNSUB_URL}}" style="color:#475569;text-decoration:underline;">Wypisz si&#281;</a>`
    ),

  fr: HEADER("Agent d'Import", "https://www.cargooimport.eu/cargoo-fr/") +
    FOOTER_ROW(
      PILLAR("rgba(255,85,0,0.1)", "#ff5500", "&#127981; Direct usine") + DIVIDER +
      PILLAR("rgba(41,98,255,0.1)", "#5281ff", "&#128269; Contr&ocirc;le qualit&eacute;") + DIVIDER +
      PILLAR("rgba(255,85,0,0.1)", "#ff5500", "&#128230; Co&ucirc;t total inclus"),
      `<a href="https://www.cargooimport.eu/cargoo-fr/" style="color:#ff5500;text-decoration:none;font-weight:700;">cargooimport.eu</a>&nbsp;&middot;&nbsp;<span style="color:#475569;">Sourcing et logistique EU&ndash;Chine</span>`,
      `Vous recevez ce message car nous pensons que votre activit&eacute; pourrait b&eacute;n&eacute;ficier de l'importation directe depuis la Chine. <a href="{{UNSUB_URL}}" style="color:#475569;text-decoration:underline;">Se d&eacute;sabonner</a>`
    ),
};

/**
 * Returns a complete HTML email document for the given language,
 * with {{BODY}} and {{UNSUB_URL}} placeholders ready for substitution.
 * Falls back to English if the requested language is not available.
 */
export function getEmailTemplate(lang: string): string {
  const template = emailTemplates[lang] ?? emailTemplates.en;
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#050505;">
${template}
</body>
</html>`;
}
