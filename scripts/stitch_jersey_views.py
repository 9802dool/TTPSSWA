"""
Stitch front + back + side jersey PNGs into one sheet (layout only—uniform scale to row height).
Usage: python scripts/stitch_jersey_views.py
  (expects files in public/) OR set env TEAM_IATF_SRC as comma-separated paths.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install pillow", file=sys.stderr)
    sys.exit(1)


def stitch(paths: list[Path], out_path: Path, pad: int = 32) -> None:
    for p in paths:
        if not p.is_file():
            raise FileNotFoundError(p)
    imgs = [Image.open(p).convert("RGBA") for p in paths]
    target_h = max(im.height for im in imgs)
    scaled: list[Image.Image] = []
    for im in imgs:
        if im.height == target_h:
            scaled.append(im)
        else:
            w = max(1, round(im.width * (target_h / im.height)))
            scaled.append(im.resize((w, target_h), Image.Resampling.LANCZOS))

    total_w = sum(im.width for im in scaled) + pad * (len(scaled) + 1)
    out = Image.new("RGBA", (total_w, target_h + pad * 2), (255, 255, 255, 255))
    x = pad
    for im in scaled:
        out.paste(im, (x, pad), im)
        x += im.width + pad

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"Wrote {out_path}")


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    public = root / "public"
    if len(sys.argv) >= 4:
        paths = [Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])]
    else:
        env = os.environ.get("TEAM_IATF_SRC", "").strip()
        if env:
            paths = [Path(p.strip()) for p in env.split(",") if p.strip()]
        else:
            paths = [
                public / "team-iatf-jersey-blue-green.png",
                public / "team-iatf-jersey-blue-green-back.png",
                public / "team-iatf-jersey-blue-green-side.png",
            ]
    out_path = (
        Path(sys.argv[4])
        if len(sys.argv) >= 5
        else public / "team-iatf-jersey-blue-green-all-views.png"
    )
    stitch(paths, out_path)


if __name__ == "__main__":
    main()
