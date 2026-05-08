"""
Generate premium 'In Preparation' / placeholder pages for every footer link
that doesn't yet have a real page. Per the BWiGA FOOTER spec:
  - Don't use 'Coming Soon'
  - Use 'In Preparation', 'Private Access Format', etc.
  - Premium look, contact CTA, back to home, full footer.
"""
from pathlib import Path
import re

ROOT = Path(__file__).parent.parent  # /home/claude/work/bwiga-accelerator

# (slug, title, status_label, eyebrow, body, supplementary)
PAGES = [
    # Ecosystem column
    ("mentors-advisors",
     "Mentors & Advisors",
     "Network in Preparation",
     "Ecosystem",
     "BWiGA's mentor and advisor network connects selected founders with experienced operators, investors, technologists, security partners and growth specialists across Web3, iGaming, AI, RWA, DePIN and digital markets.",
     "Mentor profiles, application paths and advisor onboarding will be opened in a structured format. Until then, you can reach out directly to discuss inclusion."),

    ("media-events",
     "Media & Events",
     "Strategic Visibility",
     "Ecosystem",
     "Through LeadVolume media expertise and BWiGA's access to selected Web3, iGaming and business event ecosystems, high-potential projects may access founder showcases, panels, pitch sessions, interviews and investor-facing visibility.",
     "Detailed media slots, event calendars and partner showcase formats are being prepared. Reach out for current opportunities."),

    ("demo-day",
     "Demo Day",
     "Private Access Format",
     "Ecosystem",
     "Demo Day is a curated visibility format designed to connect selected accelerator founders with relevant investors, partners, advisors, media and ecosystem participants. It is not a public pitch event — it is structured access.",
     "Upcoming Demo Day windows, pitch slot allocation and investor invitations are coordinated directly with selected projects and accredited investor partners."),

    ("partners",
     "Partners",
     "Strategic Ecosystem",
     "Ecosystem",
     "BWiGA Accelerator works with media, event, investor, advisory, security, growth, infrastructure and technology partners — including INFI MultiChain (a fully decentralized ecosystem) as Technology & Market Rails Partner where relevant.",
     "Partner profiles, joint formats and ecosystem credits are being prepared. Until then, partnership inquiries are reviewed directly by the BWiGA Accelerator team."),

    ("upcoming-cohort",
     "Upcoming Cohort",
     "Cohort In Preparation",
     "Ecosystem",
     "BWiGA Accelerator runs cohort-based, curated batches of selected founders. Each cohort is shaped around current ecosystem opportunities and partner availability — Web3, iGaming, AI, fintech, RWA, DePIN and infrastructure.",
     "Application timelines, selection windows and cohort dates will be announced. Founders ready to apply can submit at any time — strong applications are reviewed continuously."),

    # Resources column
    ("insights",
     "Insights",
     "Research Hub",
     "Resources",
     "Strategic insights, market analysis and ecosystem perspectives from the BWiGA Accelerator team — covering Web3, iGaming, AI x markets, RWA, DePIN, fintech and the infrastructure shaping the next cycle.",
     "The Insights hub is being prepared. Two anchor pieces are coming first: <em>Market Readiness Thesis</em> and <em>AI &times; Web3 Thesis</em>."),

    ("resources",
     "Founder Resources",
     "Founder Library",
     "Resources",
     "A curated library of practical resources for founders preparing for fundraising, launch, market entry, investor conversations, media visibility and partner access — built around real moments where early-stage projects usually struggle.",
     "Templates, checklists, founder guides and ecosystem playbooks are being prepared. Selected accelerator founders receive hands-on access first."),

    ("newsletter",
     "Newsletter",
     "Subscription In Preparation",
     "Resources",
     "Periodic ecosystem updates from BWiGA Accelerator — selected founder spotlights, ecosystem moves, market readiness insights and event announcements. No noise. No daily blasts.",
     "The newsletter signup is being finalized. To be notified, email <a href=\"mailto:mail@lead-volume.com?subject=BWiGA Newsletter — Notify me\" style=\"color:var(--cyan-soft);\">mail@lead-volume.com</a> with the subject line \"Newsletter — Notify me\"."),

    # Contact + book a call (top-of-funnel)
    ("contact",
     "Contact",
     "Direct Channel",
     "Connect",
     "Reach the BWiGA Accelerator team directly. We respond personally to founder, investor, partner, media and ecosystem inquiries — typically within 5 business days.",
     "Email us at <a href=\"mailto:mail@lead-volume.com\" style=\"color:var(--cyan-soft); font-weight:600;\">mail@lead-volume.com</a>. For applications, please use the <a href=\"apply.html\" style=\"color:var(--cyan-soft);\">Apply page</a> for a structured submission."),

    ("book-intro-call",
     "Book an Intro Call",
     "Calendar In Preparation",
     "Connect",
     "Schedule a 20–30 minute introduction call with the BWiGA Accelerator team to discuss your project, investment access, partnership opportunities or ecosystem collaboration.",
     "Direct Calendly booking will be available shortly. To request a call now, email <a href=\"mailto:mail@lead-volume.com?subject=BWiGA — Intro Call Request\" style=\"color:var(--cyan-soft);\">mail@lead-volume.com</a> with your role, company and a one-line context — we'll send a slot."),

    # Legal column
    ("legal-disclaimer",
     "Legal Disclaimer",
     "Legal",
     "Legal",
     "BWiGA Accelerator is a curated ecosystem and startup acceleration initiative. It does not provide financial, investment, legal, tax or regulatory advice.",
     """<p style="margin-bottom: 16px;">Information published by BWiGA Accelerator is for general informational purposes only. Nothing on this website should be construed as financial, legal, tax, accounting, investment, regulatory or any other form of professional advice. Readers should consult qualified professionals before making any decision based on the content of this website.</p>
     <p style="margin-bottom: 16px;">Submission of an application or expression of interest does not create any contractual relationship or guarantee of acceptance, investment, fundraising, partnership, listing, liquidity, returns or any specific outcome.</p>
     <p style="margin-bottom: 16px;">Technology partners — including INFI MultiChain (a fully decentralized ecosystem) — may participate as Technology &amp; Market Rails Partner where relevant. They do not operate the accelerator, do not own or control applications, and are not responsible for selection, review or BWiGA editorial content.</p>
     <p>This page is being formalized into a complete legal disclaimer document. For specific legal questions, contact <a href="mailto:mail@lead-volume.com" style="color:var(--cyan-soft);">mail@lead-volume.com</a>.</p>"""),

    ("risk-disclaimer",
     "Risk Disclaimer",
     "Legal",
     "Legal",
     "Early-stage Web3, iGaming, AI, RWA, DePIN, fintech and infrastructure projects are inherently high-risk. Participation in the BWiGA Accelerator ecosystem does not reduce, hedge or guarantee against any of these risks.",
     """<p style="margin-bottom: 16px;">Risks include but are not limited to: lack of demand, weak traction, low user adoption, technology failures, smart contract risk, market volatility, liquidity risk, regulatory uncertainty, execution risk, poor tokenomics, weak community, founder risk, macroeconomic conditions and AI / RWA / DePIN-specific business risks.</p>
     <p style="margin-bottom: 16px;">Technology partner infrastructure — where used — is designed to support a more structured launch, listing, protected trading and liquidity strategy, but cannot replace real demand, strong execution, a quality product or long-term market adoption.</p>
     <p style="margin-bottom: 16px;">All investment, partnership and participation decisions remain the sole responsibility of each participant. Always do your own research and consult professional advisors.</p>
     <p>This page is being formalized into a complete risk disclaimer document. Contact <a href="mailto:mail@lead-volume.com" style="color:var(--cyan-soft);">mail@lead-volume.com</a> for specific risk questions.</p>"""),

    ("privacy-policy",
     "Privacy Policy",
     "Legal",
     "Legal",
     "BWiGA Accelerator respects your privacy. Information submitted via application forms is used solely to review your project, partnership or collaboration request — not sold, rented or shared with third parties for marketing purposes.",
     """<p style="margin-bottom: 16px;"><strong>What we collect.</strong> Form submissions (founder applications, investor / partner requests), email correspondence and standard server logs (IP, user-agent, request timestamps for rate-limiting and security).</p>
     <p style="margin-bottom: 16px;"><strong>Why we collect it.</strong> To review your application or inquiry, contact you, prevent abuse, and operate the website.</p>
     <p style="margin-bottom: 16px;"><strong>Where it's stored.</strong> Application submissions are sent as email to the BWiGA Accelerator team via Resend (transactional email provider). Hosting is on Vercel.</p>
     <p style="margin-bottom: 16px;"><strong>Your rights.</strong> You may request access, correction or deletion of your personal data by emailing <a href="mailto:mail@lead-volume.com" style="color:var(--cyan-soft);">mail@lead-volume.com</a>.</p>
     <p>This page is being formalized into a full GDPR-compliant Privacy Policy. For specific privacy questions, contact <a href="mailto:mail@lead-volume.com" style="color:var(--cyan-soft);">mail@lead-volume.com</a>.</p>"""),

    ("terms",
     "Terms of Use",
     "Legal",
     "Legal",
     "By accessing this website or submitting any application, you agree to use the site responsibly, provide accurate information and acknowledge that BWiGA Accelerator does not guarantee any specific outcome from your participation.",
     """<p style="margin-bottom: 16px;"><strong>Eligibility.</strong> You must be legally permitted to enter into agreements in your jurisdiction. Submissions may be reviewed for compliance with local regulations.</p>
     <p style="margin-bottom: 16px;"><strong>Accuracy.</strong> You agree to submit accurate, current and complete information, and to update it as needed.</p>
     <p style="margin-bottom: 16px;"><strong>No guarantees.</strong> Submission does not guarantee acceptance, investment, fundraising, partnership, media access, event participation, listing, liquidity, returns or any specific outcome.</p>
     <p style="margin-bottom: 16px;"><strong>Intellectual property.</strong> All content on this website (text, design, logos, graphics) is the property of BWiGA or its licensors and may not be reproduced without written permission. The BWiGA mark and brand are owned by BWiGA.</p>
     <p style="margin-bottom: 16px;"><strong>Limitation of liability.</strong> BWiGA, its team and partners are not liable for any direct, indirect, incidental, special, consequential or punitive damages arising from your use of this website or participation in any program.</p>
     <p>This page is being formalized into full Terms of Use. Contact <a href="mailto:mail@lead-volume.com" style="color:var(--cyan-soft);">mail@lead-volume.com</a> for specific questions.</p>"""),
]


