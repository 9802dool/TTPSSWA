"use client";

import { useEffect, useRef, useState } from "react";
import {
  MEMBER_FACIAL_PHOTO_MAX_BYTES,
  compressFacialPhotoToMaxBytes,
} from "@/lib/compress-facial-photo-client";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-800 dark:text-slate-800";

type Props = {
  formId: string;
};

export function MembershipFacialPhotoPanel({ formId }: Props) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const facialPhotoInputRef = useRef<HTMLInputElement>(null);
  const cameraCaptureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;
    const onFormReset = () => {
      setPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setPhotoError(null);
    };
    form.addEventListener("reset", onFormReset);
    return () => form.removeEventListener("reset", onFormReset);
  }, [formId]);

  async function applyFacialPhotoFile(file: File | undefined) {
    if (!file) return;
    setPhotoError(null);
    try {
      const processed = await compressFacialPhotoToMaxBytes(
        file,
        MEMBER_FACIAL_PHOTO_MAX_BYTES,
      );
      const dt = new DataTransfer();
      dt.items.add(processed);
      const input = facialPhotoInputRef.current;
      if (input) {
        input.files = dt.files;
      }
      setPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(processed);
      });
    } catch (e) {
      setPhotoError(
        e instanceof Error ? e.message : "Could not use this photo. Try again.",
      );
      const input = facialPhotoInputRef.current;
      if (input) input.value = "";
      setPhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }

  return (
    <div className="mt-4 w-full border-t border-slate-300 pt-4 dark:border-slate-300">
      <label htmlFor="facialPhoto" className={labelClass}>
        Upload photo <span className="text-red-600">*</span>
      </label>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
        Clear, recent face photo. JPG, PNG, or WebP. Maximum{" "}
        <span className="font-bold text-slate-800">900 KB</span>.
      </p>

      <div className="mt-3 rounded-sm border border-slate-300 bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-700 dark:bg-slate-50">
        <p className="font-bold uppercase tracking-wide text-slate-900">Tips</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>Face the camera — look straight into the lens</li>
          <li>Keep your head straight, not tilted</li>
          <li>Use good, even light</li>
        </ul>
      </div>

      {/* Hidden input that opens the front camera on phones */}
      <input
        ref={cameraCaptureInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          void applyFacialPhotoFile(f);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          className="w-full rounded-sm border-2 border-slate-900 bg-slate-900 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-slate-800"
          onClick={() => {
            setPhotoError(null);
            cameraCaptureInputRef.current?.click();
          }}
        >
          Take your picture
        </button>
        <p className="text-center text-[10px] font-medium uppercase tracking-wide text-slate-500">
          or choose a file below
        </p>
      </div>

      <input
        ref={facialPhotoInputRef}
        id="facialPhoto"
        form={formId}
        name="facialPhoto"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        className="mt-2 block w-full border border-slate-400 bg-white px-2 py-2 text-sm text-slate-700 file:mr-3 file:rounded-sm file:border file:border-slate-400 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-slate-900 hover:file:bg-slate-200"
        onChange={(e) => {
          void applyFacialPhotoFile(e.target.files?.[0]);
        }}
      />

      {photoPreview ? (
        <div className="mt-3 rounded-sm border border-slate-400 bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-700">
            Photo attached
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- preview blob URL */}
          <img
            src={photoPreview}
            alt="Preview of your facial photo"
            className="mt-2 max-h-48 w-auto max-w-full rounded-sm border border-slate-300 object-contain"
          />
        </div>
      ) : null}

      {photoError ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {photoError}
        </p>
      ) : null}
    </div>
  );
}
