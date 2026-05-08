"""Generate a 1200x630 Open Graph card for BWiGA Accelerator."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).parent.parent
ASSETS = ROOT / 'assets'

W, H = 1200, 630

# ─── Background — match the site's dark navy with subtle gradients ──────
def make_bg():
    img = Image.new('RGB', (W, H), (3, 5, 8))
    px = img.load()

    # Multi-stop radial gradient: warm cyan glow top-left, gold glow bottom-right
    for y in range(H):
        for x in range(W):
            # Distance from cyan source (top-left)
            cx, cy = 200, 180
            dc = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            cyan_glow = max(0, 1 - dc / 700) * 0.18

            # Distance from gold source (bottom-right)
            gx, gy = 1000, 500
            dg = ((x - gx) ** 2 + (y - gy) ** 2) ** 0.5
            gold_glow = max(0, 1 - dg / 700) * 0.10

            r, g, b = px[x, y]
            r = int(r + 34 * cyan_glow + 212 * gold_glow)
            g = int(g + 211 * cyan_glow + 175 * gold_glow)
            b = int(b + 238 * cyan_glow + 55  * gold_glow)
            px[x, y] = (min(r, 255), min(g, 255), min(b, 255))
    return img


# ─── Composite the BWiGA mark + text ────────────────────────────────────
def render_og():
    bg = make_bg()
    out = bg.convert('RGBA')

    # Subtle grid lines (matching site .bg-grid feel)
    grid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    step = 80
    for gx in range(0, W, step):
        gd.line([(gx, 0), (gx, H)], fill=(212, 175, 55, 8), width=1)
    for gy in range(0, H, step):
        gd.line([(0, gy), (W, gy)], fill=(212, 175, 55, 8), width=1)
    out.alpha_composite(grid)

    # Place the master logo, scaled. The mark is 512×512, transparent.
    mark = Image.open(ASSETS / 'logo.png').convert('RGBA')
    mark_size = 280
    mark_resized = mark.resize((mark_size, mark_size), Image.LANCZOS)
    mark_x = 96
    mark_y = (H - mark_size) // 2
    out.alpha_composite(mark_resized, (mark_x, mark_y))

    # ─── Text block on the right ───
    draw = ImageDraw.Draw(out)

    # Try common font paths; fall back to default
    font_candidates = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    ]
    font_eyebrow = font_title = font_body = None
    for fp in font_candidates:
        if Path(fp).exists():
            font_eyebrow = ImageFont.truetype(fp, 22)
            font_title   = ImageFont.truetype(fp, 64)
            font_body    = ImageFont.truetype(fp.replace('-Bold', ''), 26)
            break
    if font_eyebrow is None:
        font_eyebrow = font_title = font_body = ImageFont.load_default()

    text_x = mark_x + mark_size + 56
    text_y = 178

    # Eyebrow (gold)
    draw.text((text_x, text_y), 'BWIGA  ·  ACCELERATOR', font=font_eyebrow, fill=(244, 184, 96, 255))

    # Title (white)
    title_lines = [
        'Web3 & iGaming',
        'startup acceleration',
    ]
    ly = text_y + 44
    for line in title_lines:
        draw.text((text_x, ly), line, font=font_title, fill=(255, 255, 255, 255))
        ly += 76

    # Body (muted)
    body_lines = [
        'Capital. Visibility. Partners.',
        'Connected before the market sees them.',
    ]
    ly += 16
    for line in body_lines:
        draw.text((text_x, ly), line, font=font_body, fill=(190, 200, 220, 255))
        ly += 40

    # Bottom-left URL stamp
    draw.text((96, H - 56), 'bwiga-accelerator.vercel.app', font=font_eyebrow, fill=(140, 150, 170, 255))

    # Save (RGB — OG cards don't need alpha)
    final = Image.new('RGB', (W, H), (3, 5, 8))
    final.paste(out, (0, 0), out)
    output = ASSETS / 'og-image.png'
    final.save(output, optimize=True)
    print(f'✔ {output} — {final.size}')


render_og()
