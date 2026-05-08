# BWiGA Accelerator — Website

Premium accelerator website for **BWiGA Accelerator** — a Web3 & iGaming startup accelerator connecting selected founders with capital, visibility, ecosystem partners, strategic support and technology infrastructure.

> **Brand positioning.** BWiGA Accelerator is the operator and ecosystem brand. **INFI MultiChain** appears only as **Technology & Market Rails Partner** (a fully decentralized ecosystem) — never as accelerator operator, application owner, reviewer or gatekeeper. Apply forms, contact and ecosystem review belong to the BWiGA Accelerator team.

## Stack at a glance

- **100% static frontend** — plain HTML / CSS / vanilla JavaScript. No frameworks, no build step.
- **Serverless API** — two Vercel functions (`api/apply-founder.js`, `api/apply-partner.js`) handle form submissions and send structured emails via Resend.
- **Hosting** — Vercel (static + functions). Works equally well on Netlify / Cloudflare Pages with minor adjustments to the `api/` handlers.

## Pages

### Primary
| File | Purpose |
| --- | --- |
| `index.html` | Accelerator main page — Hero, What is BWiGA Accelerator, How It Works, Program Structure, Selection Criteria, Demo Day, Market Activation Thesis, FAQ |
| `for-founders.html` | Founder-focused journey & benefits |
| `investors.html` | Investors & Ecosystem Partners |
| `ai-tech-tracks.html` | AI-native tracks: Agents & Payments, Infrastructure & DePIN, RWA & Finance, Trust & Security, Market Automation |
| `market-rails.html` | Technology Partner layer (INFI MultiChain) — Launchpad, CDEX, SbSe Shield, InvertX, Synthetic RWA |
| `apply.html` | Combined Founder + Investor/Partner application forms (anchors: `#founder`, `#partners`, `#refer`) |

### "In Preparation" (premium placeholders, per BWiGA spec — never "Coming Soon")
`mentors-advisors.html` · `media-events.html` · `demo-day.html` · `partners.html` · `upcoming-cohort.html` · `insights.html` · `resources.html` · `newsletter.html` · `contact.html` · `book-intro-call.html`

### Legal (per FOOTER_BWiGA spec)
`legal-disclaimer.html` · `risk-disclaimer.html` · `privacy-policy.html` · `terms.html`

### System
`404.html` · `sitemap.xml` · `robots.txt`

## Folder structure

```
bwiga-accelerator/
├── api/
│   ├── _helpers.js              # Shared validation, email, rate-limit helpers
│   ├── apply-founder.js         # POST /api/apply-founder
│   └── apply-partner.js         # POST /api/apply-partner
├── assets/
│   ├── logo.svg                 # Master mark — transparent BG
│   ├── favicon.svg              # Optimised for tiny sizes
│   ├── logo.png                 # 512×512 transparent — header / OG
│   ├── apple-touch-icon.png     # 180×180 transparent
│   ├── favicon.png              # 48×48 transparent
│   ├── favicon-32x32.png        # 32×32 transparent
│   ├── favicon-16x16.png        # 16×16 transparent
│   ├── favicon.ico              # Multi-resolution (16/32/48)
│   └── og-image.png             # Open Graph 1200×630
├── build/
│   ├── render_logos.py          # Regenerates logo + favicon assets
│   ├── inject_footer.py         # Footer source-of-truth + injector
│   └── make_in_preparation_pages.py  # Generates placeholder pages
├── styles.css                   # Single stylesheet
├── script.js                    # Network canvas + scroll reveals
├── chat.js                      # In-browser BWiGA Assistant (knowledge base)
├── *.html                       # Pages (see above)
├── package.json                 # Engines: Node ≥18 (fetch, URL built-in)
├── vercel.json                  # Vercel routing + headers
├── sitemap.xml                  # SEO
├── robots.txt                   # Crawler directives
└── README.md                    # This file
```

## Forms — how submissions work

The Apply page contains two forms:

1. **Founder** — `POST /api/apply-founder`
   - JSON body: `founderName`, `email`, `projectName`, `website`, `category`, `currentStage`, `projectDescription`, `needsFromBwiga`, `links`, `consent`, plus `companyWebsiteHidden` (honeypot).
