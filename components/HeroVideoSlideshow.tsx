"use client";

import { useEffect, useRef, useState } from "react";

/** Wide banners are 2560×730 (ffprobe). Phone art is optional per slide. */
const WIDE_WIDTH = 2560;
const WIDE_HEIGHT = 730;

type HeroSlide = {
  src: string;
  poster: string;
  width: number;
  height: number;
  label: string;
  /** Used below the `md` breakpoint (768px). */
  mobileSrc?: string;
  mobilePoster?: string;
  mobileWidth?: number;
  mobileHeight?: number;
};

const slides: HeroSlide[] = [
  {
    src: "/protective-arms-monarch-competition-2027.mp4",
    poster: "/posters/protective-arms-monarch-competition-2027.jpg",
    width: WIDE_WIDTH,
    height: WIDE_HEIGHT,
    label: "Protective Arms Monarch Competition 2027",
    mobileSrc: "/protective-arms-monarch-competition-2027-mobile.mp4",
    mobilePoster: "/posters/protective-arms-monarch-competition-2027-mobile.jpg",
    mobileWidth: 1080,
    mobileHeight: 1350,
  },
  {
    src: "/christmas-on-patrol-5k-2026.mp4",
    poster: "/posters/christmas-on-patrol-5k-2026.jpg",
    width: WIDE_WIDTH,
    height: WIDE_HEIGHT,
    label: "Christmas on Patrol 5K 2026",
  },
];

type Variant = "wide" | "mobile";

function slideHasMobile(slide: HeroSlide): boolean {
  return Boolean(slide.mobileSrc && slide.mobilePoster && slide.mobileWidth && slide.mobileHeight);
}

export function HeroVideoSlideshow() {
  const videos = useRef<Record<string, HTMLVideoElement | null>>({});
  const [active, setActive] = useState(0);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    Object.entries(videos.current).forEach(([key, video]) => {
      if (!video) return;
      const [indexText, kind] = key.split(":");
      const index = Number(indexText);
      const slide = slides[index];
      const playMobile = narrow && slideHasMobile(slide);
      const shouldPlay =
        index === active && ((playMobile && kind === "mobile") || (!playMobile && kind === "wide"));
      video.muted = true;
      video.defaultMuted = true;
      if (shouldPlay) {
        video.currentTime = 0;
        void video.play().catch(() => {});
        return;
      }
      video.pause();
    });
  }, [active, narrow]);

  const activeSlide = slides[active];
  const activeHasMobile = slideHasMobile(activeSlide);

  return (
    <div className="relative w-full bg-navy" aria-roledescription="slideshow">
      <img
        src={activeSlide.poster}
        alt=""
        width={activeSlide.width}
        height={activeSlide.height}
        className={
          activeHasMobile
            ? "hidden h-auto w-full bg-navy md:block"
            : "block h-auto w-full bg-navy"
        }
        aria-hidden
      />
      {activeHasMobile ? (
        <img
          src={activeSlide.mobilePoster}
          alt=""
          width={activeSlide.mobileWidth}
          height={activeSlide.mobileHeight}
          className="block h-auto w-full bg-navy md:hidden"
          aria-hidden
        />
      ) : null}
      {slides.map((slide, index) => {
        const isActive = index === active;
        const variants: { kind: Variant; src: string; poster: string; width: number; height: number; hideClass: string }[] =
          [
            {
              kind: "wide",
              src: slide.src,
              poster: slide.poster,
              width: slide.width,
              height: slide.height,
              hideClass: slideHasMobile(slide) ? "hidden md:block" : "",
            },
          ];
        if (slideHasMobile(slide)) {
          variants.push({
            kind: "mobile",
            src: slide.mobileSrc!,
            poster: slide.mobilePoster!,
            width: slide.mobileWidth!,
            height: slide.mobileHeight!,
            hideClass: "md:hidden",
          });
        }
        return variants.map((variant) => (
          <video
            key={`${slide.label}-${variant.kind}`}
            ref={(node) => {
              videos.current[`${index}:${variant.kind}`] = node;
              if (!node) return;
              node.muted = true;
              node.defaultMuted = true;
            }}
            className={`absolute inset-0 h-full w-full bg-navy object-contain object-center transition-opacity duration-700 ${variant.hideClass} ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            width={variant.width}
            height={variant.height}
            poster={variant.poster}
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-label={slide.label}
            aria-hidden={!isActive}
            onEnded={() => {
              if (!isActive) return;
              setActive((current) => (current + 1) % slides.length);
            }}
          >
            <source src={variant.src} type="video/mp4" />
          </video>
        ));
      })}
    </div>
  );
}
