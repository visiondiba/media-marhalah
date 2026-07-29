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
      <div className="min-h-screen bg-[#0A0804] pt-16 text-[#F5E8C0]">
        <Navbar />
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 text-6xl font-black tracking-[0.2em] text-[#C9A84C]">404</div>
          <h2 className="mb-6 text-2xl font-semibold uppercase tracking-[0.12em] text-[#F5DFA0]">
            Penampilan tidak ditemukan
          </h2>
          <Link to="/browse" className="rounded-full bg-[#C9A84C] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-[#E8C96A]">
            Kembali ke Browse
          </Link>
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
    <div className="min-h-screen bg-[#0A0804] pt-16 text-[#F5E8C0]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-8 lg:px-12 lg:pt-8">
        <div className="overflow-hidden rounded-[28px] border border-[#C9A84C]/20 bg-[#16130A] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          {license ? (
            performance.videoUrl ? (
              <VideoPlayer sourceUrl={performance.videoUrl} posterUrl={performance.thumbnail} title={performance.title} />
            ) : (
              <div className="relative aspect-video overflow-hidden bg-[#0A0804]">
                <img src={performance.thumbnail} alt={performance.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0804]/80 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A84C] text-[#0A0804] shadow-[0_0_30px_rgba(201,168,76,0.35)]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="relative aspect-video overflow-hidden bg-[#0A0804]">
              <img src={performance.thumbnail} alt={performance.title} className="h-full w-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-[#0A0804]/70" />
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="w-full max-w-md rounded-[24px] border border-[#C9A84C]/20 bg-[#16130A]/90 p-6 text-center shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#E8C96A]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                        <rect x="3" y="7" width="18" height="13" rx="2" />
                        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold uppercase tracking-[0.16em] text-[#F5DFA0]">Konten Terkunci</h3>
                  <p className="mt-2 text-sm leading-6 text-[#B8A57A]">
                    Masukkan kode tiket / lisensi eksklusif Anda untuk memutar video pertunjukan ini.
                  </p>
                  <button className="mt-5 rounded-full bg-[#C9A84C] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-[#E8C96A]" onClick={() => setIsModalOpen(true)}>
                    Masukkan Kode Akses
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <main>
            <h1 className="text-3xl font-semibold uppercase tracking-[0.08em] text-[#F5DFA0] sm:text-4xl">
              {performance.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#B8A57A]">
              <span className="rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E8C96A]">
                {performance.category}
              </span>
              <span>•</span>
              <span>{performance.year}</span>
              <span>•</span>
              <span>{performance.duration}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {license ? (
                <button className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-[#E8C96A]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Putar
                </button>
              ) : (
                <button className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-[#E8C96A]" onClick={() => setIsModalOpen(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Masukkan Kode Lisensi
                </button>
              )}
              <button className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#F5E8C0] transition hover:border-[#C9A84C]/50 hover:bg-white/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Simpan
              </button>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#D9C08F]">{performance.description}</p>

            <div className="mt-8 rounded-[24px] border border-[#C9A84C]/15 bg-[#16130A]/80 p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A07830]">Menampilkan</div>
              <div className="mt-2 text-lg font-semibold uppercase tracking-[0.08em] text-[#E8C96A]">{performance.artist}</div>
            </div>
          </main>

          <aside className="rounded-[24px] border border-[#C9A84C]/15 bg-[#16130A]/80 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#F5E8C0]">Rekomendasi Terkait</h3>
            <div className="mt-4 space-y-3">
              {related.length > 0 ? related.map((item) => (
                <Link to={`/watch/${item.id}`} key={item.id} className="flex gap-3 rounded-[18px] border border-transparent p-2 transition hover:border-[#C9A84C]/20 hover:bg-[#C9A84C]/10">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[#0A0804]">
                    <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A07830]">{item.category}</div>
                    <h4 className="mt-1 line-clamp-2 text-sm font-semibold uppercase tracking-[0.02em] text-[#F5E8C0]">{item.title}</h4>
                    <div className="mt-1 text-xs text-[#8E7546]">{item.artist}</div>
                  </div>
                </Link>
              )) : (
                <div className="text-sm text-[#8E7546]">Belum ada rekomendasi terkait.</div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />

      <LicenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleLicenseSuccess} />
    </div>
  );
}
