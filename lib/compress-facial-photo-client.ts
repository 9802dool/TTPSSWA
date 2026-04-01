/** Client-only: must run in browser (canvas). Matches API limit in member-signup route. */
export const MEMBER_FACIAL_PHOTO_MAX_BYTES = 900 * 1024;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Shrinks large camera / gallery images to JPEG under maxBytes when needed.
 */
export async function compressFacialPhotoToMaxBytes(
  file: File,
  maxBytes: number,
): Promise<File> {
  if (file.size <= maxBytes && ALLOWED.has(file.type)) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Could not read this image. Try JPG, PNG, or WebP, or use “Choose file” instead.",
    );
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  const maxDim = 1920;
  let cw = bitmap.width;
  let ch = bitmap.height;
  const fit = Math.min(1, maxDim / Math.max(cw, ch));
  cw = Math.round(cw * fit);
  ch = Math.round(ch * fit);

  const tryExport = (w: number, h: number, q: number) => {
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(bitmap, 0, 0, w, h);
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", q);
    });
  };

  for (let round = 0; round < 24; round++) {
    let quality = 0.9;
    while (quality >= 0.35) {
      const blob = await tryExport(cw, ch, quality);
      if (blob && blob.size <= maxBytes) {
        bitmap.close();
        return new File([blob], "facial-photo.jpg", { type: "image/jpeg" });
      }
      quality -= 0.06;
    }
    cw = Math.max(160, Math.round(cw * 0.88));
    ch = Math.max(160, Math.round(ch * 0.88));
    if (cw <= 160 && ch <= 160) break;
  }

  bitmap.close();
  throw new Error(
    "Photo is still too large after compression. Try a simpler background or use “Choose file” with a smaller image.",
  );
}
