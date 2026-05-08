"""
Build the canonical BWiGA footer (per FOOTER_BWiGA spec) and inject it
into every HTML page. Replaces the existing minimal footer where present;
adds it before </body> on apply.html which doesn't have one.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent  # /home/claude/work/bwiga-accelerator

FOOTER_HTML = '''<!-- ===== Footer (BWiGA spec) ===== -->
<footer class="site-footer">

  <!-- 1. Top CTA bar -->
  <div class="footer-cta-bar">
    <div class="wrap">
      <div class="footer-cta-inner">
        <div class="footer-cta-mark">
          <img src="assets/logo.png" alt="" aria-hidden="true" />
        </div>
        <div class="footer-cta-text">
          <h3>Ready to build with the BWiGA ecosystem?</h3>
          <p>Apply as a founder, join as an investor or become part of the BWiGA Accelerator partner network.</p>
        </div>
        <div class="footer-cta-actions">
          <a href="apply.html" class="btn btn-primary">
            Apply Now
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
          <a href="book-intro-call.html" class="btn btn-secondary">Book an Intro Call</a>
        </div>
      </div>
    </div>
  </div>

  <!-- 2. Main 5-column footer -->
  <div class="footer-main">
    <div class="wrap">
      <div class="footer-grid">

        <!-- Brand block -->
        <div class="footer-brand">
          <a href="index.html" class="logo" aria-label="BWiGA Accelerator home">
            <span class="logo-mark"><img src="assets/logo.png" alt="BWiGA Accelerator" /></span>
            <span class="logo-text">BWiGA</span>
            <span class="logo-suffix">Accelerator</span>
          </a>
          <p>Premium Web3 &amp; iGaming accelerator ecosystem for founders, investors and industry leaders.</p>
          <div class="footer-strap">Capital. Visibility. Partners. Market access.</div>
          <div class="footer-strap-2">Built for projects ready to scale beyond noise.</div>

          <div class="footer-social" aria-label="Social channels">
            <a href="#" aria-label="X / Twitter" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
            <a href="#" aria-label="LinkedIn" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
            <a href="#" aria-label="Telegram" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>
            <a href="mailto:mail@lead-volume.com" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg></a>
          </div>
        </div>

        <!-- Explore -->
        <div class="footer-col">
          <h5>Explore</h5>
          <ul>
            <li><a href="index.html">Accelerator</a></li>
            <li><a href="market-rails.html">Market Rails</a></li>
            <li><a href="for-founders.html">For Founders</a></li>
            <li><a href="investors.html">Investors &amp; Partners</a></li>
            <li><a href="ai-tech-tracks.html">AI Tech Tracks</a></li>
          </ul>
        </div>

        <!-- Ecosystem -->
        <div class="footer-col">
          <h5>Ecosystem</h5>
          <ul>
            <li><a href="mentors-advisors.html">Mentors &amp; Advisors</a></li>
            <li><a href="media-events.html">Media &amp; Events</a></li>
            <li><a href="demo-day.html">Demo Day</a></li>
            <li><a href="partners.html">Partners</a></li>
            <li><a href="upcoming-cohort.html">Upcoming Cohort</a></li>
          </ul>
        </div>

        <!-- Resources -->
        <div class="footer-col">
          <h5>Resources</h5>
          <ul>
            <li><a href="insights.html">Insights</a></li>
            <li><a href="insights.html#market-readiness-thesis">Market Readiness Thesis</a></li>
            <li><a href="insights.html#ai-web3-thesis">AI &times; Web3 Thesis</a></li>
            <li><a href="resources.html">Founder Resources</a></li>
            <li><a href="newsletter.html">Newsletter</a></li>
          </ul>
        </div>

        <!-- Apply -->
        <div class="footer-col">
          <h5>Apply</h5>
          <ul>
            <li><a href="apply.html#founder">Apply as a Founder</a></li>
            <li><a href="apply.html#partners">Join Investor Network</a></li>
            <li><a href="apply.html#partners">Become a Partner</a></li>
            <li><a href="apply.html#refer">Refer a Project</a></li>
            <li><a href="book-intro-call.html">Book an Intro Call</a></li>
          </ul>
        </div>

      </div>
    </div>
  </div>

  <!-- 3. Risk note -->
  <div class="wrap">
    <div class="footer-risk">
      BWiGA Accelerator does not provide financial, investment, legal, tax or regulatory advice. Nothing on this website guarantees acceptance, investment, fundraising, partnership, media access, event participation, listing, liquidity, returns or any specific outcome. All participation, investment and partnership decisions remain the sole responsibility of each participant. Technology partners — including INFI MultiChain (a fully decentralized ecosystem) — may support selected projects where relevant; they do not operate the accelerator.
    </div>
  </div>

  <!-- 4. Legal bar -->
  <div class="wrap">
    <div class="footer-legal">
      <div class="footer-legal-links">
        <a href="legal-disclaimer.html">Legal Disclaimer</a>
        <a href="risk-disclaimer.html">Risk Disclaimer</a>
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms.html">Terms of Use</a>
        <a href="contact.html">Contact</a>
      </div>
      <div class="footer-copyright">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>© 2026 BWiGA. BWiGA Accelerator. All rights reserved.</span>
      </div>
    </div>
  </div>

</footer>'''


# ─── Strategy ────────────────────────────────────────────────────────────────
# Each HTML page either has an existing <footer class="site-footer">…</footer>
# block or it does not. We'll:
#   - Replace the entire existing footer with the new one when it exists
#   - Insert the new one just before </body> when missing (apply.html case)
# We also strip any old <!-- ===== Footer ===== --> comment leading into it.

def update_page(p: Path):
    txt = p.read_text(encoding='utf-8')
    orig = txt

    # Pattern: optional comment + the entire <footer class="site-footer">…</footer>
    pattern = re.compile(
        r'(<!--\s*={2,}\s*Footer\s*={2,}\s*-->\s*)?'
        r'<footer\s+class="site-footer">.*?</footer>',
        re.DOTALL
    )

    if pattern.search(txt):
        txt = pattern.sub(FOOTER_HTML, txt, count=1)
    else:
        # No existing footer — inject before </body>
        txt = re.sub(r'(\s*)</body>',
                     r'\n' + FOOTER_HTML + r'\n\1</body>',
                     txt, count=1)

    if txt != orig:
        p.write_text(txt, encoding='utf-8')
        return True
    return False


pages = ['index.html', 'for-founders.html', 'investors.html', 'market-rails.html',
         'ai-tech-tracks.html', 'apply.html']
for fname in pages:
    p = ROOT / fname
    if p.exists():
        if update_page(p):
            has_footer = '<footer class="site-footer">' in p.read_text()
            print(f"  ✔ {fname} — footer {'present' if has_footer else 'MISSING'}")
        else:
            print(f"    {fname} — no change needed")
    else:
        print(f"  ✗ {fname} — file not found")
