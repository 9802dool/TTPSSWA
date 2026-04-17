"""
Recolor jersey mockup to Trinidad & Tobago national palette (red, black, white).
Outputs go to Desktop\\TTPSSWA-generated-png by default — not under public/.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np

# Allow import when run as script
sys.path.insert(0, str(Path(__file__).resolve().parent))
from generated_assets_dir import generated_png_dir  # noqa: E402


def recolor_tt_national(bgr: np.ndarray, style: str = "classic") -> np.ndarray:
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    h = hsv[:, :, 0].astype(np.float32)
    s = hsv[:, :, 1].astype(np.float32)
    v = hsv[:, :, 2].astype(np.float32)

    b, g, r = cv2.split(bgr.astype(np.float32))
    mb = np.max(np.stack([b, g, r], axis=-1), axis=-1)
    mn = np.min(np.stack([b, g, r], axis=-1), axis=-1)
    chroma = mb - mn

    neutral = (chroma < 42) & (mb > 148)

    h2, s2, v2 = h.copy(), s.copy(), v.copy()

    blue = (~neutral) & (h >= 90) & (h <= 142)
    teal_green = (~neutral) & (h >= 36) & (h < 92)
    # Magenta / violet / hot pink (navy→pink gradient jerseys)
    purple_magenta = (~neutral) & (h > 142) & (h <= 179)
    # Orange / brown / rust (shadows on pink, or trim)
    orange_brown = (~neutral) & (h >= 4) & (h < 36)

    h2[blue] = np.clip(4.0 + (h[blue] - 90) * 0.06, 0, 14)
    s2[blue] = np.clip(s[blue] * 1.08 + 6, 0, 255)
    v2[blue] = np.clip(v[blue] * 1.01, 0, 255)

    h2[teal_green] = 4.0
    s2[teal_green] = np.clip(s[teal_green] * 0.52 + 12, 0, 130)
    v2[teal_green] = np.clip(v[teal_green] * 0.58 + 10, 32, 118)

    h2[purple_magenta] = np.clip(2.0 + (h[purple_magenta] - 150) * 0.15, 0, 12)
    s2[purple_magenta] = np.clip(s[purple_magenta] * 1.12 + 4, 0, 255)
    v2[purple_magenta] = np.clip(v[purple_magenta] * 1.02, 0, 255)

    h2[orange_brown] = 6.0
    s2[orange_brown] = np.clip(s[orange_brown] * 1.05 + 8, 0, 255)
    v2[orange_brown] = np.clip(v[orange_brown] * 0.98, 0, 255)

    h2[neutral] = h[neutral]
    s2[neutral] = s[neutral]
    v2[neutral] = v[neutral]

    colored = blue | teal_green | purple_magenta | orange_brown
    # Style tweaks — still only red / black / white family
    if style == "midnight":
        # Darker kit: deeper blacks, slightly muted reds
        v2[colored] = np.clip(v2[colored] * 0.88, 0, 255)
        s2[blue | purple_magenta] = np.clip(s2[blue | purple_magenta] * 0.94, 0, 255)
    elif style == "scarlet":
        # Brighter, punchier reds
        s2[blue | purple_magenta] = np.clip(s2[blue | purple_magenta] * 1.16, 0, 255)
        v2[blue | purple_magenta] = np.clip(v2[blue | purple_magenta] * 1.05, 0, 255)
    elif style == "obsidian":
        # More black in panels / accents; red body stays strong
        v2[teal_green | orange_brown] = np.clip(v2[teal_green | orange_brown] * 0.72, 0, 110)
        s2[teal_green] = np.clip(s2[teal_green] * 0.85, 0, 120)
    # classic: no extra pass

    out_hsv = np.stack(
        [
            np.clip(h2, 0, 179).astype(np.uint8),
            np.clip(s2, 0, 255).astype(np.uint8),
            np.clip(v2, 0, 255).astype(np.uint8),
        ],
        axis=-1,
    )
    out = cv2.cvtColor(out_hsv, cv2.COLOR_HSV2BGR)
    out = cv2.bilateralFilter(out, d=5, sigmaColor=55, sigmaSpace=55)
    return out


def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: python recolor_jersey_tt.py <input.png> [output.png]\n"
            "  If output omitted, writes to Desktop/TTPSSWA-generated-png/",
            file=sys.stderr,
        )
        sys.exit(1)
    inp = Path(sys.argv[1])
    if len(sys.argv) >= 3:
        outp = Path(sys.argv[2])
    else:
        outp = generated_png_dir() / "team-iatf-jersey-trinidad-national-colors.png"
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
