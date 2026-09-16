"""
Outputs (1) unchanged mockup PNG, (2) same-size transparent PNG with only a thin
ellipse outline for logo placement — no fill, no blur, no color smear.
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generated_assets_dir import generated_png_dir  # noqa: E402


def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: python photoshop_logo_kit.py <mockup.png> [out_dir]",
            file=sys.stderr,
        )
        sys.exit(1)
    src = Path(sys.argv[1])
    out_dir = Path(sys.argv[2]) if len(sys.argv) >= 3 else generated_png_dir()
    out_dir.mkdir(parents=True, exist_ok=True)

    bgr = cv2.imread(str(src), cv2.IMREAD_COLOR)
    if bgr is None:
        sys.exit(f"Cannot read {src}")
    h, w = bgr.shape[:2]

    clean = out_dir / "jersey-mockup-clean.png"
    shutil.copyfile(src, clean)

    # Wearer left chest = viewer right; stay INBOARD so the ring does not hit the sleeve
    cx, cy = int(0.64 * w), int(0.27 * h)
    rx, ry = int(0.072 * w), int(0.055 * h)
    rx = max(12, rx)
    ry = max(10, ry)

    # BGRA: transparent background, opaque white outline only
    guide = np.zeros((h, w, 4), dtype=np.uint8)
    # Double stroke reads better on dark/light areas
    for t in (4, 2):
        c = (40, 40, 40, 255) if t == 4 else (255, 255, 255, 255)
        cv2.ellipse(guide, (cx, cy), (rx, ry), 0, 0, 360, c, t, lineType=cv2.LINE_AA)

    outline_path = out_dir / "jersey-logo-placement-outline.png"
    cv2.imwrite(str(outline_path), guide, [cv2.IMWRITE_PNG_COMPRESSION, 6])

    # Optional: same jersey + ring only (no fill inside ellipse — for quick visual check)
    preview = bgr.astype(np.float32)
    g = guide.astype(np.float32)
    a = (g[:, :, 3:4] / 255.0).clip(0.0, 1.0)
    bgr_fg = g[:, :, :3]
    preview = preview * (1.0 - a) + bgr_fg * a
    preview_path = out_dir / "jersey-mockup-preview-logo-ring.png"
    cv2.imwrite(
        str(preview_path),
        np.clip(preview, 0, 255).astype(np.uint8),
        [cv2.IMWRITE_PNG_COMPRESSION, 6],
    )

    print(clean)
    print(outline_path)
    print(preview_path)


if __name__ == "__main__":
    main()
