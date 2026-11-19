"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ffprobe: both files are 2560×730. That ratio is the layout, so a phone
 * shows the whole flyer instead of object-cover cropping the sides.
 * object-contain is what iOS Safari actually honors on <video>.
 */
const VIDEO_WIDTH = 2560;
const VIDEO_HEIGHT = 730;

const slides = [
  {
    src: "/protective-arms-monarch-competition-2027.mp4",
    poster: "/posters/protective-arms-monarch-competition-2027.jpg",
    label: "Protective Arms Monarch Competition 2027",
  },
  {
    src: "/christmas-on-patrol-5k-2026.mp4",
    poster: "/posters/christmas-on-patrol-5k-2026.jpg",
    label: "Christmas on Patrol 5K 2026",
  },
] as const;

export function HeroVideoSlideshow() {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      if (index === active) {
        video.currentTime = 0;
        void video.play().catch(() => {});
        return;
      }
      video.pause();
    });
  }, [active]);

  return (
    <div className="relative w-full bg-navy" aria-roledescription="slideshow">
      {/* In-flow frame. width/height reserve the real video ratio before playback. */}
      <img
        src={slides[active].poster}
        alt=""
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        className="block h-auto w-full bg-navy"
        aria-hidden
      />
      {slides.map((slide, index) => {
        const isActive = index === active;
        return (
          <video
            key={slide.src}
            ref={(node) => {
              videos.current[index] = node;
              if (!node) return;
              node.muted = true;
              node.defaultMuted = true;
            }}
            className={`absolute inset-0 h-full w-full bg-navy object-contain object-center transition-opacity duration-700 ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            poster={slide.poster}
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
            <source src={slide.src} type="video/mp4" />
          </video>
        );
      })}
    </div>
  );
}
