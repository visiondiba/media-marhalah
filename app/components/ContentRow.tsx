import { useRef } from "react";
import { Link } from "@remix-run/react";
import { ContentCard } from "./ContentCard";
import type { Performance } from "../data/performances";

interface ContentRowProps {
  title: string;
  performances: Performance[];
  seeAllLink?: string;
}

export function ContentRow({ title, performances, seeAllLink }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth + 40 : scrollLeft + clientWidth - 40;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (performances.length === 0) return null;

  return (
    <section className="mx-auto mb-8 max-w-7xl px-3 sm:px-6 lg:px-8">
      <div className="mb-3 flex items-start justify-between gap-3 sm:items-center">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-soft sm:text-base">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-strong transition hover:bg-primary/20">
            Lihat Semua
          </Link>
        )}
      </div>

      <div className="relative">
        <button className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-[#0A0804]/95 text-primary-strong shadow-lg backdrop-blur sm:flex" onClick={() => scroll("left")} aria-label="Scroll left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="overflow-x-auto pb-2 pl-0 pr-0 sm:pl-8 sm:pr-8" ref={rowRef}>
          <div className="flex flex-nowrap justify-start gap-3">
            {performances.map((perf, index) => (
              <ContentCard key={perf.id} performance={perf} index={index} variant="row" />
            ))}
          </div>
        </div>

        <button className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/30 bg-[#0A0804]/95 text-primary-strong shadow-lg backdrop-blur sm:flex" onClick={() => scroll("right")} aria-label="Scroll right">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </section>
  );
}
