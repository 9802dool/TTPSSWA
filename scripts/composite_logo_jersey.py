"""
Composite a logo PNG onto a jersey mockup (e.g. left / red chest).
Removes only border-connected near-black background so inner dark details stay.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generated_assets_dir import generated_png_dir  # noqa: E402


def border_connected_dark_mask(
    rgb: np.ndarray, thresh: int = 42
) -> np.ndarray:
    """True for dark pixels connected to image border (background)."""
    h, w = rgb.shape[:2]
    dark = np.all(rgb[:, :, :3].astype(np.int16) < thresh, axis=2)
    bg = np.zeros((h, w), dtype=bool)
    stack: list[tuple[int, int]] = []
    for x in range(w):
        for y in (0, h - 1):
            if dark[y, x]:
                stack.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if dark[y, x]:
                stack.append((y, x))
    seen = np.zeros((h, w), dtype=bool)
    while stack:
        y, x = stack.pop()
        if seen[y, x] or not dark[y, x]:
            continue
        seen[y, x] = True
        bg[y, x] = True
        if y > 0 and dark[y - 1, x] and not seen[y - 1, x]:
            stack.append((y - 1, x))
        if y + 1 < h and dark[y + 1, x] and not seen[y + 1, x]:
            stack.append((y + 1, x))
        if x > 0 and dark[y, x - 1] and not seen[y, x - 1]:
            stack.append((y, x - 1))
        if x + 1 < w and dark[y, x + 1] and not seen[y, x + 1]:
            stack.append((y, x + 1))
    return bg


def apply_logo_alpha(logo_rgba: Image.Image, thresh: int = 42) -> Image.Image:
    a = np.array(logo_rgba.convert("RGBA"))
    bg = border_connected_dark_mask(a, thresh=thresh)
    a = a.copy()
    a[bg, 3] = 0
    return Image.fromarray(a, "RGBA")


def composite(
    jersey_path: Path,
    logo_path: Path,
    out_path: Path,
    *,
    width_frac: float = 0.27,
    chest_x_frac: float = 0.28,
    chest_y_frac: float = 0.235,
) -> None:
    jersey = Image.open(jersey_path).convert("RGBA")
    logo = Image.open(logo_path).convert("RGBA")
    logo = apply_logo_alpha(logo)

    jw, jh = jersey.size
    target_w = max(32, int(jw * width_frac))
    lw, lh = logo.size
    target_h = max(32, int(lh * (target_w / lw)))
    logo_s = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

    cx = int(jw * chest_x_frac)
    cy = int(jh * chest_y_frac)
    x = cx - target_w // 2
    y = cy - target_h // 2

    out = jersey.copy()
    out.alpha_composite(logo_s, (x, y))
    out_rgb = out.convert("RGB")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_rgb.save(out_path, "PNG", compress_level=6)
    print(f"Wrote {out_path}")


def main() -> None:
    if len(sys.argv) < 3:
        print(
            "Usage: python composite_logo_jersey.py <jersey.png> <logo.png> [out.png]",
            file=sys.stderr,
        )
        sys.exit(1)
    jersey = Path(sys.argv[1])
    logo = Path(sys.argv[2])
    if len(sys.argv) >= 4:
        outp = Path(sys.argv[3])
    else:
        outp = generated_png_dir() / "jersey-with-tt-knight-riders-logo.png"
    composite(jersey, logo, outp)


if __name__ == "__main__":
    main()
