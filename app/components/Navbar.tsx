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
      <nav className={`fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-3 transition sm:px-8 lg:px-10 ${scrolled || !isHome ? "border-b border-primary/25 bg-[#080603]/95 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="flex flex-1 items-center justify-start gap-3">
          <Link to="/" className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1.5 shadow-[0_0_20px_rgba(201,168,76,0.08)]">
            <div className="flex h-8 w-8 items-center justify-center">
              <img src="logo.png" alt="Logo" />
            </div>
            <h1 className="hidden text-large font-black lowercase  text-primary-soft sm:inline">
              impervious <span className="text-[#C9A84C]">play.</span>
            </h1>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-primary/20 bg-surface/70 p-1 sm:flex">
            <Link to="/" className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${location.pathname === "/" ? "bg-primary/20 text-primary-strong" : "text-text-muted hover:text-text-primary"}`}>
              Beranda
            </Link>
            <Link to="/browse" className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${location.pathname === "/browse" ? "bg-primary/20 text-primary-strong" : "text-text-muted hover:text-text-primary"}`}>
              Browse
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          {license ? (
            <div className="hidden rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-strong sm:flex sm:items-center sm:gap-2" title={`Kode: ${license.code}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <path d="M7 10V8a5 5 0 1 1 10 0v2" />
                <rect x="5" y="10" width="14" height="9" rx="2" />
              </svg>
              <span>{license.planName}</span>
            </div>
          ) : (
            <button className="hidden rounded-full border border-primary/40 bg-primary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#060402] transition hover:bg-primary-strong sm:flex sm:items-center sm:gap-2" onClick={() => setIsModalOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V8a4 4 0 1 1 8 0v2" />
              </svg>
              <span>Aktivasi Lisensi</span>
            </button>
          )}

          <Link to="/browse" className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-text-muted transition hover:border-primary/50 hover:bg-primary/20 hover:text-primary-strong" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </Link>
        </div>
      </nav>

      <div className="fixed inset-x-3 bottom-3 z-[60] flex items-center justify-around rounded-full border border-[#C9A84C]/25 bg-[#0A0804]/95 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:hidden">
        <Link to="/" className={`flex flex-1 flex-col items-center rounded-full px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${location.pathname === "/" ? "bg-primary/15 text-primary-strong" : "text-text-muted"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mb-1 h-4 w-4">
            <path d="M4 10.5 12 4l8 6.5" />
            <path d="M7 10.5V20h10V10.5" />
          </svg>
          <small>Beranda</small>
        </Link>
        <Link to="/browse" className={`flex flex-1 flex-col items-center rounded-full px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${location.pathname === "/browse" ? "bg-primary/15 text-primary-strong" : "text-text-muted"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mb-1 h-4 w-4">
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
          </svg>
          <small>Browse</small>
        </Link>
        <button className="flex flex-1 flex-col items-center rounded-full px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted" onClick={() => setIsModalOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mb-1 h-4 w-4">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V8a4 4 0 1 1 8 0v2" />
          </svg>
          <small>Lisensi</small>
        </button>
      </div>

      <LicenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />
    </>
  );
}
