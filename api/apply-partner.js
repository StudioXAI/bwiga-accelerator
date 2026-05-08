/**
 * POST /api/apply-partner
 *
 * Receives the Investor / Partner collaboration form. Same validation
 * pattern as apply-founder; different fields and email template.
 */
const {
  clean, validate, rateLimit, clientIp,
  sendEmail, emailShell, rowsHtml,
  readJsonBody, setCors,
} = require('./_helpers.js');

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const ip = clientIp(req);
  if (!rateLimit(ip, 3, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many submissions. Please wait a few minutes.' });
  }

  let body;
  try { body = await readJsonBody(req); }
  catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }

  if (typeof body.companyWebsiteHidden === 'string' && body.companyWebsiteHidden.trim()) {
    return res.status(200).json({ ok: true });
  }

  const data = {
    fullName:                clean(body.fullName, 120),
    email:                   clean(body.email, 180),
    company:                 clean(body.company, 180),
    websiteOrLinkedIn:       clean(body.websiteOrLinkedIn, 300),
    currentActivity:         clean(body.currentActivity, 80),
    collaborationInterest:   Array.isArray(body.collaborationInterest)
                                ? body.collaborationInterest.map(c => clean(c, 80)).filter(Boolean)
                                : clean(body.collaborationInterest, 200),
    shortIntroduction:       clean(body.shortIntroduction, 1000),
    whyCollaborateWithBwiga: clean(body.whyCollaborateWithBwiga, 1500),
    relevantLinks:           clean(body.relevantLinks, 2000),
    consent:                 body.consent === true || body.consent === 'true' || body.consent === 'on',
  };

  const errors = validate(data, {
    fullName:                { required: true, type: 'string', minLen: 2,  maxLen: 120 },
    email:                   { required: true, type: 'email',  maxLen: 180 },
    company:                 { required: true, type: 'string', minLen: 1,  maxLen: 180 },
    websiteOrLinkedIn:       { required: true, type: 'url',    maxLen: 300 },
    currentActivity:         { required: true, type: 'string', maxLen: 80 },
    shortIntroduction:       { required: true, type: 'string', minLen: 30, maxLen: 1000 },
    whyCollaborateWithBwiga: { required: true, type: 'string', minLen: 30, maxLen: 1500 },
    relevantLinks:           { required: false, type: 'string', maxLen: 2000 },
    consent:                 { required: true, type: 'boolean' },
  });

  if (Array.isArray(data.collaborationInterest)
      ? data.collaborationInterest.length === 0
      : !data.collaborationInterest) {
    errors.push('collaborationInterest is required');
  }

  if (errors.length) {
    return res.status(400).json({ error: 'Please complete all required fields.', details: errors });
  }

  const interestDisplay = Array.isArray(data.collaborationInterest)
    ? data.collaborationInterest.join(', ')
    : data.collaborationInterest;

  const subject = `Investor / Partner Request — ${data.company}`.slice(0, 240);

  const html = emailShell({
    title: 'New Investor / Partner Collaboration Request',
    intro: 'A new investor / partner collaboration request has been submitted via BWiGA Accelerator.',
    rows: rowsHtml([
      ['Full Name',                         data.fullName],
      ['Email',                             data.email],
      ['Company / Organization',            data.company],
      ['Website / LinkedIn',                data.websiteOrLinkedIn],
      ['Current Activity / Role',           data.currentActivity],
      ['Collaboration Interest',            interestDisplay],
      ['Short Introduction',                data.shortIntroduction],
      ['Why collaborate with BWiGA?',       data.whyCollaborateWithBwiga],
      ['Relevant Links',                    data.relevantLinks || '—'],
      ['Consent',                           'Confirmed — applicant attests information is accurate.'],
      ['Submitted from',                    'BWiGA Accelerator — Investors & Partners Application'],
      ['Submitted at',                      new Date().toISOString()],
    ]),
    signature: 'Reply directly to this email to reach the applicant.',
  });

  const text = [
    'New Investor / Partner Collaboration Request — BWiGA Accelerator',
    '',
    `Full Name:                ${data.fullName}`,
    `Email:                    ${data.email}`,
    `Company:                  ${data.company}`,
    `Website / LinkedIn:       ${data.websiteOrLinkedIn}`,
    `Role:                     ${data.currentActivity}`,
    `Collaboration interest:   ${interestDisplay}`,
    '',
    'Short introduction:',
    data.shortIntroduction,
    '',
    'Why collaborate with BWiGA?',
    data.whyCollaborateWithBwiga,
    '',
    'Relevant links:',
    data.relevantLinks || '—',
    '',
    'Consent: confirmed.',
    `Submitted: ${new Date().toISOString()}`,
  ].join('\n');

  try {
    await sendEmail({ subject, html, text, replyTo: data.email });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[apply-partner] sendEmail failed:', e.message);
    return res.status(502).json({ error: 'Email delivery failed. Please try again later.' });
  }
};
