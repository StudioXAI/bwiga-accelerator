"""
Replace the old logo block (mark + text spans) with a single wordmark image
across all primary and In-Preparation pages, in both header and footer.

Old shape:
  <a href="..." class="logo" aria-label="...">
    <span class="logo-mark"><img src="assets/logo.png" alt="..." /></span>
    <span class="logo-text">BWiGA</span>
    <span class="logo-suffix">Accelerator</span>
  </a>

New shape:
  <a href="..." class="logo" aria-label="BWiGA Accelerator home">
    <img src="assets/logo-wordmark.png" alt="BWiGA Accelerator" class="logo-wordmark-img" />
  </a>
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent

# Match an entire <a class="logo"> ... </a> block whose body is the old
# mark + text + suffix structure. The href varies (#top vs index.html etc.)
PAT = re.compile(
    r'<a\s+href="([^"]*)"\s+class="logo"\s+aria-label="[^"]*">\s*'
    r'<span class="logo-mark">\s*<img src="assets/logo\.png" alt="[^"]*"\s*/>\s*</span>\s*'
    r'<span class="logo-text">BWiGA</span>\s*'
    r'<span class="logo-suffix">Accelerator</span>\s*'
    r'</a>',
    re.DOTALL,
)

REPLACEMENT = (
    '<a href="\\1" class="logo" aria-label="BWiGA Accelerator home">\n'
    '      <img src="assets/logo-wordmark.png" alt="BWiGA Accelerator" class="logo-wordmark-img" />\n'
    '    </a>'
)

# Some pages have the logo block with slightly different whitespace inside
# the footer (different indentation). A second more permissive regex handles
# both.
PAT_LOOSE = re.compile(
    r'<a\s+href="([^"]*)"\s+class="logo"\s*(?:aria-label="[^"]*")?\s*>\s*'
    r'<span class="logo-mark">\s*<img src="assets/logo\.png"[^/]*/>\s*</span>\s*'
    r'<span class="logo-text">BWiGA</span>\s*'
    r'<span class="logo-suffix">Accelerator</span>\s*'
    r'</a>',
    re.DOTALL,
)

REPLACEMENT_LOOSE = (
    '<a href="\\1" class="logo" aria-label="BWiGA Accelerator home">\n'
    '          <img src="assets/logo-wordmark.png" alt="BWiGA Accelerator" class="logo-wordmark-img" />\n'
    '        </a>'
)

total_replacements = 0
for p in sorted(ROOT.glob('*.html')):
    txt = p.read_text(encoding='utf-8')
    orig = txt
    # Try strict first, then loose
    txt, n1 = PAT.subn(REPLACEMENT, txt)
    txt, n2 = PAT_LOOSE.subn(REPLACEMENT_LOOSE, txt)
    n = n1 + n2
    if n > 0:
        p.write_text(txt, encoding='utf-8')
        print(f'  ✔ {p.name}: {n} logo block(s) replaced')
        total_replacements += n
    else:
        # Check if the old block still exists somehow
        if 'logo-mark' in orig or 'logo-text' in orig or 'logo-suffix' in orig:
            print(f'  ! {p.name}: still has logo-mark/text/suffix — pattern miss')

print(f'\nTotal logo blocks replaced: {total_replacements}')
print('\n── Verify no old logo-text/logo-suffix spans remain ──')
remaining = 0
for p in sorted(ROOT.glob('*.html')):
    txt = p.read_text(encoding='utf-8')
    for tag in ['<span class="logo-text"', '<span class="logo-suffix"', '<span class="logo-mark"']:
        if tag in txt:
            print(f'  {p.name}: still has {tag}')
            remaining += 1
if remaining == 0:
    print('  ✓ All old spans cleared')