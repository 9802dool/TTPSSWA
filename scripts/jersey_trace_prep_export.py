"""
Create Illustrator Image Trace–friendly exports from a jersey mockup PNG:
  1) Flat posterized color (fewer regions, cleaner fills)
  2) Black linework on white (Line Art / Technical Drawing preset)

Writes next to input or to Desktop/TTPSSWA-generated-png/ when using defaults.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generated_assets_dir import generated_png_dir  # noqa: E402


def quantize_bgr(bgr: np.ndarray, k: int = 20) -> np.ndarray:
    h, w = bgr.shape[:2]
    data = bgr.reshape(-1, 3).astype(np.float32)
    step = max(1, len(data) // 60000)
    data = data[::step]
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 50, 0.8)
    _, labels, centers = cv2.kmeans(data, k, None, criteria, 4, cv2.KMEANS_PP_CENTERS)
    centers = np.uint8(centers)
    full = bgr.reshape(-1, 3).astype(np.float32)
    dist = np.zeros((full.shape[0], len(centers)), dtype=np.float32)
    for i, c in enumerate(centers):
        dist[:, i] = np.linalg.norm(full - c.astype(np.float32), axis=1)
    idx = np.argmin(dist, axis=1)
    out = centers[idx].reshape(h, w, 3)
    return out


def export_flat_trace_ready(bgr: np.ndarray) -> np.ndarray:
    """Edge-preserving smooth + color quantization + mild sharpen on L."""
    d = max(5, min(bgr.shape[:2]) // 180 | 1)
    smooth = cv2.bilateralFilter(bgr, d, 75, 75)
    flat = quantize_bgr(smooth, k=22)
    lab = cv2.cvtColor(flat, cv2.COLOR_BGR2LAB)
    L, a, ch = cv2.split(lab)
    L = cv2.addWeighted(L, 1.12, cv2.GaussianBlur(L, (0, 0), 0.8), -0.12, 0)
    L = np.clip(L, 0, 255).astype(np.uint8)
    out = cv2.cvtColor(cv2.merge([L, a, ch]), cv2.COLOR_LAB2BGR)
    return out


def export_line_art(bgr: np.ndarray) -> np.ndarray:
    """High-contrast luminance + Canny edges → black strokes on white."""
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.8, tileGridSize=(8, 8))
    g = clahe.apply(gray)
    g = cv2.bilateralFilter(g, 5, 40, 40)
    # Adaptive edges: two thresholds from median
    med = float(np.median(g))
    lo = int(max(10, med * 0.45))
    hi = int(min(240, med * 1.55))
    edges = cv2.Canny(g, lo, hi)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, k)
    edges = cv2.dilate(edges, k, iterations=1)
    line = np.full_like(gray, 255)
    line[edges > 0] = 0
    return cv2.cvtColor(line, cv2.COLOR_GRAY2BGR)


def main() -> None:
    if len(sys.argv) >= 2:
        inp = Path(sys.argv[1])
    else:
        inp = generated_png_dir() / "tkr-inspired-triple-view-sharp.png"

    if not inp.is_file():
        print(f"Input not found: {inp}", file=sys.stderr)
        sys.exit(1)

    bgr = cv2.imread(str(inp), cv2.IMREAD_COLOR)
    if bgr is None:
        print(f"Cannot read {inp}", file=sys.stderr)
        sys.exit(1)

    out_dir = inp.parent
    stem = inp.stem

    flat = export_flat_trace_ready(bgr)
    lines = export_line_art(bgr)

    p_flat = out_dir / f"{stem}-trace-flat.png"
    p_lines = out_dir / f"{stem}-trace-lines.png"

    for path, img in ((p_flat, flat), (p_lines, lines)):
        cv2.imwrite(str(path), img, [cv2.IMWRITE_PNG_COMPRESSION, 3])
        print(path)


if __name__ == "__main__":
    main()
