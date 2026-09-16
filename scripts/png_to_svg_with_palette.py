"""
Wrap a jersey mockup PNG in an SVG for Illustrator + k-means RGB swatches.
Writes .svg next to the .png (same folder); image referenced by filename (relative).
"""
from __future__ import annotations

import sys
from pathlib import Path
from xml.sax.saxutils import escape

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generated_assets_dir import generated_png_dir  # noqa: E402


def kmeans_palette(rgb: np.ndarray, k: int = 8) -> np.ndarray:
    flat = rgb.reshape(-1, 3).astype(np.float32)
    # Drop near-black background so clusters reflect jersey, not letterboxing
    lum = 0.299 * flat[:, 0] + 0.587 * flat[:, 1] + 0.114 * flat[:, 2]
    keep = lum > 22.0
    flat = flat[keep]
    if len(flat) < k * 50:
        flat = rgb.reshape(-1, 3).astype(np.float32)
    step = max(1, len(flat) // 50000)
    flat = flat[::step]
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.5)
    _, _, centers = cv2.kmeans(flat, k, None, criteria, 5, cv2.KMEANS_PP_CENTERS)
    centers = np.clip(centers.round(), 0, 255).astype(int)
    lum = 0.299 * centers[:, 0] + 0.587 * centers[:, 1] + 0.114 * centers[:, 2]
    order = np.argsort(lum)
    centers = centers[order]
    uniq: list[np.ndarray] = []
    for c in centers:
        if not any(np.linalg.norm(c.astype(float) - u.astype(float)) < 18 for u in uniq):
            uniq.append(c)
    return np.array(uniq[:8])


def main() -> None:
    if len(sys.argv) >= 2:
        png_path = Path(sys.argv[1])
    else:
        d = generated_png_dir()
        png_path = d / "tkr-inspired-triple-view-sharp.png"
        if not png_path.is_file():
            alt = Path(
                r"C:\Users\Simeon\.cursor\projects\c-Users-Simeon-OneDrive-Documents"
                r"\assets\tkr-inspired-triple-view-sharp.png"
            )
            png_path = alt if alt.is_file() else png_path

    if not png_path.is_file():
        print(f"PNG not found: {png_path}", file=sys.stderr)
        sys.exit(1)

    bgr = cv2.imread(str(png_path), cv2.IMREAD_COLOR)
    if bgr is None:
        print(f"Cannot read {png_path}", file=sys.stderr)
        sys.exit(1)

    h, w = bgr.shape[:2]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    centers = kmeans_palette(rgb)

    out_dir = png_path.parent
    svg_path = out_dir / f"{png_path.stem}.svg"
    png_name = png_path.name

    margin = 24
    sw_h = 72
    label_h = 48
    svg_w, svg_h = w, h + margin + sw_h + label_h + margin
    n = len(centers)
    cell = svg_w / max(n, 1)

    lines: list[str] = []
    lines.append('<?xml version="1.0" encoding="UTF-8"?>')
    lines.append(
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{svg_w}" height="{svg_h}" viewBox="0 0 {svg_w} {svg_h}" version="1.1">'
    )
    lines.append("  <title>Jersey mockup + RGB palette</title>")
    lines.append(
        "  <desc>Linked raster for Illustrator; RGB swatches sampled (k-means) from artwork.</desc>"
    )
    lines.append("  <defs>")
    lines.append('    <style type="text/css"><![CDATA[')
    lines.append(
        "      .lbl { font-family: Arial, Helvetica, sans-serif; font-size: 13px; fill: rgb(40,40,40); }"
    )
    lines.append("    ]]></style>")
    lines.append("  </defs>")
    lines.append('  <rect width="100%" height="100%" fill="rgb(255,255,255)"/>')
    lines.append(
        f'  <image x="0" y="0" width="{w}" height="{h}" '
        f'xlink:href="{escape(png_name)}" preserveAspectRatio="xMidYMid meet"/>'
    )

    y0 = h + margin
    for i, c in enumerate(centers):
        r, g, b = int(c[0]), int(c[1]), int(c[2])
        hx = f"#{r:02x}{g:02x}{b:02x}"
        x0 = i * cell
        lines.append(
            f'  <rect x="{x0:.2f}" y="{y0}" width="{cell:.2f}" height="{sw_h}" '
            f'fill="rgb({r},{g},{b})" stroke="rgb(200,200,200)" stroke-width="0.5"/>'
        )
        lines.append(
            f'  <text x="{x0 + cell / 2:.2f}" y="{y0 + sw_h + 14}" '
            f'text-anchor="middle" class="lbl">RGB({r}, {g}, {b})</text>'
        )
        lines.append(
            f'  <text x="{x0 + cell / 2:.2f}" y="{y0 + sw_h + 30}" '
            f'text-anchor="middle" class="lbl">{hx}</text>'
        )

    codes = ", ".join(
        f"RGB({int(c[0])},{int(c[1])},{int(c[2])}) "
        f"#{int(c[0]):02x}{int(c[1]):02x}{int(c[2]):02x}"
        for c in centers
    )
    lines.append(f"  <!-- Palette: {codes} -->")
    lines.append("</svg>")

    svg_path.write_text("\n".join(lines), encoding="utf-8")
    print(svg_path)
    print(codes)


if __name__ == "__main__":
    main()
