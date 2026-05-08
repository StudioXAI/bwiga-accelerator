# BWiGA Accelerator — Backup Snapshot

**Snapshot date:** 2026-05-08
**Branch:** `main`
**Repository:** `https://github.com/StudioXAI/bwiga-accelerator`
**Production URL:** `https://bwiga-accelerator.vercel.app/`

This is a complete, deploy-ready backup of the BWiGA Accelerator website at this moment in time. Every file needed for production is included.

## What's in this snapshot

### Pages — 21 HTML files

**Primary**
- `index.html` — Accelerator landing page with hero video theater mode
- `for-founders.html` — Founder journey & benefits
- `investors.html` — Investors & ecosystem partners
- `ai-tech-tracks.html` — AI-native tracks
- `market-rails.html` — INFI MultiChain technology partner layer
- `apply.html` — Founder + Investor/Partner application forms (tabs at `#founder` / `#partners` / `#refer`)

**In Preparation (premium placeholders, never "Coming Soon")**
- mentors-advisors · media-events · demo-day · partners · upcoming-cohort
- insights · resources · newsletter
- contact · book-intro-call

**Legal**
- legal-disclaimer · risk-disclaimer · privacy-policy · terms

**System**
- 404.html · sitemap.xml · robots.txt

### Backend — `/api/`
- `api/_helpers.js` — Shared validation, Resend email sender, rate-limiting, HTML escape
- `api/apply-founder.js` — `POST /api/apply-founder`
- `api/apply-partner.js` — `POST /api/apply-partner`

Both endpoints validate, rate-limit (3/IP/10min), reject honeypots silently, send structured email via Resend with Reply-To set to applicant.

### Assets — `/assets/` (all transparent backgrounds)
- `logo.svg` / `logo.png` — B+sparkle mark (used in favicons, OG card, chat widget)
- `logo-wordmark.png` — Full BWiGA + ACCELERATOR wordmark (used in headers and footers)
- `leadvolume-wordmark.png` — LeadVolume logo (Media Partner badge in header, Powered-by in footer)
- `favicon.svg` / `favicon.ico` / `favicon-16x16.png` / `favicon-32x32.png` / `favicon.png` / `apple-touch-icon.png`
- `og-image.png` — 1200×630 Open Graph card (BWiGA branded)

### Build scripts — `/build/` (regenerate assets if needed)
- `render_logos.py` — Regenerate every favicon size from primitives
- `render_og.py` — Regenerate the OG card
- `process_wordmark.py` — Process BWiGA wordmark JPG → transparent PNG
- `process_leadvolume.py` — Process LeadVolume JPG → transparent PNG
- `inject_footer.py` — Single source of truth for footer markup (re-injects to every page)
- `inject_leadvolume_header.py` — Inject LeadVolume "Media Partner" badge in headers
- `swap_logos.py` — Swap mark+text logo blocks for the new wordmark image
- `make_in_preparation_pages.py` — Generate more premium placeholder pages

### Configuration
- `package.json` — Engines: Node ≥18, zero dependencies
- `vercel.json` — Clean URLs, security headers, immutable asset caching, no explicit runtime (auto-detect)
- `.gitignore` — Excludes editor files, `.vercel/`, `.env*`, `node_modules/`
- `.nojekyll` — Blocks Jekyll processing on alternative hosts

## Brand & SEO state

### BWiGA positioning
- BWiGA Accelerator is the **operator and ecosystem brand**
- INFI MultiChain appears **only** as "Technology & Market Rails Partner" (decentralized)
- Audit confirmed: **0 standalone INFI mentions** anywhere in code, content, or meta tags

### SEO
- Every primary page has full Open Graph + Twitter Card meta
- `og:image` URLs include `?v=2` cache-buster (forces social platforms to re-scrape)
- `twitter:site="@bwiga2026"` and `twitter:creator="@bwiga2026"` on all primary pages
- Canonical URLs all point to `https://bwiga-accelerator.vercel.app/<page>`
- `og:site_name = "BWiGA Accelerator"`
- `theme-color = "#030508"`
- JSON-LD structured data updated for BWiGA on relevant pages

## Recent feature additions (in this snapshot)

1. **Click-to-expand hero video** (theater mode)
   - YouTube video `lYH-xv6glKM`, starts at t=4s
   - Poster shows the video thumbnail until clicked, so iframe doesn't load on initial page render
   - Clicking opens a fullscreen-style overlay with a "Press Esc to close" hint
   - ESC key, close button, OR click on backdrop all close
   - On close, iframe is destroyed (so the video actually stops, not just hides)
   - Body scroll is locked while open
   - Honours `prefers-reduced-motion`

2. **BWiGA wordmark in every header and footer**
   - Replaces the older `<span>BWiGA</span><span>Accelerator</span>` text-based lockup
   - Single transparent PNG asset, scales 28px–44px depending on placement and viewport

