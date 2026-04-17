"""Shared folder for generated PNGs (not committed under public/)."""
from pathlib import Path


def generated_png_dir() -> Path:
    """C:\\Users\\<you>\\Desktop\\TTPSSWA-generated-png (created if missing)."""
    d = Path.home() / "Desktop" / "TTPSSWA-generated-png"
    d.mkdir(parents=True, exist_ok=True)
    return d
