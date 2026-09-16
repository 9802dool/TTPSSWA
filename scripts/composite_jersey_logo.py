"""
Composite Knight Riders logo onto jersey mockup; remove blue arrows; replace chest
and hem graphics with shard texture sampled from jersey side panels.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np


def _blue_raw(bgr: np.ndarray) -> np.ndarray:
    b, g, r = cv2.split(bgr)
    m = (
        (b.astype(np.int16) - r > 55)
        & (b.astype(np.int16) - g > 35)
        & (b > 115)
        & (b < 255)
    )
    return (m.astype(np.uint8)) * 255


def blue_arrow_centroids(bgr: np.ndarray) -> list[tuple[float, float]]:
    m = _blue_raw(bgr)
    n, labels, stats, cents = cv2.connectedComponentsWithStats(m, connectivity=8)
    out: list[tuple[float, float]] = []
    for i in range(1, n):
        area = int(stats[i, cv2.CC_STAT_AREA])
        if 400 < area < 8000:
            out.append((float(cents[i][0]), float(cents[i][1])))
    out.sort(key=lambda p: p[1])
    return out


def blue_arrow_mask(bgr: np.ndarray) -> np.ndarray:
    m = _blue_raw(bgr)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    keep = np.zeros_like(m)
    for i in range(1, n):
        area = int(stats[i, cv2.CC_STAT_AREA])
        if 400 < area < 8000:
            keep[labels == i] = 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    keep = cv2.dilate(keep, k, iterations=3)
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, k)
    return keep


def inpaint_arrows(bgr: np.ndarray, mask: np.ndarray) -> np.ndarray:
    return cv2.inpaint(bgr, mask, inpaintRadius=5, flags=cv2.INPAINT_NS)


def logo_bgra_from_white_bg(bgr: np.ndarray) -> np.ndarray:
    """Remove near-white background via corner flood fills; preserve interior whites."""
    h, w = bgr.shape[:2]
    work = bgr.copy()
    mask_ff = np.zeros((h + 2, w + 2), np.uint8)
    lo = (14, 14, 14)
    hi = (14, 14, 14)
    for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        cv2.floodFill(work, mask_ff, seed, (255, 0, 255), lo, hi, flags=cv2.FLOODFILL_FIXED_RANGE)
    bg = np.all(work == (255, 0, 255), axis=2)
    b, g, r = cv2.split(bgr.astype(np.float32))
    dist = np.sqrt((255.0 - b) ** 2 + (255.0 - g) ** 2 + (255.0 - r) ** 2)
    alpha = np.clip(dist / 38.0 * 255.0, 0, 255).astype(np.float32)
    alpha[bg] = 0.0
    near = (b > 246) & (g > 246) & (r > 246) & ~bg
    alpha[near] = np.minimum(alpha[near], 55.0)
    bgra = cv2.merge(
        [
            bgr[:, :, 0].astype(np.float32),
            bgr[:, :, 1].astype(np.float32),
            bgr[:, :, 2].astype(np.float32),
            alpha,
        ]
    )
    return np.clip(bgra, 0, 255).astype(np.uint8)


def soft_ellipse_alpha(h: int, w: int) -> np.ndarray:
    """Float mask ~1 in center, smooth falloff at edges (no rectangular seams)."""
    m = np.zeros((h, w), np.float32)
    ax = max(w // 2 - 4, 1)
    ay = max(h // 2 - 4, 1)
    cv2.ellipse(m, (w // 2, h // 2), (ax, ay), 0, 0, 360, 1.0, -1)
    m = cv2.GaussianBlur(m, (0, 0), sigmaX=max(w, h) * 0.085)
    peak = float(m.max())
    if peak > 1e-6:
        m /= peak
    m = np.clip(m, 0.0, 1.0)
    return m[..., np.newaxis]


def paste_shard_region(
    canvas_bgr: np.ndarray,
    patch_bgr: np.ndarray,
    x1: int,
    y1: int,
    x2: int,
    y2: int,
    strength: float = 0.88,
) -> None:
    """Overlay resized side-panel shard with soft elliptical alpha (avoids seamlessClone blur boxes)."""
    x1, x2 = sorted((max(0, x1), min(canvas_bgr.shape[1], x2)))
    y1, y2 = sorted((max(0, y1), min(canvas_bgr.shape[0], y2)))
    rw, rh = x2 - x1, y2 - y1
    if rw < 24 or rh < 24:
        return
    tex = cv2.resize(patch_bgr, (rw, rh), interpolation=cv2.INTER_AREA).astype(np.float32)
    roi = canvas_bgr[y1:y2, x1:x2].astype(np.float32)
    a = soft_ellipse_alpha(rh, rw) * float(strength)
    blended = roi * (1.0 - a) + tex * a
    canvas_bgr[y1:y2, x1:x2] = np.clip(blended, 0, 255).astype(np.uint8)


def paste_rgba_over(
    canvas_bgr: np.ndarray,
    bgra: np.ndarray,
    cx: int,
    cy: int,
) -> None:
    """Center (cx, cy) in image coords; paste RGBA logo."""
    lh, lw = bgra.shape[:2]
    x0 = int(cx - lw // 2)
    y0 = int(cy - lh // 2)
    H, W = canvas_bgr.shape[:2]

    sx0 = max(0, x0)
    sy0 = max(0, y0)
    sx1 = min(W, x0 + lw)
    sy1 = min(H, y0 + lh)
    if sx0 >= sx1 or sy0 >= sy1:
        return

    lx0 = sx0 - x0
    ly0 = sy0 - y0
    lx1 = lx0 + (sx1 - sx0)
    ly1 = ly0 + (sy1 - sy0)

    crop_l = bgra[ly0:ly1, lx0:lx1]
    crop_c = canvas_bgr[sy0:sy1, sx0:sx1]
    a = (crop_l[:, :, 3].astype(np.float32) / 255.0)[..., None]
    bgr = crop_l[:, :, :3].astype(np.float32)
    crop_c[:, :, :] = np.clip(
        crop_c.astype(np.float32) * (1.0 - a) + bgr * a, 0, 255
    ).astype(np.uint8)


def main() -> None:
    if len(sys.argv) < 4:
        print(
            "Usage: python composite_jersey_logo.py <jersey.png> <logo.png> <out.png>",
            file=sys.stderr,
        )
        sys.exit(1)
    jersey_path = Path(sys.argv[1])
    logo_path = Path(sys.argv[2])
    out_path = Path(sys.argv[3])

    jersey = cv2.imread(str(jersey_path), cv2.IMREAD_COLOR)
    logo = cv2.imread(str(logo_path), cv2.IMREAD_COLOR)
    if jersey is None or logo is None:
        print("Failed to read input image(s).", file=sys.stderr)
        sys.exit(1)

    H, W = jersey.shape[:2]

    mask = blue_arrow_mask(jersey)
    centers = blue_arrow_centroids(jersey)
    base = inpaint_arrows(jersey, mask)

    # Side-panel shard texture: mirror left + right strips for richer noise
    y0, y1 = int(H * 0.22), int(H * 0.78)
    left_patch = base[y0:y1, int(W * 0.06) : int(W * 0.20)]
    right_patch = base[y0:y1, int(W * 0.80) : int(W * 0.94)]
    if left_patch.size == 0:
        left_patch = base[y0:y1, 0 : int(W * 0.18)]
    if right_patch.size == 0:
        right_patch = base[y0:y1, int(W * 0.82) : W]
    shard = np.hstack(
        [
            left_patch,
            cv2.flip(right_patch, 1) if right_patch.size else left_patch,
        ]
    )

    # Replace diagonal-slash chest zone + bottom chevrons with side-panel shard style
    paste_shard_region(
        base,
        shard,
        int(W * 0.42),
        int(H * 0.18),
        int(W * 0.92),
        int(H * 0.42),
        strength=0.9,
    )
    paste_shard_region(
        base,
        shard,
        int(W * 0.34),
        int(H * 0.64),
        int(W * 0.66),
        int(H * 0.82),
        strength=0.88,
    )

    # Logo: white bg removed, scaled to ~22% of jersey width
    bgra = logo_bgra_from_white_bg(logo)
    target_w = int(W * 0.22)
    scale = target_w / bgra.shape[1]
    new_h = max(1, int(bgra.shape[0] * scale))
    bgra_rs = cv2.resize(bgra, (target_w, new_h), interpolation=cv2.INTER_LANCZOS4)

    # Chest: upper-arrow centroid — logo center sits slightly below the arrow tip
    if len(centers) >= 1:
        tip_x, tip_y = centers[0]
        cx = int(tip_x)
        cy = int(tip_y + H * 0.085)
    else:
        cx, cy = int(W * 0.77), int(H * 0.27)
    paste_rgba_over(base, bgra_rs, cx, cy)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out_path), base, [cv2.IMWRITE_PNG_COMPRESSION, 3])
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
