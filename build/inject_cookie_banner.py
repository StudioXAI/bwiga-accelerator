"""Inject the cookie banner block before </body> on every page (idempotent)."""
from pathlib import Path

ROOT = Path(__file__).parent.parent
BLOCK = (ROOT / 'build' / 'cookie_banner_block.html').read_text(encoding='utf-8')
MARKER_START = '<!-- ===================================================='
SENTINEL_ID = 'id="cookie-banner"'

written = skipped = 0
for p in sorted(ROOT.glob('*.html')):
    txt = p.read_text(encoding='utf-8')

    # Idempotent — skip if already present
    if SENTINEL_ID in txt:
        skipped += 1
        continue

    if '</body>' not in txt:
        print(f'  ! {p.name} has no </body>, skipped')
        continue

    new = txt.replace('</body>', BLOCK + '\n</body>', 1)
    p.write_text(new, encoding='utf-8')
    written += 1
    print(f'  ✔ {p.name}')

print(f'\nInjected into {written} pages, {skipped} already had it.')
