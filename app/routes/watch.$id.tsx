import { useState, useEffect } from "react";
import { useParams, Link } from "@remix-run/react";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { VideoPlayer } from "~/components/VideoPlayer";
import { LicenseModal } from "~/components/LicenseModal";
import { getPerformanceById, getPerformancesByCategory } from "~/data/performances";
import { getStoredLicense, type LicenseInfo } from "~/utils/auth";

export default function Watch() {
  const { id } = useParams();
  const performance = getPerformanceById(id || "");
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLicense(getStoredLicense());
  }, []);

  if (!performance) {
    return (
      <div className="watch-page">
        <Navbar />
        <div className="not-found">
          <div className="not-found-code">404</div>
          <h2 className="not-found-msg">Penampilan tidak ditemukan</h2>
          <Link to="/browse" className="btn-primary">Kembali ke Browse</Link>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Get related performances (same category, excluding current)
  const related = getPerformancesByCategory(performance.category)
    .filter(p => p.id !== performance.id)
    .slice(0, 4);

  const handleLicenseSuccess = () => {
    setLicense(getStoredLicense());
  };
  
  return (
    <div className="watch-page">
      <Navbar />
      
      <div className="watch-player-container">
        {license ? (
          performance.videoUrl ? (
            <VideoPlayer 
              sourceUrl={performance.videoUrl} 
              posterUrl={performance.thumbnail} 
              title={performance.title} 
            />
          ) : (
            <div className="watch-player">
              <img src={performance.thumbnail} alt={performance.title} className="watch-player-img" />
              <div className="watch-player-overlay">
                <button className="play-btn-large">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="watch-player access-gated">
            <img src={performance.thumbnail} alt={performance.title} className="watch-player-img blur-bg" />
            <div className="access-gate-overlay">
              <div className="access-gate-card glass">
                <div className="access-gate-icon">🔒</div>
                <h3 className="access-gate-title">KONTEN TERKUNCI</h3>
                <p className="access-gate-desc">
                  Masukkan Kode Tiket / Lisensi Eksklusif Anda untuk memutar video pertunjukan ini.
                </p>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                  ✨ Masukkan Kode Akses
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="watch-info">
        <main className="watch-main">
          <h1 className="watch-title">{performance.title}</h1>
          
          <div className="watch-meta">
            <span className="hero-category">{performance.category}</span>
            <span className="hero-dot">•</span>
            <span className="hero-year">{performance.year}</span>
            <span className="hero-dot">•</span>
            <span className="hero-duration">{performance.duration}</span>
          </div>
          
          <div className="watch-actions">
            {license ? (
              <button className="btn-primary">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Putar
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                🔒 Masukkan Kode Lisensi
              </button>
            )}
            <button className="btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              Simpan
            </button>
          </div>
          
          <p className="watch-desc">{performance.description}</p>
          
          <div className="watch-artist-section">
            <div className="watch-artist-label">Menampilkan</div>
            <div className="watch-artist-name">{performance.artist}</div>
          </div>
        </main>
        
        <aside className="watch-sidebar">
          <h3 className="watch-sidebar-title">Rekomendasi Terkait</h3>
          
          <div className="related-list">
            {related.length > 0 ? related.map((item) => (
              <Link to={`/watch/${item.id}`} key={item.id} className="related-item">
                <div className="related-thumb">
                  <img src={item.thumbnail} alt={item.title} />
                </div>
                <div className="related-info">
                  <div className="related-category">{item.category}</div>
                  <h4 className="related-title">{item.title}</h4>
                  <div className="related-artist">{item.artist}</div>
                </div>
              </Link>
            )) : (
              <div className="text-muted" style={{ fontSize: '12px' }}>Belum ada rekomendasi terkait.</div>
            )}
          </div>
        </aside>
      </div>
      
      <Footer />

      <LicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLicenseSuccess}
      />
    </div>
  );
}
