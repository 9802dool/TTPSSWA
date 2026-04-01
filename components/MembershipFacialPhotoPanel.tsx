"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BlazeFaceModel } from "@tensorflow-models/blazeface";
import {
  MEMBER_FACIAL_PHOTO_MAX_BYTES,
  compressFacialPhotoToMaxBytes,
} from "@/lib/compress-facial-photo-client";
import {
  analyzeFacePose,
  poseHintMessage,
  type PoseHint,
} from "@/lib/membership-facial-pose";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-800 dark:text-slate-800";

const STABLE_FRAMES_NEEDED = 15;

type Props = {
  formId: string;
};

export function MembershipFacialPhotoPanel({ formId }: Props) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [liveOpen, setLiveOpen] = useState(false);
  const [poseHint, setPoseHint] = useState<PoseHint>("loading");
  const [stableProgress, setStableProgress] = useState(0);
  const [liveLoading, setLiveLoading] = useState(false);

  const facialPhotoInputRef = useRef<HTMLInputElement>(null);
  const cameraCaptureInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const applyFileRef = useRef<(file: File) => Promise<void>>(async () => {});
  /** Set while live camera effect is active — triggers immediate capture */
  const manualCaptureRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    applyFileRef.current = async (file: File) => {
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
    };
  });

  const stopLiveUi = useCallback(() => {
    setLiveOpen(false);
    setLiveLoading(false);
    setPoseHint("loading");
    setStableProgress(0);
  }, []);

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
    await applyFileRef.current(file);
  }

  useEffect(() => {
    if (!liveOpen) return;

    const cancelled = { current: false };
    const streamRef: { current: MediaStream | null } = { current: null };
    const modelRef: { current: BlazeFaceModel | null } = { current: null };
    let rafId: number | null = null;
    let running = true;
    let inferBusy = false;
    let lastInfer = 0;
    let stableCount = 0;
    let captureOnce = false;

    function cleanupHardware() {
      running = false;
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const v = videoRef.current;
      if (v) v.srcObject = null;
      modelRef.current?.dispose();
      modelRef.current = null;
    }

    async function runCapture() {
      if (captureOnce) return;
      const video = videoRef.current;
      if (!video || video.videoWidth < 2) return;
      captureOnce = true;
      running = false;
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        captureOnce = false;
        return;
      }
      ctx.drawImage(video, 0, 0);

      await new Promise<void>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "facial-photo.jpg", {
                type: "image/jpeg",
              });
              void applyFileRef.current(file);
            }
            resolve();
          },
          "image/jpeg",
          0.92,
        );
      });

      cleanupHardware();
      stopLiveUi();
    }

    manualCaptureRef.current = () => {
      void runCapture();
    };

    setPoseHint("loading");
    setLiveLoading(true);
    setStableProgress(0);

    void (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("NO_CAMERA_API");
        }
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
        if (cancelled.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }

        const tf = await import("@tensorflow/tfjs");
        await tf.ready();
        const blazeface = await import("@tensorflow-models/blazeface");
        if (cancelled.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const model = await blazeface.load();
        if (cancelled.current) {
          model.dispose();
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        modelRef.current = model;
        setLiveLoading(false);
        setPoseHint("noface");

        const tick = () => {
          if (!running || cancelled.current || captureOnce) return;
          rafId = requestAnimationFrame(tick);

          const now = performance.now();
          if (now - lastInfer < 85) return;
          lastInfer = now;

          if (inferBusy) return;
          const vid = videoRef.current;
          const m = modelRef.current;
          if (!vid || !m || vid.readyState < 2) return;

          inferBusy = true;
          void m
            .estimateFaces(vid, false, true, true)
            .then((faces) => {
              if (cancelled.current || captureOnce) return;
              const face = faces[0];
              const w = vid.videoWidth;
              const h = vid.videoHeight;
              const hint = analyzeFacePose(face, w, h);
              setPoseHint(hint);

              if (hint === "hold") {
                stableCount += 1;
                setStableProgress(
                  Math.min(
                    100,
                    Math.round((stableCount / STABLE_FRAMES_NEEDED) * 100),
                  ),
                );
                if (stableCount >= STABLE_FRAMES_NEEDED) {
                  void runCapture();
                }
              } else {
                stableCount = 0;
                setStableProgress(0);
              }
            })
            .catch(() => {
              setPoseHint("noface");
              stableCount = 0;
              setStableProgress(0);
            })
            .finally(() => {
              inferBusy = false;
            });
        };

        rafId = requestAnimationFrame(tick);
      } catch {
        if (!cancelled.current) {
          setPhotoError(
            "Could not open the camera. Allow camera access or use “Choose file” below.",
          );
          cleanupHardware();
          stopLiveUi();
          cameraCaptureInputRef.current?.click();
        }
      }
    })();

    /* Snapshot <video> on cleanup — ref is correct when modal unmounts */
    return () => {
      cancelled.current = true;
      manualCaptureRef.current = null;
      running = false;
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- read latest video node on unmount
      const v = videoRef.current;
      if (v) v.srcObject = null;
      modelRef.current?.dispose();
      modelRef.current = null;
    };
  }, [liveOpen, stopLiveUi]);

  return (
    <div className="mt-4 w-full border-t border-slate-300 pt-4 dark:border-slate-300">
      <label htmlFor="facialPhoto" className={labelClass}>
        Upload photo <span className="text-red-600">*</span>
      </label>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
        Clear, recent face photo. JPG, PNG, or WebP. Maximum{" "}
        <span className="font-bold text-slate-800">900 KB</span>.
      </p>

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
            setLiveOpen(true);
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

      {liveOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="live-camera-title"
            aria-busy={liveLoading}
            className="flex max-h-[100dvh] w-full max-w-lg flex-col bg-slate-950 sm:max-h-[90vh] sm:rounded-sm sm:border-2 sm:border-white"
          >
            <div className="border-b border-white/20 bg-slate-900 px-4 py-3">
              <h3
                id="live-camera-title"
                className="text-xs font-bold uppercase tracking-[0.14em] text-white"
              >
                Position your head
              </h3>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-200">
                Face the camera. Look straight ahead. Keep your head{" "}
                <strong className="text-white">level</strong> — not tilted to either
                side. When you&apos;re aligned, the photo is taken{" "}
                <strong className="text-white">automatically</strong>.
              </p>
            </div>

            <div className="relative aspect-[3/4] w-full bg-black sm:aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover [transform:scaleX(-1)]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12">
                <p className="text-center text-sm font-semibold text-white">
                  {liveLoading ? "Loading camera…" : poseHintMessage(poseHint)}
                </p>
                {!liveLoading && poseHint === "hold" ? (
                  <div className="mx-auto mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full bg-emerald-400 transition-[width] duration-100"
                      style={{ width: `${stableProgress}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2 border-t border-white/20 bg-slate-900 p-3">
              <button
                type="button"
                className="flex-1 rounded-sm border-2 border-white/40 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-white/10"
                onClick={() => {
                  stopLiveUi();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={liveLoading}
                className="flex-1 rounded-sm border-2 border-white bg-white px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                onClick={() => manualCaptureRef.current?.()}
              >
                Take photo now
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
