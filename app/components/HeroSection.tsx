import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import type { Performance } from "../data/performances";
import { useYoutubeDuration } from "~/hooks/useYoutubeDuration";

interface HeroSectionProps {
  featuredItems: Performance[];
}

export function HeroSection({ featuredItems }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!featuredItems || featuredItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [featuredItems]);

  if (!featuredItems || featuredItems.length === 0) return null;

  const current = featuredItems[currentIndex];
  const displayedDuration = useYoutubeDuration(current.videoUrl);

  return (
    <section className="relative isolate min-h-[84vh] overflow-hidden bg-[var(--color-background)] sm:min-h-[88vh] lg:min-h-[86vh]">
      <div className="absolute inset-0" key={current.id}>
        <img src={current.thumbnail} alt={current.title} className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.22),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,5,3,0.96)_0%,rgba(7,5,3,0.78)_45%,rgba(7,5,3,0.25)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,5,3,0.08)_0%,rgba(7,5,3,0.72)_85%,rgba(7,5,3,1)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[84vh] max-w-6xl items-center px-3 pb-14 pt-20 sm:min-h-[88vh] sm:items-end sm:px-6 sm:pb-16 sm:pt-24 md:px-8 lg:max-w-6xl lg:px-8 lg:pb-14 xl:px-0" key={`content-${current.id}`}>
        <div className="w-full max-w-xl text-center sm:max-w-2xl sm:text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary-strong shadow-[0_0_25px_rgba(201,168,76,0.12)] sm:mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M4 7h16" />
              <path d="M7 3v4" />
              <path d="M17 3v4" />
              <rect x="4" y="5" width="16" height="15" rx="2" />
            </svg>
            <span>{current.category} • {current.id}</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold leading-[0.95] text-primary-soft drop-shadow-[0_4px_24px_rgba(201,168,76,0.18)] sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            {current.title}
          </h1>

          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm text-text-muted sm:mb-5 sm:justify-start sm:gap-3">
            <span className="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-strong">
              {current.category}
            </span>
            <span className="text-text-muted">•</span>
            <span>{displayedDuration}</span>
          </div>

          <p className="mx-auto mb-6 max-w-lg text-sm leading-7 text-text-secondary sm:mx-0 sm:mb-8 sm:text-base lg:text-lg">
            {current.description}
          </p>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start sm:gap-3">
            <Link to={`/watch/${current.id}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-background)] shadow-[0_10px_30px_rgba(201,168,76,0.24)] transition hover:-translate-y-0.5 hover:bg-primary-strong sm:px-5 sm:py-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M8 5v14l11-7z" />
              </svg>
              Putar Sekarang
            </Link>
            <Link to={`/watch/${current.id}`} className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-surface/80 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-text-primary backdrop-blur-sm transition hover:border-primary/60 hover:bg-[var(--color-surface)] sm:px-5 sm:py-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              Info Selengkapnya
            </Link>
          </div>
        </div>
      </div>

      {featuredItems.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {featuredItems.map((item, idx) => (
            <button
              key={item.id}
              className={`h-2.5 rounded-full transition ${idx === currentIndex ? "w-8 bg-primary shadow-[0_0_16px_rgba(201,168,76,0.35)]" : "w-2.5 bg-white/45"}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
