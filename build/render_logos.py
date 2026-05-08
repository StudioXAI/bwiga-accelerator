"""
Render BWiGA logos and favicons at multiple sizes with transparent backgrounds.
Uses the same geometric design as logo.svg / favicon.svg but rendered via
Pillow primitives so we don't need an SVG rasteriser installed.

Mark = stylized "B" with a 4-point sparkle, blue-cyan-green gradient stroke,
       transparent background, soft glow.
"""

from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math

ASSETS = Path(__file__).parent
SUPER = 8  # supersample factor for crisp anti-aliased edges


def lerp_color(c1, c2, t):
    return tuple(round(c1[i] + (c2[i] - c1[i]) * t) for i in range(len(c1)))


# ─── Stroke gradient: blue → cyan → green ─────────────────────────────────
GRAD_STOPS = [
    (0.00, (30, 99, 255, 255)),    # #1e63ff
    (0.50, (34, 211, 238, 255)),   # #22d3ee
    (1.00, (16, 229, 153, 255)),   # #10e599
]

def grad_at(t):
    """Sample the 3-stop gradient at position t in [0,1]."""
    t = max(0.0, min(1.0, t))
    for i in range(len(GRAD_STOPS) - 1):
        a_pos, a_col = GRAD_STOPS[i]
        b_pos, b_col = GRAD_STOPS[i + 1]
        if a_pos <= t <= b_pos:
            local = (t - a_pos) / (b_pos - a_pos)
            return lerp_color(a_col, b_col, local)
    return GRAD_STOPS[-1][1]


def make_gradient_canvas(W, H):
    """Make an RGBA gradient that goes corner-to-corner (top-left → bottom-right)."""
    grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = grad.load()
    for y in range(H):
        for x in range(W):
            t = (x + y) / (W + H - 2) if (W + H - 2) > 0 else 0
            px[x, y] = grad_at(t)
    return grad


def draw_b_mask(size):
    """Build a single-channel mask for the BWiGA 'B' silhouette + sparkle.
    Returns a Pillow 'L' mode image where 255 = part of the mark, 0 = empty.
    Geometry is normalised to the same proportions as logo.svg (256-unit canvas).
    """
    SS = size * SUPER
    mask = Image.new("L", (SS, SS), 0)
    d = ImageDraw.Draw(mask)

    # Scale factor: original SVG works in a 256x256 viewbox
    s = SS / 256

    # Outline thickness (must scale with size)
    stroke = max(2, int(round(4 * s)))

    # ─── B SILHOUETTE — strokes only ───
    # Stem
    d.rounded_rectangle([60*s, 48*s, 82*s, 208*s], radius=4*s,
                        outline=255, width=stroke)
    # Top lobe (D-shape)
    d.pieslice([(82*s - 56*s), 48*s, (82*s + 56*s), 160*s],
               start=270, end=90, outline=255, width=stroke)
    # Bottom lobe
    d.pieslice([(82*s - 56*s), 96*s, (82*s + 56*s), 208*s],
               start=270, end=90, outline=255, width=stroke)
    # Close the lobes' left edges (where they meet the stem)
    d.line([(82*s, 48*s), (82*s, 128*s)], fill=255, width=stroke)
    d.line([(82*s, 128*s), (82*s, 208*s)], fill=255, width=stroke)

    # ─── 4-POINT SPARKLE / STAR — at the junction ───
    # Center of sparkle ≈ (138, 130)
    cx, cy = 138 * s, 130 * s
    # Long arms (vertical & horizontal) length, narrow waist
    arm_long  = 38 * s
    arm_short = 38 * s
    waist     = 6 * s
    star_pts = [
        (cx, cy - arm_long),                    # top
        (cx + waist, cy - waist),
        (cx + arm_short, cy),                   # right
        (cx + waist, cy + waist),
        (cx, cy + arm_long),                    # bottom
        (cx - waist, cy + waist),
        (cx - arm_short, cy),                   # left
        (cx - waist, cy - waist),
    ]
    star_stroke = max(2, int(round(3.2 * s)))
    d.polygon(star_pts, outline=255, fill=0)
    # We need the stroke thicker than 1px — re-stroke with line segments
    for i in range(len(star_pts)):
        a = star_pts[i]
        b = star_pts[(i + 1) % len(star_pts)]
        d.line([a, b], fill=255, width=star_stroke)

    # Anti-alias by downscaling
    return mask.resize((size, size), Image.LANCZOS)


