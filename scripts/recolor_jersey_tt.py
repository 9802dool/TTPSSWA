"""
Recolor jersey mockup to Trinidad & Tobago national palette (red, black, white)
without changing layout, shapes, or text geometry — HSV remapping only.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np


def recolor_tt_national(bgr: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h = hsv[:, :, 0].astype(np.float32)
    s = hsv[:, :, 1].astype(np.float32)
    v = hsv[:, :, 2].astype(np.float32)

    b, g, r = cv2.split(bgr.astype(np.float32))
    mb = np.max(np.stack([b, g, r], axis=-1), axis=-1)
    mn = np.min(np.stack([b, g, r], axis=-1), axis=-1)
    # Preserve near-neutral pixels (white text, bright buttons, paper-white BG)
    neutral = (mb - mn < 28) & (mb > 185)

    h2, s2, v2 = h.copy(), s.copy(), v.copy()

    # OpenCV H: 0-179. Blue ~100-125, Teal/cyan/green ~40-100
    blue = (~neutral) & (h >= 92) & (h <= 140)
    teal_green = (~neutral) & (h >= 38) & (h < 92)
    purple = (~neutral) & (h > 140) & (h <= 175)

    # Blues -> vivid TT red (keep shading via V/S)
    h2[blue] = 4.0 + (h[blue] - 92) * 0.08  # slight variation
    h2[blue] = np.clip(h2[blue], 0, 12)
    s2[blue] = np.clip(s[blue] * 1.12 + 8, 0, 255)
    v2[blue] = np.clip(v[blue] * 1.02, 0, 255)

    # Teal / green accents -> black / near-black (keep a hint of red undertone)
    h2[teal_green] = 3.0
    s2[teal_green] = np.clip(s[teal_green] * 0.45 + 15, 0, 120)
    v2[teal_green] = np.clip(v[teal_green] * 0.42, 0, 95)

    # Purple stray -> deep red
    h2[purple] = 172.0
    s2[purple] = np.clip(s[purple] * 1.05, 0, 255)
    v2[purple] = np.clip(v[purple] * 0.92, 0, 255)

    h2[neutral] = h[neutral]
    s2[neutral] = s[neutral]
    v2[neutral] = v[neutral]

    out_hsv = np.stack(
        [
            np.clip(h2, 0, 179).astype(np.uint8),
            np.clip(s2, 0, 255).astype(np.uint8),
            np.clip(v2, 0, 255).astype(np.uint8),
        ],
        axis=-1,
    )
    return cv2.cvtColor(out_hsv, cv2.COLOR_HSV2BGR)


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python recolor_jersey_tt.py <input.png> <output.png>", file=sys.stderr)
        sys.exit(1)
    inp = Path(sys.argv[1])
    outp = Path(sys.argv[2])
    bgr = cv2.imread(str(inp), cv2.IMREAD_COLOR)
    if bgr is None:
        print(f"Cannot read {inp}", file=sys.stderr)
        sys.exit(1)
    out = recolor_tt_national(bgr)
    outp.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(outp), out, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    print(f"Wrote {outp}")


if __name__ == "__main__":
    main()
