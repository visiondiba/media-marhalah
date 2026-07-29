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
    <div className="content-row">
      <div className="row-header">
        <h2 className="row-title">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="row-see-all">Lihat Semua</Link>
        )}
      </div>
      
      <div className="scroll-row-wrapper">
        <button className="scroll-arrow scroll-arrow-left" onClick={() => scroll("left")} aria-label="Scroll left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <div className="scroll-row" ref={rowRef}>
          {performances.map((perf, index) => (
            <ContentCard key={perf.id} performance={perf} index={index} />
          ))}
        </div>
        
        <button className="scroll-arrow scroll-arrow-right" onClick={() => scroll("right")} aria-label="Scroll right">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}
