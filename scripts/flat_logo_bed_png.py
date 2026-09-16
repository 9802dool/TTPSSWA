"""One flat color logo bed on chest — rest of image unchanged. Fast."""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generated_assets_dir import generated_png_dir  # noqa: E402


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python flat_logo_bed_png.py <input.png> [out.png]", file=sys.stderr)
        sys.exit(1)
    inp = Path(sys.argv[1])
    outp = Path(sys.argv[2]) if len(sys.argv) >= 3 else generated_png_dir() / "jersey-mockup-logo-bed.png"

    bgr = cv2.imread(str(inp), cv2.IMREAD_COLOR)
    if bgr is None:
        sys.exit(f"Cannot read {inp}")

    h, w = bgr.shape[:2]
    # Wearer left chest = viewer right; upper chest ellipse
    mask = np.zeros((h, w), np.float32)
    cx, cy = int(0.71 * w), int(0.31 * h)
    rx, ry = int(0.12 * w), int(0.11 * h)
    cv2.ellipse(mask, (cx, cy), (rx, ry), 0, 0, 360, 1.0, -1)
    sig = max(8.0, 0.02 * min(h, w))
    mask = cv2.GaussianBlur(mask, (0, 0), sig)
    m = mask / (mask.max() + 1e-6)

    # Average BGR in hard ellipse (same center) for stable color
    hard = np.zeros((h, w), np.uint8)
    cv2.ellipse(hard, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    mean = cv2.mean(bgr, mask=hard)[:3]
    bed = np.empty_like(bgr, dtype=np.float32)
    bed[:, :, 0] = mean[0]
    bed[:, :, 1] = mean[1]
    bed[:, :, 2] = mean[2]

    mf = m[:, :, np.newaxis].astype(np.float32)
    out = bgr.astype(np.float32) * (1.0 - mf) + bed * mf
    outp.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(outp), np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 6])
    print(outp)


if __name__ == "__main__":
    main()
