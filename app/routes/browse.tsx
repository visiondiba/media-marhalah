import { useState, useMemo } from "react";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { CategoryFilter } from "~/components/CategoryFilter";
import { ContentCard } from "~/components/ContentCard";
import { getPerformancesByCategory, type Category } from "~/data/performances";

const CATEGORIES: Category[] = ["Semua", "Seni Musik", "Seni Tari", "Seni Rupa", "Seni Bahasa", "Non-Performance"];

export default function Browse() {
  const [activeCategory, setActiveCategory] = useState<Category>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  const performances = useMemo(() => {
    let filtered = getPerformancesByCategory(activeCategory);
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.artist.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [activeCategory, searchQuery]);
  
  return (
    <div className="browse-page">
      <Navbar />
      
      <header className="browse-header">
        <h1 className="browse-title">Jelajahi</h1>
        <p className="browse-subtitle">Temukan penampilan luar biasa dari Panggung Gembira</p>
        
        <div className="ornamental-divider">
          <div className="ornamental-diamond"></div>
        </div>
        
        <div className="search-bar-browse">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Cari penampilan, seniman, atau kategori..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>
      
      <CategoryFilter 
        categories={CATEGORIES} 
        activeCategory={activeCategory} 
        onSelect={setActiveCategory} 
      />
      
      <main className="main-content">
        {performances.length > 0 ? (
          <div className="cards-grid">
            {performances.map((perf, idx) => (
              <ContentCard key={perf.id} performance={perf} index={idx} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Tidak ada penampilan yang sesuai dengan pencarian Anda.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
