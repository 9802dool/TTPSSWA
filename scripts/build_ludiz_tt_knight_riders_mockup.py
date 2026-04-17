"""
Recolor LUDIZ-style jersey front/back to TT national colors and composite Knight Riders logo
on wearer's left chest. Output: Desktop/TTPSSWA-generated-png/
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generated_assets_dir import generated_png_dir  # noqa: E402
from recolor_jersey_tt import recolor_tt_national  # noqa: E402


def bgr_to_pil_rgb(bgr: np.ndarray) -> Image.Image:
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)


def composite_logo(
    base: Image.Image,
    logo_rgba: Image.Image,
    *,
    width_frac: float = 0.22,
    x_frac: float = 0.58,
    y_frac: float = 0.22,
) -> Image.Image:
    """Place logo on wearer's left chest (right side of front-facing mockup image)."""
    w, h = base.size
    lw = max(40, int(w * width_frac))
    lg = logo_rgba.copy()
    aspect = lg.height / lg.width
    lh = max(30, int(lw * aspect))
    lg = lg.resize((lw, lh), Image.Resampling.LANCZOS)
    lx = int(w * x_frac)
    ly = int(h * y_frac)
    out = base.convert("RGBA")
    a = lg.split()[3]
    shadow = Image.new("RGBA", lg.size, (12, 12, 18, 0))
    shadow.putalpha(a.point(lambda p: int(p * 0.32)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=2))
    out.paste(shadow, (lx + 4, ly + 5), shadow)
    out.paste(lg, (lx, ly), lg)
    return out.convert("RGB")


def stitch_horizontal(left: Image.Image, right: Image.Image, pad: int = 36) -> Image.Image:
    h = max(left.height, right.height)
    def scale_to_height(im: Image.Image, target_h: int) -> Image.Image:
        if im.height == target_h:
            return im
        nw = max(1, round(im.width * (target_h / im.height)))
        return im.resize((nw, target_h), Image.Resampling.LANCZOS)
    a = scale_to_height(left, h)
    b = scale_to_height(right, h)
    total_w = a.width + b.width + pad * 3
    canvas = Image.new("RGB", (total_w, h + pad * 2), (255, 255, 255))
    canvas.paste(a, (pad, pad))
    canvas.paste(b, (pad * 2 + a.width, pad))
    return canvas


def main() -> None:
    if len(sys.argv) >= 4:
        front_path = Path(sys.argv[1])
        back_path = Path(sys.argv[2])
        logo_path = Path(sys.argv[3])
    else:
        assets = Path(
            r"C:\Users\Simeon\.cursor\projects\c-Users-Simeon-OneDrive-Documents\assets"
        )
        front_path = assets / (
            "c__Users_Simeon_AppData_Roaming_Cursor_User_workspaceStorage_ea0cbb2e30fb4a85705038326e89196e_images_image-03db7698-d047-4550-b209-074ea20b6fab.png"
        )
        back_path = assets / (
            "c__Users_Simeon_AppData_Roaming_Cursor_User_workspaceStorage_ea0cbb2e30fb4a85705038326e89196e_images_image-ab852823-a514-4f89-9c22-c8190d4b8385.png"
        )
        logo_path = assets / (
            "c__Users_Simeon_AppData_Roaming_Cursor_User_workspaceStorage_ea0cbb2e30fb4a85705038326e89196e_images_k1-afb4a7fb-9bf2-4d51-a8f0-3bc558ccde30.png"
        )

    front_bgr = cv2.imread(str(front_path), cv2.IMREAD_COLOR)
    back_bgr = cv2.imread(str(back_path), cv2.IMREAD_COLOR)
    if front_bgr is None or back_bgr is None:
        print("Failed to load jersey images", file=sys.stderr)
        sys.exit(1)

    front_tt = recolor_tt_national(front_bgr)
    back_tt = recolor_tt_national(back_bgr)

    front_pil = bgr_to_pil_rgb(front_tt)
    logo = Image.open(logo_path).convert("RGBA")

    front_with_logo = composite_logo(front_pil, logo)
    back_pil = bgr_to_pil_rgb(back_tt)

    sheet = stitch_horizontal(front_with_logo, back_pil)

    out = generated_png_dir() / "ludiz-style-jersey-tt-knight-riders-mockup.png"
    sheet.save(out, "PNG", optimize=True)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
