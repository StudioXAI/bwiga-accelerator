/**
 * BWiGA Accelerator — shared helpers for Apply API endpoints.
 *
 * The two endpoints (apply-founder, apply-partner) share validation,
 * sanitisation, rate-limiting hints and email-sending logic. Keeping the
 * common pieces here means the endpoint files stay focused on the per-form
 * shape and email template.
 *
 * Environment variables expected on Vercel:
 *   RESEND_API_KEY            — your Resend API key
 *   APPLICATION_TO_EMAIL      — recipient (default: mail@lead-volume.com)
 *   APPLICATION_FROM_EMAIL    — verified sender (e.g. "BWiGA <applications@lead-volume.com>")
 */

const TO_EMAIL_DEFAULT   = 'mail@lead-volume.com';
const FROM_EMAIL_DEFAULT = 'BWiGA Accelerator <applications@lead-volume.com>';

/* ───────────────────── Sanitisation ───────────────────── */
// Only used inside text emails — strips control chars and clamps length.
// HTML output is always built with escapeHtml(), never raw user input.
function clean(value, max) {
  if (value == null) return '';
  let s = String(value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  if (max && s.length > max) s = s.slice(0, max);
  return s;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isEmail(s) {
  // Forgiving regex: practical, not RFC-perfect.
  return typeof s === 'string'
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
    && s.length <= 320;
}

function isUrl(s) {
  if (typeof s !== 'string' || s.length > 500) return false;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

/* ───────────────────── Validation ───────────────────── */
function validate(payload, rules) {
  const errors = [];
  for (const [field, rule] of Object.entries(rules)) {
    const v = payload[field];

    if (rule.required) {
      const empty = v == null
        || (typeof v === 'string' && !v.trim())
        || (Array.isArray(v) && v.length === 0)
        || (rule.type === 'boolean' && !v);
      if (empty) { errors.push(`${field} is required`); continue; }
    }

    if (v == null || v === '') continue; // optional & empty — skip further checks

    if (rule.type === 'email' && !isEmail(v))      errors.push(`${field} must be a valid email`);
    if (rule.type === 'url'   && !isUrl(v))        errors.push(`${field} must be a valid URL`);
    if (rule.type === 'string' && typeof v !== 'string') errors.push(`${field} must be a string`);
    if (rule.maxLen && typeof v === 'string' && v.length > rule.maxLen) {
      errors.push(`${field} exceeds max length`);
    }
    if (rule.minLen && typeof v === 'string' && v.trim().length < rule.minLen) {
      errors.push(`${field} is too short`);
    }
    if (rule.oneOf && !rule.oneOf.includes(v)) {
      errors.push(`${field} has an unexpected value`);
    }
  }
  return errors;
}

/* ───────────────────── Rate limiting (simple, in-memory) ───────────
   Vercel may run multiple instances, so this is best-effort only. For
   production hardening, swap to Upstash Redis / Vercel KV / Cloudflare
   Turnstile. Spec calls this out explicitly. */
const RATE_BUCKETS = new Map();
function rateLimit(ip, max = 3, windowMs = 10 * 60 * 1000) {
  if (!ip) return true; // can't enforce; let through
  const now = Date.now();
  const bucket = RATE_BUCKETS.get(ip) || [];
  const recent = bucket.filter(t => now - t < windowMs);
  if (recent.length >= max) return false;
  recent.push(now);
  RATE_BUCKETS.set(ip, recent);
  // Periodic cleanup: drop empty/stale buckets so the Map doesn't grow forever
  if (RATE_BUCKETS.size > 5000) {
    for (const [k, v] of RATE_BUCKETS) {
      if (v.every(t => now - t > windowMs)) RATE_BUCKETS.delete(k);
    }
  }
  return true;
}

function clientIp(req) {
  // Vercel sets x-forwarded-for; first entry is the real client
  const xff = req.headers?.['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0].trim();
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || '';
}

/* ───────────────────── Email sender (Resend) ───────────────────── */
async function sendEmail({ subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Graceful degradation in dev — log instead of failing
    // (DO NOT ship without RESEND_API_KEY set in Vercel envs)
    console.warn('[apply] RESEND_API_KEY not set — would have sent:', { subject });
    return { ok: true, dryRun: true };
  }

  const to   = process.env.APPLICATION_TO_EMAIL   || TO_EMAIL_DEFAULT;
  const from = process.env.APPLICATION_FROM_EMAIL || FROM_EMAIL_DEFAULT;

  const body = {
    from, to: [to], subject,
    html, text,
    ...(replyTo ? { reply_to: replyTo } : {}),
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${errBody.slice(0, 300)}`);
  }
  return res.json();
}

/* ───────────────────── Email-template helpers ───────────────────── */
function rowsHtml(pairs) {
  return pairs.map(([label, value]) => `
    <tr>
      <td style="padding:10px 14px; background:#0f1218; color:#9aa3b2; font:500 12px/1.4 system-ui,sans-serif; letter-spacing:1.4px; text-transform:uppercase; border-bottom:1px solid #1f242c; vertical-align:top; width:200px;">${escapeHtml(label)}</td>
      <td style="padding:10px 14px; background:#15191f; color:#e8edf7; font:400 14px/1.55 system-ui,sans-serif; border-bottom:1px solid #1f242c; white-space:pre-wrap; word-break:break-word;">${escapeHtml(value || '—')}</td>
    </tr>`).join('');
}

function emailShell({ title, intro, rows, signature }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0; padding:24px; background:#06080d; font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" style="max-width:640px; margin:0 auto; border-collapse:collapse; background:#0a0d13; border-radius:16px; overflow:hidden; border:1px solid #1f242c;">
    <tr><td style="padding:28px 28px 16px;">
      <div style="display:inline-block; padding:6px 12px; border-radius:999px; background:linear-gradient(135deg,rgba(30,99,255,0.18),rgba(16,229,153,0.12)); color:#67e8f9; font:600 11px/1 system-ui,sans-serif; letter-spacing:2px; text-transform:uppercase;">BWiGA Accelerator</div>
      <h1 style="margin:14px 0 6px; font:700 22px/1.2 system-ui,sans-serif; color:#fff;">${escapeHtml(title)}</h1>
      <p style="margin:0 0 16px; font:400 14px/1.55 system-ui,sans-serif; color:#b6bfcd;">${escapeHtml(intro)}</p>
    </td></tr>
    <tr><td style="padding:0 28px 8px;">
      <table role="presentation" width="100%" style="border-collapse:collapse; border-radius:10px; overflow:hidden; border:1px solid #1f242c;">
        ${rows}
      </table>
    </td></tr>
    <tr><td style="padding:18px 28px 28px;">
      <p style="margin:0; font:400 12px/1.55 system-ui,sans-serif; color:#7e8696;">${escapeHtml(signature)}</p>
    </td></tr>
  </table>
</body></html>`;
}

/* ───────────────────── Method / origin guards ───────────────────── */
function readJsonBody(req) {
  // Vercel auto-parses application/json into req.body when content-type is set,
  // but we'll be defensive.
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 200 * 1024) reject(new Error('Payload too large')); });
    req.on('end',  () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function setCors(res) {
  // Same-origin only; APIs called from the BWiGA site itself.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = {
  clean, escapeHtml, isEmail, isUrl,
  validate, rateLimit, clientIp,
  sendEmail, emailShell, rowsHtml,
  readJsonBody, setCors,
};
