"""
Batch: recolor one jersey PNG into several Trinidad & Tobago (red / white / black) looks.
Writes to Desktop/TTPSSWA-generated-png/ — not public/.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generated_assets_dir import generated_png_dir  # noqa: E402
from recolor_jersey_tt import recolor_tt_national  # noqa: E402

STYLES: tuple[tuple[str, str], ...] = (
    ("tt-classic", "classic"),
    ("tt-midnight", "midnight"),
    ("tt-scarlet", "scarlet"),
    ("tt-obsidian", "obsidian"),
)


def main() -> None:
    if len(sys.argv) >= 2:
        inp = Path(sys.argv[1])
    else:
        inp = Path(
            r"C:\Users\Simeon\.cursor\projects\c-Users-Simeon-OneDrive-Documents\assets"
            r"\c__Users_Simeon_AppData_Roaming_Cursor_User_workspaceStorage_ea0cbb2e30fb4a85705038326e89196e_images_image-27ca4838-c50d-4339-afff-a4e31582ffc2.png"
        )
    bgr = cv2.imread(str(inp), cv2.IMREAD_COLOR)
    if bgr is None:
        print(f"Cannot read {inp}", file=sys.stderr)
        sys.exit(1)

    out_dir = generated_png_dir()
    stem = inp.stem
    if len(stem) > 36:
        stem = "jersey"
    written: list[Path] = []
    for slug, style in STYLES:
        out = recolor_tt_national(bgr, style=style)
        outp = out_dir / f"{stem}-{slug}.png"
        cv2.imwrite(str(outp), out, [cv2.IMWRITE_PNG_COMPRESSION, 6])
        written.append(outp)
    for p in written:
        print(p)


if __name__ == "__main__":
    main()
