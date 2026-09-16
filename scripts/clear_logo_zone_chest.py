"""
Clear a soft zone on the wearer's left chest (viewer's right) for a logo by
smoothing palm/frond texture while keeping the underlying color gradient.

Does not alter neckline, sleeves, side panels, or the opposite chest.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generated_assets_dir import generated_png_dir  # noqa: E402


def _odd_kernel(size: float) -> int:
    k = max(5, int(round(size)))
    if k % 2 == 0:
        k += 1
    return k


def logo_zone_mask(
    h: int,
    w: int,
    *,
    cx_frac: float = 0.71,
    cy_frac: float = 0.31,
    rx_frac: float = 0.125,
    ry_frac: float = 0.11,
    feather_sigma: float | None = None,
) -> np.ndarray:
    """Soft elliptical mask (H, W) float32 in [0, 1]."""
    mask = np.zeros((h, w), np.float32)
    cx = int(cx_frac * w)
    cy = int(cy_frac * h)
    rx = max(8, int(rx_frac * w))
    ry = max(8, int(ry_frac * h))
    cv2.ellipse(mask, (cx, cy), (rx, ry), 0, 0, 360, 1.0, -1)
    sig = feather_sigma if feather_sigma is not None else max(8.0, 0.022 * float(min(h, w)))
    mask = cv2.GaussianBlur(mask, (0, 0), sigmaX=sig, sigmaY=sig)
    peak = float(mask.max())
    if peak > 1e-6:
        mask /= peak
    return np.clip(mask, 0.0, 1.0)


def smooth_logo_zone_bgr(bgr: np.ndarray, mask_hw: np.ndarray) -> np.ndarray:
    """
    In masked region, remove high-frequency fabric/frond detail by blending LAB
    channels toward heavily blurred versions; keeps large-scale color gradient.
    """
    h, w = bgr.shape[:2]
    k_l = _odd_kernel(min(h, w) * 0.085)
    k_ab = _odd_kernel(min(h, w) * 0.045)
    sigma_l = k_l / 3.2
    sigma_ab = k_ab / 3.2

    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    L, a, b = cv2.split(lab)
    L_blur = cv2.GaussianBlur(L, (k_l, k_l), sigma_l)
    a_blur = cv2.GaussianBlur(a, (k_ab, k_ab), sigma_ab)
    b_blur = cv2.GaussianBlur(b, (k_ab, k_ab), sigma_ab)

    m = mask_hw.astype(np.float32)
    L2 = (L.astype(np.float32) * (1.0 - m) + L_blur.astype(np.float32) * m).astype(np.uint8)
    a2 = (a.astype(np.float32) * (1.0 - m) + a_blur.astype(np.float32) * m).astype(np.uint8)
    b2 = (b.astype(np.float32) * (1.0 - m) + b_blur.astype(np.float32) * m).astype(np.uint8)

    out_lab = cv2.merge([L2, a2, b2])
    return cv2.cvtColor(out_lab, cv2.COLOR_LAB2BGR)


def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: python clear_logo_zone_chest.py <input.png> [output.png]\n"
            "  Clears texture on wearer's left chest (viewer's right) for logo placement.",
            file=sys.stderr,
        )
        sys.exit(1)
    inp = Path(sys.argv[1])
    if len(sys.argv) >= 3:
        outp = Path(sys.argv[2])
    else:
        outp = generated_png_dir() / "jersey-mockup-logo-zone-left-chest.png"

    bgr = cv2.imread(str(inp), cv2.IMREAD_COLOR)
    if bgr is None:
        print(f"Cannot read {inp}", file=sys.stderr)
        sys.exit(1)

    h, w = bgr.shape[:2]
    mask = logo_zone_mask(h, w)
    out = smooth_logo_zone_bgr(bgr, mask)

    outp.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(outp), out, [cv2.IMWRITE_PNG_COMPRESSION, 6])
    print(f"Wrote {outp}")


if __name__ == "__main__":
    main()
