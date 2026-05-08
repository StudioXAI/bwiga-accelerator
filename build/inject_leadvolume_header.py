"""Add LeadVolume 'Media partner' badge to the right side of every header,
positioned between the nav and the Apply button.

Header today:
  <header>
    <div class="header-inner">
      <a class="logo">…</a>
      <nav>…</nav>
      <a class="apply-btn">…</a>      <-- inject our badge BEFORE this
      <button class="menu-toggle">…</button>
    </div>
  </header>
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent

# The In Preparation pages have a simpler header without an apply-btn —
# they end the .header-inner with a </nav>… or just have the menu-toggle.
# We'll target two patterns:
#   (a) Primary pages: insert before <a href="apply.html" class="apply-btn">
#   (b) In Preparation: insert before the closing </header>'s </div>

BADGE_HTML = '''    <a href="https://www.youtube.com/@leadvolume6838" target="_blank" rel="noopener" class="header-leadvolume" aria-label="LeadVolume — media partner">
      <span class="header-leadvolume-label">Media Partner</span>
      <img src="assets/leadvolume-wordmark.png" alt="LeadVolume" />
    </a>

    '''

# Pattern (a): primary pages with apply-btn
APPLY_BTN_RE = re.compile(
    r'(\n    )(<a href="apply\.html" class="apply-btn">)',
    re.DOTALL
)

# Pattern (b): In Preparation pages — insert before .btn-primary in header
HEADER_APPLY_PRIMARY_RE = re.compile(
    r'(\n    )(<a href="apply\.html" class="btn btn-primary apply-cta-header">)',
    re.DOTALL
)

written = 0
skipped = 0
for p in sorted(ROOT.glob('*.html')):
    txt = p.read_text(encoding='utf-8')

    # Skip if badge already present (idempotent)
    if 'header-leadvolume' in txt:
        skipped += 1
        continue

    new = txt
    # Try primary-page pattern
    new, n1 = APPLY_BTN_RE.subn(
        lambda m: '\n' + BADGE_HTML + m.group(2),
        new, count=1
    )
    # Try In Preparation pattern
    if n1 == 0:
        new, n2 = HEADER_APPLY_PRIMARY_RE.subn(
            lambda m: '\n' + BADGE_HTML + m.group(2),
            new, count=1
        )
        n = n2
    else:
        n = n1

    if n > 0:
        p.write_text(new, encoding='utf-8')
        written += 1
        print(f'  ✔ {p.name}')
    else:
        print(f'  ! {p.name} — no apply button anchor found, skipped')

print(f'\nAdded LeadVolume badge to {written} pages, {skipped} already had it.')