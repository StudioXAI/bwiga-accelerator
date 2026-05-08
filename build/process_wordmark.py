"""
Process the BWiGA wordmark image:
  Knock out near-black background to transparent. Stricter threshold
  trades a tiny bit of glow halo for clean integration with site bg.
"""
from PIL import Image, ImageFilter
from pathlib import Path

SRC = Path('/mnt/user-data/uploads/IMAGE_2026-05-08_13_39_58.jpg')
OUT = Path(__file__).parent.parent / 'assets' / 'logo-wordmark.png'

img = Image.open(SRC).convert('RGB')
W, H = img.size
print(f'Source: {img.size}')

rgba = img.convert('RGBA')
px = rgba.load()

# Strict thresholds — JPG noise in dark areas can be brightness 30-60,
# so we have to cut higher than that. Costs a hair of glow halo, but
# produces a clean result without grey speckle.
T_OFF = 70   # below this brightness → fully transparent
T_ON  = 110  # above this → fully opaque (preserve original color)
# Between: linear ramp

for y in range(H):
    for x in range(W):
        r, g, b, _ = px[x, y]
        bright = max(r, g, b)
        if bright <= T_OFF:
            px[x, y] = (0, 0, 0, 0)
        elif bright < T_ON:
            alpha = int(255 * (bright - T_OFF) / (T_ON - T_OFF))
            px[x, y] = (r, g, b, alpha)
        # else: leave as fully opaque

# Tiny smoothing pass to soften the cut edge — only on the alpha channel
alpha_chan = rgba.split()[-1].filter(ImageFilter.GaussianBlur(radius=0.6))
rgba.putalpha(alpha_chan)

# Auto-crop with small padding
bbox = alpha_chan.getbbox()
if bbox:
    pad = 12
    L, T, R, B = bbox
    L = max(0, L - pad)
    T = max(0, T - pad)
    R = min(W, R + pad)
    B = min(H, B + pad)
    rgba = rgba.crop((L, T, R, B))
    print(f'Cropped to: {rgba.size} (bbox was {bbox})')

rgba.save(OUT, optimize=True)
print(f'✔ Saved {OUT} — {rgba.size}, RGBA')

final = Image.open(OUT)
ax = final.split()[-1]
amin, amax = ax.getextrema()
total = final.size[0] * final.size[1]
transparent = sum(1 for v in ax.tobytes() if v == 0)
print(f'   alpha range {amin}-{amax}, {transparent}/{total} ({100*transparent/total:.0f}%) fully transparent')
