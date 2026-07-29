import { useState, useEffect } from "react";
import { Link, useLocation } from "@remix-run/react";
import { getStoredLicense, type LicenseInfo } from "~/utils/auth";
import { LicenseModal } from "./LicenseModal";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    setLicense(getStoredLicense());
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSuccess = (planName: string) => {
    setLicense(getStoredLicense());
  };

  return (
    <>
      <nav className={`navbar ${scrolled || !isHome ? "scrolled" : ""}`}>
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear)"/>
                <path d="M2 17L12 22L22 17" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="url(#paint2_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E8C96A"/>
                    <stop offset="1" stopColor="#A07830"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="12" y1="17" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E8C96A"/>
                    <stop offset="1" stopColor="#A07830"/>
                  </linearGradient>
                  <linearGradient id="paint2_linear" x1="12" y1="12" x2="12" y2="17" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E8C96A"/>
                    <stop offset="1" stopColor="#A07830"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">MEDIA PANGGUNG GEMBIRA</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>Beranda</Link>
            <Link to="/browse" className={`nav-link ${location.pathname === "/browse" ? "active" : ""}`}>Browse</Link>
          </div>
        </div>
        
        <div className="nav-right">
          {license ? (
            <div className="license-badge-nav active" title={`Kode: ${license.code}`}>
              <span className="badge-icon">✨</span>
              <span className="badge-text">{license.planName}</span>
            </div>
          ) : (
            <button className="license-badge-nav inactive" onClick={() => setIsModalOpen(true)}>
              <span className="badge-icon">🔒</span>
              <span className="badge-text">Aktivasi Lisensi</span>
            </button>
          )}

          <Link to="/browse" className="nav-icon-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </Link>
        </div>
      </nav>

      <LicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