def render_mark(size, glow=True):
    """Render the BWiGA mark at `size` x `size` pixels with transparent BG."""
    # 1. Build the silhouette mask
    mask = draw_b_mask(size)

    # 2. Build the gradient canvas
    grad = make_gradient_canvas(size, size)

    # 3. Compose: mark coloured by gradient
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)

    # 4. Soft glow halo (skip for tiny sizes — it just turns to mush)
    if glow and size >= 48:
        glow_layer = out.copy()
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=size * 0.022))
        # Reduce glow alpha so the mark stays crisp on top
        a = glow_layer.split()[-1].point(lambda v: int(v * 0.55))
        glow_layer.putalpha(a)
        composed = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        composed.alpha_composite(glow_layer)
        composed.alpha_composite(out)
        out = composed

    return out


def make_ico(sizes, out_path):
    """Multi-resolution favicon.ico from a list of (size, image) tuples."""
    images = [render_mark(s, glow=False) for s in sizes]
    # Pillow's .ico save needs primary image + sizes list
    images[0].save(
        out_path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )


# ─── Render all the assets ──────────────────────────────────────────────────
print(f"Working dir: {ASSETS}")

# Logo (large, with glow) — for header / OG / general use
logo512 = render_mark(512, glow=True)
logo512.save(ASSETS / "logo.png", optimize=True)
print(f"✔ logo.png — {logo512.size}, mode {logo512.mode}")

# 180 — Apple touch icon
apple180 = render_mark(180, glow=True)
apple180.save(ASSETS / "apple-touch-icon.png", optimize=True)
print(f"✔ apple-touch-icon.png — {apple180.size}")

# 48 — generic favicon.png (some browsers prefer this)
fav48 = render_mark(48, glow=False)
fav48.save(ASSETS / "favicon.png", optimize=True)
print(f"✔ favicon.png — {fav48.size}")

# 32 — favicon-32x32
fav32 = render_mark(32, glow=False)
fav32.save(ASSETS / "favicon-32x32.png", optimize=True)
print(f"✔ favicon-32x32.png — {fav32.size}")

# 16 — favicon-16x16
fav16 = render_mark(16, glow=False)
fav16.save(ASSETS / "favicon-16x16.png", optimize=True)
print(f"✔ favicon-16x16.png — {fav16.size}")

# Multi-res .ico
make_ico([16, 32, 48], ASSETS / "favicon.ico")
print("✔ favicon.ico — multi-resolution (16, 32, 48)")

# ─── Sanity check: every PNG must have alpha and at least some transparency ───
print("\n--- Transparency audit ---")
for name in ["logo.png", "apple-touch-icon.png", "favicon.png",
            "favicon-32x32.png", "favicon-16x16.png"]:
    img = Image.open(ASSETS / name)
    alpha = img.split()[-1] if img.mode == "RGBA" else None
    if alpha is None:
        print(f"✗ {name}: NOT RGBA (no alpha channel)")
    else:
        amin, amax = alpha.getextrema()
        opaque_px = sum(1 for px in alpha.getdata() if px > 250)
        transparent_px = sum(1 for px in alpha.getdata() if px == 0)
        total = img.size[0] * img.size[1]
        print(f"✔ {name}: {img.mode} {img.size}, alpha {amin}-{amax}, "
              f"transparent={transparent_px}/{total} ({100*transparent_px/total:.0f}%)")