3. **LeadVolume "Media Partner" badge**
   - Pill-style badge in every header right side (between nav and Apply button)
   - "Powered by LeadVolume" badge in every footer above the risk note
   - Both link to `https://www.youtube.com/@leadvolume6838`
   - Badge label hides below 1180px, whole badge hides below 720px on mobile

4. **All buttons in BWiGA palette**
   - `.btn-primary`: Blue → cyan → green gradient (`#1e63ff → #22d3ee → #10e599`) with deep navy text (`#00111f`) for max contrast
   - `.btn-secondary`: Subtle dark surface, BWiGA cyan border on hover
   - `.btn-ghost`: Cyan accent on transparent background
   - `.apply-btn` in header: Cyan accent (was previously gold)

5. **Real social URLs in footer**
   - Website: `https://bwiga.com/`
   - X / Twitter: `https://x.com/bwiga2026?s=21`
   - LinkedIn: `https://www.linkedin.com/company/bwiga/posts/?feedView=all`
   - Telegram: `https://t.me/bwiga2026`
   - YouTube: `https://www.youtube.com/@leadvolume6838`
   - Instagram: `https://www.instagram.com/bwiga2026?igsh=cnVkb2p0YmJscHBh&utm_source=qr`
   - Email: `mail@lead-volume.com`

6. **Apply page Investors & Partners tab fix**
   - Previously broken because `script.js` global anchor smooth-scroll was calling `preventDefault` on tab clicks
   - `script.js` smooth-scroll now skips elements with `role="tab"`, `data-tab` attribute, `apply-tab` class, or hidden targets
   - Tab handler in `apply.html` now updates URL via `history.replaceState` and calls `showSection()` directly — no longer relies on `hashchange`

7. **API form-submission diagnostics**
   - `vercel.json` no longer specifies an explicit runtime (Vercel auto-detects Node, more reliable)
   - API endpoints return specific actionable error messages (missing API key, unverified domain, invalid key, etc.)
   - Frontend surfaces the actual server error in the failed-submission block

8. **Chat widget BWiGA palette**
   - FAB, panel header avatar, and per-message avatars all use deep navy core (`#050a1a → #0a1428`) with cyan/green radial highlights
   - Triple drop-shadow on the logo (cyan + blue + dark) keeps the thin neon strokes legible at any size
   - Pulse rings retuned from gold to BWiGA cyan/green

## Required Vercel environment variables

For the apply forms to actually deliver email:

```
RESEND_API_KEY            = re_...
APPLICATION_TO_EMAIL      = mail@lead-volume.com
APPLICATION_FROM_EMAIL    = BWiGA Accelerator <onboarding@resend.dev>
```

Note: The `APPLICATION_FROM_EMAIL` domain must be verified in your Resend account. Until you have a verified domain, use Resend's free `onboarding@resend.dev` sender as shown above.

## Restoring this backup

If something goes wrong with the live site or Git history, you can restore from this zip in 4 commands:

```bash
# 1. Extract this zip somewhere (e.g. ~/Desktop/bwiga-restore/)
unzip bwiga-accelerator-v3-final.zip

# 2. Push as a fresh commit on the existing repo
cd ~/Desktop/bwiga-accelerator
rsync -av --exclude='.git' ~/Desktop/bwiga-restore/bwiga-accelerator/ ~/Desktop/bwiga-accelerator/
git add .
git commit -m "Restore from 2026-05-08 backup"
git push

# 3. Vercel will auto-deploy within ~30 seconds
```

Or if the Git repo is itself broken:

```bash
# 1. Move broken folder aside
mv ~/Desktop/bwiga-accelerator ~/Desktop/bwiga-accelerator-broken

# 2. Re-clone
git clone https://github.com/StudioXAI/bwiga-accelerator.git ~/Desktop/bwiga-accelerator
cd ~/Desktop/bwiga-accelerator

# 3. Overlay the backup contents (preserving .git)
unzip -o ~/Downloads/bwiga-accelerator-v3-final.zip -d /tmp/restore
rsync -av --exclude='.git' /tmp/restore/bwiga-accelerator/ ~/Desktop/bwiga-accelerator/

# 4. Commit + push
git add .
git commit -m "Restore from 2026-05-08 backup"
git push
```

## Deployment notes

- **Hosting:** Vercel (`bwiga-accelerator.vercel.app`)
- **No build step required** — Vercel serves static HTML directly
- **API functions** are auto-detected from `/api/*.js`
- **Zero runtime dependencies** — uses built-in Node `fetch` and `URL`
- **Environment vars** must be set in Vercel dashboard before forms work

---

**Last verified clean:** 2026-05-08
- 21/21 HTML pages structurally clean
- 5/5 JS files pass `node --check`
- 2/2 JSON config files valid
- 0 standalone INFI mentions
- 0 stale @infi emails
- 84 references to `mail@lead-volume.com`
- All assets transparent backgrounds
