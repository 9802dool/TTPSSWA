"use client";

import { useEffect, useRef, useState } from "react";

const slides = [
  {
    src: "/protective-arms-monarch-competition-2027.mp4",
    label: "Protective Arms Monarch Competition 2027",
  },
  {
    src: "/christmas-on-patrol-5k-2026.mp4",
    label: "Christmas on Patrol 5K 2026",
  },
] as const;

export function HeroVideoSlideshow() {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      if (index === active) {
        video.currentTime = 0;
        void video.play().catch(() => {});
        return;
      }
      video.pause();
    });
  }, [active]);

  return (
    <div className="relative aspect-[2560/730] w-full bg-navy" aria-roledescription="slideshow">
      {slides.map((slide, index) => (
        <video
          key={slide.src}
          ref={(node) => {
            videos.current[index] = node;
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            index === active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          muted
          playsInline
          preload="metadata"
          aria-label={slide.label}
          aria-hidden={index !== active}
          onEnded={() => {
            if (index !== active) return;
            setActive((current) => (current + 1) % slides.length);
          }}
        >
          <source src={slide.src} type="video/mp4" />
        </video>
      ))}
    </div>
  );
}
