import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { VideoPlayer } from "~/components/VideoPlayer";
import { LicenseModal } from "~/components/LicenseModal";
import { getPerformanceById, getRelatedPerformances } from "~/data/performances.server";
import { getStoredLicense, fetchUserLicense, saveLicense, type LicenseInfo } from "~/utils/auth";
import { fetchVideoDuration } from "~/utils/youtube";
import { useAuth } from "~/hooks/useAuth";
import { supabase } from "~/utils/supabase";

export async function loader({ params }: LoaderFunctionArgs) {
  const performance = params.id ? await getPerformanceById(params.id) : null;

  if (!performance) {
    return json({ performance: null, related: [] });
  }

  const related = await getRelatedPerformances(performance.category, performance.id);

  return json({ performance, related });
}

export default function Watch() {
  const { performance, related } = useLoaderData<typeof loader>();
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    setLicense(getStoredLicense());
  }, []);

  useEffect(() => {
    const checkDbLicense = async () => {
      if (user && !license) {
        const dbLicense = await fetchUserLicense(user.id);
        if (dbLicense) {
          saveLicense(dbLicense);
          setLicense(dbLicense);
        }
      }
    };
    if (!isAuthLoading) {
      checkDbLicense();
    }
  }, [user, license, isAuthLoading]);

  // Reaction State (Like / Dislike)
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(null);
  const [youtubeDuration, setYoutubeDuration] = useState<string | null>(null);

  useEffect(() => {
    const fetchReactions = async () => {
      if (!performance) return;

      const { data: reactionsData } = await supabase
        .from("reactions")
        .select("type")
        .eq("performance_id", performance.id);

      if (reactionsData) {
        const likes = reactionsData.filter((r) => r.type === "like").length;
        const dislikes = reactionsData.filter((r) => r.type === "dislike").length;
        setLikesCount(likes);
        setDislikesCount(dislikes);
      }

      if (user) {
        const { data: userReact } = await supabase
          .from("reactions")
          .select("type")
          .eq("performance_id", performance.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (userReact) {
          setUserReaction(userReact.type as "like" | "dislike");
        } else {
          setUserReaction(null);
        }
      } else {
        setUserReaction(null);
      }
    };

    fetchReactions();
  }, [performance, user]);

  const handleReaction = async (type: "like" | "dislike") => {
    if (!performance) return;
    if (!user) {
      setIsModalOpen(true);
      return;
    }

    const prevReaction = userReaction;

    // Optimistic UI Update
    if (prevReaction === type) {
      setUserReaction(null);
      if (type === "like") setLikesCount(prev => Math.max(0, prev - 1));
      else setDislikesCount(prev => Math.max(0, prev - 1));

      await supabase
        .from("reactions")
        .delete()
        .eq("performance_id", performance.id)
        .eq("user_id", user.id);
    } else {
      setUserReaction(type);
      if (type === "like") {
        setLikesCount(prev => prev + 1);
        if (prevReaction === "dislike") setDislikesCount(prev => Math.max(0, prev - 1));
      } else {
        setDislikesCount(prev => prev + 1);
        if (prevReaction === "like") setLikesCount(prev => Math.max(0, prev - 1));
      }

      await supabase
        .from("reactions")
        .upsert({
          performance_id: performance.id,
          user_id: user.id,
          type,
          created_at: new Date().toISOString()
        }, { onConflict: "user_id,performance_id" });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [performance?.id]);

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

  const relatedPerformances = related ?? [];

  const handleLicenseSuccess = () => {
    setLicense(getStoredLicense());
  };

  const isYouTubeUrl = !!performance.videoUrl?.match(/(?:youtube\.com\/|youtu\.be\/|youtube-nocookie\.com\/)/);

  useEffect(() => {
    let isCancelled = false;

    if (!performance?.videoUrl || !isYouTubeUrl) {
      setYoutubeDuration(null);
      return;
    }

    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY ?? process.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) return;

    fetchVideoDuration(performance.videoUrl, apiKey)
      .then((duration) => {
        if (!isCancelled && duration) {
          setYoutubeDuration(duration);
        }
      })
      .catch(() => {
        if (!isCancelled) setYoutubeDuration(null);
      });

    return () => {
      isCancelled = true;
    };
  }, [performance?.videoUrl, isYouTubeUrl]);

  const displayedDuration = youtubeDuration ?? "--:--";

  return (
    <div className="min-h-screen bg-[#0A0804] pt-16 text-[#F5E8C0]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-3 pb-16 pt-2 sm:px-6 md:pb-24 md:pt-4 lg:px-12 lg:pt-8">
        <div className="overflow-hidden rounded-2xl border border-[#C9A84C]/20 bg-[#16130A] shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:rounded-[28px] md:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          {license ? (
            performance.videoUrl ? (
              <div className="relative">
                <VideoPlayer key={performance.id} sourceUrl={performance.videoUrl} posterUrl={performance.thumbnail} title={performance.title} />
                {isYouTubeUrl ? (
                  <div
                    className="pointer-events-auto absolute inset-x-0 top-0 h-24 z-50 bg-transparent"
                    aria-hidden="true"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  />
                ) : null}
              </div>
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
            <h1 className="text-xl font-semibold uppercase tracking-[0.08em] text-[#F5DFA0] sm:text-2xl md:text-3xl lg:text-4xl">
              {performance.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#B8A57A] sm:text-sm sm:gap-3">
              <span className="rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E8C96A]">
                {performance.category}
              </span>
              <span>•</span>
              <span>{displayedDuration}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
              {license ? (
                <></>
              ) : (
                <button className="inline-flex items-center gap-1 rounded-full bg-[#C9A84C] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0A0804] transition hover:bg-[#E8C96A] sm:gap-2 sm:px-4 sm:py-3 sm:text-sm" onClick={() => setIsModalOpen(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Masukkan Kode Lisensi
                </button>
              )}

              {/* Like / Dislike Buttons */}
              <div className="flex items-center rounded-full border border-[#C9A84C]/20 bg-white/5 p-1">
                <button
                  onClick={() => handleReaction("like")}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition sm:gap-1.5 sm:px-4 sm:py-2 sm:text-xs ${userReaction === "like"
                    ? "bg-[#C9A84C] text-[#0A0804]"
                    : "text-[#F5E8C0] hover:bg-white/10"
                    }`}
                >
                  <svg viewBox="0 0 24 24" fill={userReaction === "like" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-3 w-3 sm:h-4 sm:w-4">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  <span>{likesCount}</span>
                </button>

                <div className="h-4 w-[1px] bg-[#C9A84C]/20 mx-1"></div>

                <button
                  onClick={() => handleReaction("dislike")}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition sm:gap-1.5 sm:px-4 sm:py-2 sm:text-xs ${userReaction === "dislike"
                    ? "bg-red-500/80 text-white"
                    : "text-[#F5E8C0] hover:bg-white/10"
                    }`}
                >
                  <svg viewBox="0 0 24 24" fill={userReaction === "dislike" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-3 w-3 sm:h-4 sm:w-4">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                  </svg>
                  <span>{dislikesCount}</span>
                </button>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#D9C08F] sm:text-base sm:leading-8">{performance.description}</p>
          </main>

          <aside className="mt-6 rounded-xl border border-[#C9A84C]/15 bg-[#16130A]/80 p-4 md:mt-8 md:rounded-[24px] md:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F5E8C0] sm:text-sm">Rekomendasi Terkait</h3>
            <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {related.length > 0 ? related.map((item) => (
                <Link to={`/watch/${item.id}`} key={item.id} className="flex gap-2 rounded-lg border border-transparent p-1.5 transition hover:border-[#C9A84C]/20 hover:bg-[#C9A84C]/10 sm:gap-3 sm:rounded-[18px] sm:p-2">
                  <div className="h-14 w-16 shrink-0 overflow-hidden rounded-[10px] bg-[#0A0804] sm:h-20 sm:w-24 sm:rounded-[14px]">
                    <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#A07830] sm:text-[10px]">{item.category}</div>
                    <h4 className="mt-0.5 line-clamp-2 text-xs font-semibold uppercase tracking-[0.02em] text-[#F5E8C0] sm:mt-1 sm:text-sm">{item.title}</h4>
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
