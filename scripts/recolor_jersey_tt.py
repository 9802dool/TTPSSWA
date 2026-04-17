"""
Recolor jersey mockup to Trinidad & Tobago national palette (red, black, white).
HSV remapping with softer masks + mild denoise to reduce hem/collar artifacts
from hard thresholding.
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
    chroma = mb - mn

    # Wider "neutral" = collar interior, white text, buttons, paper BG — avoids mottled collar
    neutral = (chroma < 42) & (mb > 148)

    h2, s2, v2 = h.copy(), s.copy(), v.copy()

    blue = (~neutral) & (h >= 90) & (h <= 142)
    teal_green = (~neutral) & (h >= 36) & (h < 92)
    purple = (~neutral) & (h > 142) & (h <= 176)

    # Blues -> TT red (slightly softer saturation bump)
    h2[blue] = np.clip(4.0 + (h[blue] - 90) * 0.06, 0, 14)
    s2[blue] = np.clip(s[blue] * 1.08 + 6, 0, 255)
    v2[blue] = np.clip(v[blue] * 1.01, 0, 255)

    # Teal/green -> dark (less crushing = less "static" noise at hem)
    h2[teal_green] = 4.0
    s2[teal_green] = np.clip(s[teal_green] * 0.52 + 12, 0, 130)
    v2[teal_green] = np.clip(v[teal_green] * 0.58 + 10, 32, 118)

    h2[purple] = 172.0
    s2[purple] = np.clip(s[purple] * 1.03, 0, 255)
    v2[purple] = np.clip(v[purple] * 0.94, 0, 255)

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
    out = cv2.cvtColor(out_hsv, cv2.COLOR_HSV2BGR)

    # Edge-preserving denoise: reduces speckle at hue boundaries / hem without AI redraw
    out = cv2.bilateralFilter(out, d=5, sigmaColor=55, sigmaSpace=55)
    return out


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
    cv2.imwrite(str(outp), out, [cv2.IMWRITE_PNG_COMPRESSION, 6])
    print(f"Wrote {outp}")


if __name__ == "__main__":
    main()
