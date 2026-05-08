/**
 * POST /api/apply-founder
 *
 * Receives the Founder application form, validates against the BWiGA spec,
 * and sends a structured email to mail@lead-volume.com via Resend.
 *
 * Request body (JSON):
 *   founderName, email, projectName, website, category (str|str[]),
 *   currentStage, projectDescription, needsFromBwiga, links,
 *   consent (boolean), companyWebsiteHidden (honeypot)
 */
const {
  clean, escapeHtml, validate, rateLimit, clientIp,
  sendEmail, emailShell, rowsHtml,
  readJsonBody, setCors,
} = require('./_helpers.js');

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  // ─── Rate limit (per-IP, in-memory) ────────────────────────────────
  const ip = clientIp(req);
  if (!rateLimit(ip, 3, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many submissions. Please wait a few minutes.' });
  }

  // ─── Parse body ────────────────────────────────────────────────────
  let body;
  try { body = await readJsonBody(req); }
  catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }

  // ─── Honeypot — silently succeed without sending ───────────────────
  if (typeof body.companyWebsiteHidden === 'string' && body.companyWebsiteHidden.trim()) {
    return res.status(200).json({ ok: true });
  }

  // ─── Normalise + clean fields ──────────────────────────────────────
  const data = {
    founderName:        clean(body.founderName, 120),
    email:              clean(body.email, 180),
    projectName:        clean(body.projectName, 160),
    website:            clean(body.website, 300),
    category:           Array.isArray(body.category)
                          ? body.category.map(c => clean(c, 80)).filter(Boolean)
                          : clean(body.category, 200),
    currentStage:       clean(body.currentStage, 80),
    projectDescription: clean(body.projectDescription, 1500),
    needsFromBwiga:     clean(body.needsFromBwiga, 1500),
    links:              clean(body.links, 2000),
    consent:            body.consent === true || body.consent === 'true' || body.consent === 'on',
  };

  // ─── Validate ──────────────────────────────────────────────────────
  const errors = validate(data, {
    founderName:        { required: true, type: 'string',  minLen: 2, maxLen: 120 },
    email:              { required: true, type: 'email',   maxLen: 180 },
    projectName:        { required: true, type: 'string',  minLen: 1, maxLen: 160 },
    website:            { required: true, type: 'url',     maxLen: 300 },
    currentStage:       { required: true, type: 'string',  maxLen: 80 },
    projectDescription: { required: true, type: 'string',  minLen: 40, maxLen: 1500 },
    needsFromBwiga:     { required: true, type: 'string',  minLen: 20, maxLen: 1500 },
    links:              { required: true, type: 'string',  minLen: 10, maxLen: 2000 },
    consent:            { required: true, type: 'boolean' },
  });

  // category is required (string OR non-empty array)
  if (Array.isArray(data.category)
      ? data.category.length === 0
      : !data.category) {
    errors.push('category is required');
  }

  if (errors.length) {
    return res.status(400).json({ error: 'Please complete all required fields.', details: errors });
  }

  // ─── Build email ───────────────────────────────────────────────────
  const categoryDisplay = Array.isArray(data.category)
    ? data.category.join(', ')
    : data.category;

  const subject = `Founder Application — ${data.projectName}`.slice(0, 240);

  const html = emailShell({
    title: 'New Founder Application',
    intro: 'A new founder application has been submitted via BWiGA Accelerator.',
    rows: rowsHtml([
      ['Founder Name',       data.founderName],
      ['Email',              data.email],
      ['Project Name',       data.projectName],
      ['Website',            data.website],
      ['Category',           categoryDisplay],
      ['Current Stage',      data.currentStage],
      ['Project Description', data.projectDescription],
      ['What they need from BWiGA', data.needsFromBwiga],
      ['Links',              data.links],
      ['Consent',            'Confirmed — applicant attests information is accurate.'],
      ['Submitted from',     'BWiGA Accelerator — Apply as a Founder'],
      ['Submitted at',       new Date().toISOString()],
    ]),
    signature: 'Reply directly to this email to reach the applicant.',
  });

  const text = [
    'New Founder Application — BWiGA Accelerator',
    '',
    `Founder Name:  ${data.founderName}`,
    `Email:         ${data.email}`,
    `Project Name:  ${data.projectName}`,
    `Website:       ${data.website}`,
    `Category:      ${categoryDisplay}`,
    `Current Stage: ${data.currentStage}`,
    '',
    'Project Description:',
    data.projectDescription,
    '',
    'What they need from BWiGA:',
    data.needsFromBwiga,
    '',
    'Links / Pitch Deck / Demo / Socials:',
    data.links,
    '',
    'Consent: confirmed.',
    `Submitted: ${new Date().toISOString()}`,
  ].join('\n');

  // ─── Send ──────────────────────────────────────────────────────────
  try {
    await sendEmail({ subject, html, text, replyTo: data.email });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[apply-founder] sendEmail failed:', e.message);
    return res.status(502).json({ error: 'Email delivery failed. Please try again later.' });
  }
};
