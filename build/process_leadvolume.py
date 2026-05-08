"""Process the LeadVolume wordmark — same algorithm as BWiGA wordmark."""
from PIL import Image, ImageFilter
from pathlib import Path

SRC = Path('/mnt/user-data/uploads/IMAGE_2026-05-08_14_19_00.jpg')
OUT = Path(__file__).parent.parent / 'assets' / 'leadvolume-wordmark.png'

img = Image.open(SRC).convert('RGB')
W, H = img.size
print(f'Source: {img.size}')

rgba = img.convert('RGBA')
px = rgba.load()

# LeadVolume image has cleaner blacks than the BWiGA JPG —
# can use slightly lower threshold for tighter glow preservation
T_OFF = 40
T_ON  = 90

for y in range(H):
    for x in range(W):
        r, g, b, _ = px[x, y]
        bright = max(r, g, b)
        if bright <= T_OFF:
            px[x, y] = (0, 0, 0, 0)
        elif bright < T_ON:
            alpha = int(255 * (bright - T_OFF) / (T_ON - T_OFF))
            px[x, y] = (r, g, b, alpha)

# Soften the cut edges
alpha_chan = rgba.split()[-1].filter(ImageFilter.GaussianBlur(radius=0.5))
rgba.putalpha(alpha_chan)

bbox = alpha_chan.getbbox()
if bbox:
    pad = 16
    L, T, R, B = bbox
    L = max(0, L - pad)
    T = max(0, T - pad)
    R = min(W, R + pad)
    B = min(H, B + pad)
    rgba = rgba.crop((L, T, R, B))
    print(f'Cropped to: {rgba.size}')

rgba.save(OUT, optimize=True)
print(f'✔ {OUT}')