def render_page(slug, title, status_label, eyebrow, body, supplementary):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title} — BWiGA Accelerator</title>
<meta name="description" content="{title} — BWiGA Accelerator. {body[:140]}" />
<meta name="robots" content="noindex, follow" />
<meta name="author" content="BWiGA Accelerator" />
<link rel="canonical" href="https://bwiga-accelerator.vercel.app/{slug}.html" />

<!-- Favicons (transparent BG) -->
<link rel="icon" type="image/x-icon" href="assets/favicon.ico" />
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png" />
<meta name="theme-color" content="#030508" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="styles.css" />

<style>
  /* In-Preparation page-specific styles */
  .prep-wrap {{
    max-width: 760px;
    margin: 0 auto;
    padding: 160px var(--gutter) 100px;
    text-align: center;
  }}
  .prep-eyebrow {{
    display: inline-flex; align-items: center; gap: 10px;
    padding: 8px 18px;
    background: rgba(34, 211, 238, 0.06);
    border: 1px solid var(--border-cyan);
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--cyan-soft);
    margin-bottom: 32px;
  }}
  .prep-eyebrow::before {{
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 10px var(--cyan);
    animation: prep-pulse 2s ease-in-out infinite;
  }}
  @keyframes prep-pulse {{ 0%, 100% {{ opacity: 1; }} 50% {{ opacity: 0.4; }} }}

  .prep-status {{
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--gold-soft);
    margin-bottom: 14px;
  }}
  .prep-wrap h1 {{
    font-family: var(--font-display);
    font-size: clamp(40px, 5vw, 64px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.025em;
    margin-bottom: 24px;
  }}
  .prep-wrap h1 .accent {{
    background: linear-gradient(135deg, var(--gold-soft) 0%, var(--cyan) 60%, #10e599 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }}
  .prep-body {{
    font-size: 17px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 28px;
  }}
  .prep-supplementary {{
    font-size: 15px;
    color: var(--text-tertiary);
    line-height: 1.7;
    text-align: left;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px 28px;
    margin: 0 auto 40px;
    max-width: 640px;
  }}
  .prep-actions {{
    display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
    margin-top: 8px;
  }}
  .back-link {{
    display: inline-flex; align-items: center; gap: 6px;
    color: var(--text-tertiary); font-size: 13px;
    margin-bottom: 32px; transition: color 0.2s;
  }}
  .back-link:hover {{ color: var(--gold); }}
</style>
</head>
<body>

<div class="bg-stage" aria-hidden="true">
  <canvas id="network-canvas"></canvas>
  <div class="bg-grid"></div>
  <div class="bg-vignette"></div>
  <div class="bg-grain"></div>
</div>

<!-- ===== Header ===== -->
<header class="site-header">
  <div class="header-inner">
    <a href="index.html" class="logo" aria-label="BWiGA Accelerator home">
      <img src="assets/logo-wordmark.png" alt="BWiGA Accelerator" class="logo-wordmark-img" />
    </a>
    <nav class="main-nav" aria-label="Primary">
      <a href="index.html" class="nav-link">Accelerator</a>
      <a href="for-founders.html" class="nav-link">For Founders</a>
      <a href="investors.html" class="nav-link">Investors &amp; Partners</a>
      <a href="ai-tech-tracks.html" class="nav-link">AI Tech Tracks</a>
    </nav>
    <a href="apply.html" class="btn btn-primary apply-cta-header">
      Apply
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
    </a>
  </div>
</header>

<main class="container">
  <div class="prep-wrap">
    <a href="index.html" class="back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Back to Accelerator
    </a>

    <div class="prep-eyebrow">{eyebrow}</div>
    <div class="prep-status">{status_label}</div>
    <h1>{title.replace('&', 'and')}<br /><span class="accent">in preparation.</span></h1>
    <p class="prep-body">{body}</p>

    <div class="prep-supplementary">{supplementary}</div>

    <div class="prep-actions">
      <a href="mailto:mail@lead-volume.com?subject=BWiGA — {title}" class="btn btn-primary">
        Contact BWiGA Accelerator
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </a>
      <a href="index.html" class="btn btn-secondary">Back to Home</a>
    </div>
  </div>
</main>

<script src="script.js"></script>
'''


# Load the canonical footer markup from inject_footer.py
inject_path = ROOT / 'build' / 'inject_footer.py'
inject_text = inject_path.read_text(encoding='utf-8')
m = re.search(r"FOOTER_HTML\s*=\s*'''(.*?)'''", inject_text, re.DOTALL)
FOOTER_HTML = m.group(1)


def make_full_page(slug, title, status_label, eyebrow, body, supplementary):
    return render_page(slug, title, status_label, eyebrow, body, supplementary) \
        + '\n' + FOOTER_HTML + '\n\n</body>\n</html>\n'


written, skipped = 0, 0
for slug, title, status, eyebrow, body, supp in PAGES:
    out = ROOT / f'{slug}.html'
    if out.exists() and slug not in {p[0] for p in PAGES}:
        skipped += 1
        continue
    out.write_text(make_full_page(slug, title, status, eyebrow, body, supp), encoding='utf-8')
    written += 1
    print(f"  ✔ {slug}.html")

print(f"\nWrote {written} 'In Preparation' pages, skipped {skipped}.")
