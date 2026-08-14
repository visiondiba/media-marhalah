import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { getStoredLicense, clearLicense, type LicenseInfo } from "~/utils/auth";
import { LicenseModal } from "./LicenseModal";
import { useAuth } from "~/hooks/useAuth";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"activate" | "info">("activate");
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { user, signOut } = useAuth();

  // Active menu tab index for sliding liquid glass pill selector
  let activeTab = 0;
  if (location.pathname === "/") activeTab = 0;
  else if (location.pathname === "/gallery") activeTab = 1;
  else if (location.pathname === "/browse") activeTab = 2;

  // Apple-style Live Drag & Snap Pill Gesture State
  const dockRef = useRef<HTMLDivElement>(null);
  const [isPillDragging, setIsPillDragging] = useState(false);
  const [livePillPercent, setLivePillPercent] = useState<number | null>(null);

  const calculateTabFromClientX = (clientX: number) => {
    if (!dockRef.current) return null;
    const rect = dockRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left - 6; // Subtract left padding
    const usableWidth = rect.width - 12;
    const percent = Math.max(0, Math.min(1, relativeX / usableWidth));
    return percent;
  };

  const handleDockTouchStart = (e: React.TouchEvent) => {
    const percent = calculateTabFromClientX(e.touches[0].clientX);
    if (percent !== null) {
      setIsPillDragging(true);
      setLivePillPercent(percent);
    }
  };

  const handleDockTouchMove = (e: React.TouchEvent) => {
    if (!isPillDragging) return;
    const percent = calculateTabFromClientX(e.touches[0].clientX);
    if (percent !== null) {
      setLivePillPercent(percent);
    }
  };

  const handleDockTouchEnd = () => {
    if (isPillDragging && livePillPercent !== null) {
      let targetTab = 0;
      if (livePillPercent > 0.66) targetTab = 2;
      else if (livePillPercent > 0.33) targetTab = 1;
      else targetTab = 0;

      if (targetTab === 0 && (activeTab !== 0 || isModalOpen)) {
        setIsModalOpen(false);
        navigate("/");
      } else if (targetTab === 1 && (activeTab !== 1 || isModalOpen)) {
        setIsModalOpen(false);
        navigate("/browse");
      } else if (targetTab === 2 && !isModalOpen) {
        setModalMode(user ? "info" : "activate");
        setIsModalOpen(true);
      }
    }
    setIsPillDragging(false);
    setLivePillPercent(null);
  };

  const handleDockMouseDown = (e: React.MouseEvent) => {
    const percent = calculateTabFromClientX(e.clientX);
    if (percent !== null) {
      setIsPillDragging(true);
      setLivePillPercent(percent);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPillDragging) return;
      const percent = calculateTabFromClientX(e.clientX);
      if (percent !== null) {
        setLivePillPercent(percent);
      }
    };

    const handleMouseUp = () => {
      if (!isPillDragging) return;
      handleDockTouchEnd();
    };

    if (isPillDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPillDragging, livePillPercent, activeTab, isModalOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    setLicense(getStoredLicense());
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setLicense(getStoredLicense());
  }, [user]);

  const handleSuccess = (planName: string) => {
    setLicense(getStoredLicense());
  };

  const handleLogout = async () => {
    await signOut();
    clearLicense();
    setLicense(null);
  };

  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  return (
    <>
      <nav className={`fixed inset-x-3 top-3 z-50 mx-auto flex h-14 max-w-7xl items-center justify-between px-3 transition-all duration-300 sm:top-4 sm:h-16 sm:px-6 rounded-full border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-3xl ${scrolled || !isHome
          ? "bg-zinc-950/75 border-white/25 shadow-[0_16px_45px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)]"
          : "bg-zinc-950/45"
        }`}>
        <div className="flex flex-1 items-center justify-start gap-3">
          <Link to="/" className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1.5 shadow-[0_0_20px_rgba(201,168,76,0.12)] transition hover:scale-105">
            <div className="flex h-7 w-7 items-center justify-center sm:h-8 sm:w-8">
              <img src="/logo.png" alt="Logo" />
            </div>
            <h1 className="hidden text-base font-black lowercase text-primary-soft sm:inline">
              catalyst<span className="text-primary uppercase">stream</span>
            </h1>
          </Link>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-all focus-within:border-primary/50 focus-within:bg-white/10 focus-within:shadow-[0_0_20px_rgba(201,168,76,0.2)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-primary-strong">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Cari penampilan..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-28 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted transition-all focus:w-44 sm:w-40 sm:focus:w-56"
              />
            </div>
          </form>
        </div>

        <div className="hidden sm:flex flex-1 items-center justify-center gap-4">
          <Link
            to="/gallery"
            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${location.pathname === "/gallery"
                ? "border border-primary/60 bg-primary/25 text-primary-strong"
                : "border border-white/20 bg-white/5 text-text-muted hover:border-primary/40 hover:bg-primary/15 hover:text-primary-strong"
              }`}
          >
            Galeri
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
            <button
              onClick={() => {
                setModalMode("info");
                setIsModalOpen(true);
              }}
              className="hidden rounded-full border border-primary/40 bg-primary/15 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-strong transition hover:border-primary/60 hover:bg-primary/25 sm:flex sm:items-center sm:gap-2"
              title="Lihat info lisensi"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <path d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17z" />
                <path d="M12 12v-2" />
                <path d="M12 16h.01" />
              </svg>
              <span>{user.user_metadata?.full_name || user.email?.split("@")[0] || "Akun Google"}</span>
            </button>
          ) : (
            <button className="hidden rounded-full border border-primary/40 bg-primary px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-background)] shadow-[0_4px_16px_rgba(212,175,55,0.3)] transition hover:scale-105 hover:bg-primary-strong sm:flex sm:items-center sm:gap-2" onClick={() => {
              setModalMode("activate");
              setIsModalOpen(true);
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V8a4 4 0 1 1 8 0v2" />
              </svg>
              <span>Aktivasi Lisensi</span>
            </button>
          )}

          {user && (
            <button onClick={handleLogout} className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 transition hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300" aria-label="Logout" title="Logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Apple-style Segmented Control Liquid Glass Sliding Bottom Bar */}
      <div
        ref={dockRef}
        onTouchStart={handleDockTouchStart}
        onTouchMove={handleDockTouchMove}
        onTouchEnd={handleDockTouchEnd}
        onMouseDown={handleDockMouseDown}
        className={`fixed inset-x-4 bottom-4 z-[60] flex items-center justify-between rounded-[26px] border border-white/20 bg-zinc-950/60 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-3xl sm:hidden overflow-hidden select-none touch-none cursor-pointer transition-transform duration-300 ${isPillDragging ? "scale-[0.98] border-primary/40 shadow-[0_20px_50px_rgba(212,175,55,0.25)]" : "scale-100"
          }`}
      >
        {/* Liquid Glass Sliding Active Pill Indicator */}
        <div
          className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-12px)/3)] rounded-[20px] border border-primary/40 bg-gradient-to-b from-white/30 via-white/10 to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_4px_20px_rgba(212,175,55,0.35)] pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(${isPillDragging && livePillPercent !== null
                ? livePillPercent * 200
                : (isModalOpen ? 2 : activeTab) * 100
              }%, 0, 0) ${isPillDragging ? 'scale(1.06, 0.94)' : 'scale(1, 1)'}`,
            transition: isPillDragging
              ? 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1)'
              : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        />

        {/* Beranda Button */}
        <Link
          to="/"
          className={`relative z-10 flex flex-1 flex-col items-center justify-center py-1.5 text-[10px] font-semibold tracking-wider transition-all duration-300 ${!isModalOpen && activeTab === 0 ? "text-primary-strong font-bold scale-105" : "text-text-muted hover:text-white"
            }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={!isModalOpen && activeTab === 0 ? "2.2" : "1.8"} className="mb-0.5 h-5 w-5 transition-transform duration-300">
            <path d="M4 10.5 12 4l8 6.5" />
            <path d="M7 10.5V20h10V10.5" />
          </svg>
          <small className="tracking-widest">BERANDA</small>
        </Link>

        {/* Galeri Button */}
        <Link
          to="/gallery"
          className={`relative z-10 flex flex-1 flex-col items-center justify-center py-1.5 text-[10px] font-semibold tracking-wider transition-all duration-300 ${!isModalOpen && activeTab === 1 ? "text-primary-strong font-bold scale-105" : "text-text-muted hover:text-white"
            }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={!isModalOpen && activeTab === 1 ? "2.2" : "1.8"} className="mb-0.5 h-5 w-5 transition-transform duration-300">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <small className="tracking-widest">GALERI</small>
        </Link>

        {/* Lisensi Button */}
        <button
          className={`relative z-10 flex flex-1 flex-col items-center justify-center py-1.5 text-[10px] font-semibold tracking-wider transition-all duration-300 ${isModalOpen ? "text-primary-strong font-bold scale-105" : "text-text-muted hover:text-white"
            }`}
          onClick={() => {
            setModalMode(user ? "info" : "activate");
            setIsModalOpen(true);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isModalOpen ? "2.2" : "1.8"} className="mb-0.5 h-5 w-5 transition-transform duration-300">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V8a4 4 0 1 1 8 0v2" />
          </svg>
          <small className="tracking-widest">LISENSI</small>
        </button>
      </div>

      <LicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        mode={modalMode}
        license={license}
      />
    </>
  );
}