2. **Investor / Partner** — `POST /api/apply-partner`
   - JSON body: `fullName`, `email`, `company`, `websiteOrLinkedIn`, `currentActivity`, `collaborationInterest`, `shortIntroduction`, `whyCollaborateWithBwiga`, `relevantLinks`, `consent`, plus honeypot.

Both endpoints:
- **Validate** required fields, max-lengths, email & URL format
- **Rate-limit** by IP (3 requests / 10 min, in-memory; swap to Upstash Redis or Cloudflare Turnstile for hardening)
- **Reject honeypot fills silently** (returns 200 without sending — bots get false positives)
- **Send a structured email via Resend** to `mail@lead-volume.com`
- **Set Reply-To** to the applicant's email, so a reply from inbox goes back to them
- Return `200 { ok: true }` on success or `4xx { error, details? }` on validation failure

### Required environment variables (set on Vercel)

```
RESEND_API_KEY            = <your Resend API key>
APPLICATION_TO_EMAIL      = mail@lead-volume.com
APPLICATION_FROM_EMAIL    = BWiGA Accelerator <applications@lead-volume.com>
```

> The `APPLICATION_FROM_EMAIL` domain must be **verified inside Resend** before delivery will work. Until `bwiga.com` is verified, use a verified `lead-volume.com` sender.

If `RESEND_API_KEY` is absent, the API logs a warning and returns a successful "dry run" response — useful for local dev without an API key.

## Deploy to Vercel

```bash
# from repo root
npx vercel              # first deploy — link to project
npx vercel --prod       # production deploy
```

Or use the Vercel dashboard: import the GitHub repo, set the three env vars above, and deploy. No build command needed.

## Customisation

### Add the hero video
The hero on `index.html` ships with a placeholder. To activate the video:

```html
<!-- in index.html, replace the .video-placeholder block with: -->
<video src="assets/hero.mp4" autoplay muted loop playsinline></video>
```

Then drop `hero.mp4` (or `hero.webm`) into `/assets/`. Recommended: 16:9, ≤10 MB, muted, loops cleanly.

### Regenerate the logos / favicons
The mark is rendered programmatically (no SVG rasteriser dependency):

```bash
cd assets
python3 ../build/render_logos.py
```

All PNGs come out with **transparent backgrounds** and a blue → cyan → green gradient matching the BWiGA wordmark.

### Rebuild the footer everywhere
The footer is the same on every page. To update its content (links, CTA, risk note), edit the `FOOTER_HTML` block in `build/inject_footer.py`, then run:

```bash
python3 build/inject_footer.py
```

This regenerates the footer block in every existing HTML page in one pass.

### Add new "In Preparation" pages
Add an entry to the `PAGES` list in `build/make_in_preparation_pages.py`, then run it. New pages inherit the same shell (background, header, footer, branding).

## Brand & accessibility checklist

- ✅ All logos and favicons use **transparent PNG backgrounds**
- ✅ All form fields have proper `<label>`, `aria-*`, and required-field hints
- ✅ Honeypot anti-spam on both forms (no third-party CAPTCHA needed initially)
- ✅ Email validation, URL validation, character limits enforced **server-side**
- ✅ Mobile-first responsive — tested at 320 px, 720 px, 1024 px, 1440 px
- ✅ Footer matches the BWiGA spec exactly: top CTA bar → 5 columns → risk note → legal bar
- ✅ Background untouched from approved version (`bg-stage`, `bg-grid`, `bg-vignette`, `bg-grain`, `#network-canvas`)
- ✅ INFI MultiChain referenced **only** as Technology & Market Rails Partner (decentralized) — never as operator
- ✅ All emails point to `mail@lead-volume.com`
- ✅ Premium "In Preparation" pages (no "Coming Soon")

## Legal

BWiGA Accelerator does not provide financial, investment, legal, tax or regulatory advice. Nothing on this website guarantees acceptance, investment, fundraising, partnership, media access, event participation, listing, liquidity, returns or any specific outcome. All participation, investment and partnership decisions remain the sole responsibility of each participant.

© 2026 BWiGA. BWiGA Accelerator. All rights reserved.
