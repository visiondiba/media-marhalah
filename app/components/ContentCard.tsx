import { Link } from "@remix-run/react";
import type { Performance } from "../data/performances";

interface ContentCardProps {
  performance: Performance;
  index: number;
}

export function ContentCard({ performance, index }: ContentCardProps) {
  return (
    <Link to={`/watch/${performance.id}`} className="card">
      <div className="card-thumb">
        <img src={performance.thumbnail} alt={performance.title} loading="lazy" />
        <div className="card-num">{String(index + 1).padStart(2, '0')}</div>
        <div className="card-overlay">
          <div className="play-btn-overlay">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="card-category">{performance.category}</div>
        <h3 className="card-title">{performance.title}</h3>
        <div className="card-meta">
          <span>{performance.duration}</span>
          <span className="card-meta-dot">•</span>
          <span>{performance.artist}</span>
        </div>
      </div>
    </Link>
  );
}
