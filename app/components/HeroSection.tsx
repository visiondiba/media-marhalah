import { useState, useEffect, useRef } from "react";
import { Link } from "@remix-run/react";
import type { Performance } from "../data/performances";
import { useYoutubeDuration } from "~/hooks/useYoutubeDuration";

function encodeBase64Id(value: string) {
  const normalized = value.trim();
  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.from(normalized).toString("base64url");
    } catch {
      // fallback
    }
  }
  if (typeof btoa !== "undefined") {
    const binary = unescape(encodeURIComponent(normalized));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return normalized;
}

interface HeroSectionProps {
  featuredItems: Performance[];
}

function HeroSlide({ item, isActive }: { item: Performance; isActive: boolean }) {
  const displayedDuration = useYoutubeDuration(item.videoUrl);

  return (
    <div
      className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isActive
          ? "opacity-100 scale-100 z-10 pointer-events-auto"
          : "opacity-0 scale-105 z-0 pointer-events-none"
      }`}
    >
      {/* Background Image & Vignette Gradients */}
      <div className="absolute inset-0">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="h-full w-full object-cover object-center transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.22),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,5,3,0.96)_0%,rgba(7,5,3,0.78)_45%,rgba(7,5,3,0.25)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,3,0.08)_0%,rgba(7,5,3,0.72)_85%,rgba(7,5,3,1)_100%)]" />
      </div>

      {/* Content Text Overlay */}
      <div className="relative z-10 mx-auto flex min-h-[84vh] max-w-6xl items-center px-4 pb-14 pt-20 sm:min-h-[88vh] sm:items-end sm:px-6 sm:pb-16 sm:pt-24 md:px-8 lg:max-w-6xl lg:px-8 lg:pb-14 xl:px-0">
        <div
          className={`w-full max-w-xl text-center transition-all duration-700 delay-150 sm:max-w-2xl sm:text-left ${
            isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary-strong shadow-[0_0_25px_rgba(201,168,76,0.12)] sm:mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M4 7h16" />
              <path d="M7 3v4" />
              <path d="M17 3v4" />
              <rect x="4" y="5" width="16" height="15" rx="2" />
            </svg>
            <span>{item.category} • {item.id}</span>
          </div>

          <h1 className="mb-3 text-3xl font-bold leading-[0.95] text-primary-soft drop-shadow-[0_4px_24px_rgba(201,168,76,0.18)] sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            {item.title}
          </h1>

          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm text-text-muted sm:mb-5 sm:justify-start sm:gap-3">
            <span className="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-strong">
              {item.category}
            </span>
            <span className="text-text-muted">•</span>
            <span>{displayedDuration}</span>
          </div>

          <p className="mx-auto mb-6 max-w-lg text-sm leading-7 text-text-secondary sm:mx-0 sm:mb-8 sm:text-base lg:text-lg">
            {item.description}
          </p>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start sm:gap-3">
            <Link
              to={`/watch/${encodeBase64Id(item.id)}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-background)] shadow-[0_10px_30px_rgba(201,168,76,0.3)] transition hover:-translate-y-0.5 hover:bg-primary-strong sm:px-6 sm:py-3.5"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M8 5v14l11-7z" />
              </svg>
              Putar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ featuredItems }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (diff > 35) {
      // Swipe left -> Next
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    } else if (diff < -35) {
      // Swipe right -> Prev
      setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
    }
    touchStartXRef.current = null;
  };

  useEffect(() => {
    if (!featuredItems || featuredItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [featuredItems]);

  if (!featuredItems || featuredItems.length === 0) return null;

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative isolate min-h-[84vh] w-full overflow-hidden bg-[var(--color-background)] sm:min-h-[88vh] lg:min-h-[86vh] select-none"
    >
      {/* Slides Stack */}
      {featuredItems.map((item, idx) => (
        <HeroSlide key={item.id} item={item} isActive={idx === currentIndex} />
      ))}

      {/* Desktop Arrow Navigation */}
      {featuredItems.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
            className="absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 p-3.5 text-white backdrop-blur-md transition hover:scale-110 hover:border-primary/50 hover:bg-black/70 sm:flex"
            aria-label="Previous Slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredItems.length)}
            className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 p-3.5 text-white backdrop-blur-md transition hover:scale-110 hover:border-primary/50 hover:bg-black/70 sm:flex"
            aria-label="Next Slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Dots / Segmented Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {featuredItems.map((item, idx) => (
              <button
                key={item.id}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  idx === currentIndex
                    ? "w-8 bg-primary shadow-[0_0_18px_rgba(201,168,76,0.6)]"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
