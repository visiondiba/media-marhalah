import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import type { Performance } from "../data/performances";

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

  return (
    <div className="hero">
      <div className="hero-bg" key={current.id}>
        <img src={current.thumbnail} alt={current.title} className="hero-img" />
        <div className="hero-gradient"></div>
        <div className="hero-side-gradient"></div>
      </div>
      
      <div className="hero-content" key={`content-${current.id}`}>
        <div className="hero-badge">
          {current.category} • {current.id}
        </div>
        <h1 className="hero-title">{current.title}</h1>
        
        <div className="hero-meta">
          <span className="hero-category">{current.category}</span>
          <span className="hero-dot">•</span>
          <span className="hero-year">{current.year}</span>
          <span className="hero-dot">•</span>
          <span className="hero-duration">{current.duration}</span>
          {current.views && (
            <>
              <span className="hero-dot">•</span>
              <span className="hero-views">{current.views.toLocaleString()} Penonton</span>
            </>
          )}
        </div>
        
        <p className="hero-desc">{current.description}</p>
        
        <div className="hero-actions">
          <Link to={`/watch/${current.id}`} className="btn-primary">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Putar Sekarang
          </Link>
          <Link to={`/watch/${current.id}`} className="btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Info Selengkapnya
          </Link>
        </div>
      </div>

      {/* Hero Carousel Indicators */}
      {featuredItems.length > 1 && (
        <div className="hero-indicators">
          {featuredItems.map((item, idx) => (
            <button
              key={item.id}
              className={`hero-dot-indicator ${idx === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
