import { Link } from "@remix-run/react";
import type { Performance } from "../data/performances";
import { useYoutubeDuration } from "~/hooks/useYoutubeDuration";

interface ContentCardProps {
  performance: Performance;
  index: number;
  variant?: "row" | "grid";
}

export function ContentCard({ performance, index, variant = "row" }: ContentCardProps) {
  const isGrid = variant === "grid";
  const displayedDuration = useYoutubeDuration(performance.videoUrl);

  return (
    <Link
      to={`/watch/${performance.id}`}
      className={`group overflow-hidden rounded-[16px] border border-primary/20 bg-[rgba(18,16,10,0.92)] shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_12px_30px_rgba(201,168,76,0.16)] ${isGrid
        ? "w-full shrink-0 snap-start"
        : "mx-auto w-[86vw] max-w-[260px] shrink-0 snap-start sm:mx-0 sm:w-[320px] sm:max-w-none lg:w-[300px]"
        }`}
    >
      <div className="relative aspect-video overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.22),_transparent_60%),linear-gradient(135deg,_#1a140d_0%,_#0a0804_100%)]">
        <img
          src={performance.thumbnail}
          alt={performance.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = "https://images.unsplash.com/photo-1492691527719-0d8b575c4db0?auto=format&fit=crop&w=900&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0804]/95 via-[#0A0804]/20 to-transparent" />
        <div className="absolute left-2.5 top-2.5 rounded-full border border-primary/30 bg-[#0A0804]/75 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary-strong backdrop-blur">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="absolute bottom-2.5 right-2.5 rounded-md border border-primary/20 bg-[#0A0804]/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-strong backdrop-blur">
          {displayedDuration}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-[#0A0804] shadow-[0_0_24px_rgba(201,168,76,0.3)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-3.5">
        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-primary-strong/80">
          {performance.category}
        </div>
        <h3 className="mb-1.5 line-clamp-2 text-[12px] font-semibold uppercase tracking-[0.02em] text-text-primary sm:text-[13px] leading-[1.35]">
          {performance.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-text-muted sm:text-[11px]">
          <span className="font-medium text-primary-strong/80">{performance.category}</span>
        </div>
      </div>
    </Link>
  );
}
