"use client";

import { useEffect, useRef, useState } from "react";

const PHONE_SRC = "/protective-arms-monarch-competition-2027-phone.mp4";
const PHONE_POSTER = "/posters/protective-arms-monarch-competition-2027-phone.jpg";
const PHONE_LABEL = "Protective Arms Monarch Competition 2027";

/** Desktop banners. Both files are 2560×730. Phones do not use these. */
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

function PhoneHero() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.muted = true;
    node.defaultMuted = true;
    void node.play().catch(() => {});
  }, []);

  return (
    <div className="relative aspect-square w-full bg-navy md:hidden" aria-label={PHONE_LABEL}>
      <video
        ref={video}
        className="absolute inset-0 h-full w-full bg-navy object-contain"
        poster={PHONE_POSTER}
        width={960}
        height={960}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={PHONE_LABEL}
      >
        {/* media keeps desktop from fetching this file, and phones from the wide sources below */}
        <source src={PHONE_SRC} type="video/mp4" media="(max-width: 767px)" />
      </video>
    </div>
  );
}

function DesktopSlideshow() {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      if (index === active) {
        video.currentTime = 0;
        void video.play().catch(() => {});
        return;
      }
      video.pause();
    });
  }, [active]);

  return (
    <div className="relative hidden aspect-[2560/730] w-full bg-navy md:block" aria-roledescription="slideshow">
      {slides.map((slide, index) => (
        <video
          key={slide.src}
          ref={(node) => {
            videos.current[index] = node;
            if (!node) return;
            node.muted = true;
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
          <source src={slide.src} type="video/mp4" media="(min-width: 768px)" />
        </video>
      ))}
    </div>
  );
}

export function HeroVideoSlideshow() {
  return (
    <>
      <PhoneHero />
      <DesktopSlideshow />
    </>
  );
}
