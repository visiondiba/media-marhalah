import { useState, useEffect, useCallback, useRef } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { LicenseModal } from "~/components/LicenseModal";
import { useAuth } from "~/hooks/useAuth";
import {
  listDriveFolder,
  ROOT_FOLDER_ID,
  type DriveFolder,
  type DrivePhoto,
  type BreadcrumbItem,
} from "~/utils/google-drive.server";

export const meta: MetaFunction = () => [
  { title: "Gallery — catalystSTREAM" },
  {
    name: "description",
    content: "Galeri foto dokumentasi Panggung Gembira Impervious Generation.",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const folderId = url.searchParams.get("folder") || ROOT_FOLDER_ID;
  const pageToken = url.searchParams.get("pageToken");

  try {
    const data = await listDriveFolder(folderId, pageToken);

    return json({ ...data, error: null });
  } catch (err) {
    const { logErrorOnce } = await import("~/utils/errorLogger.server");
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as any).message)
        : String(err);

    logErrorOnce(
      `gallery-loader-error-${folderId}-${message}`,
      `Gallery loader error for ${folderId}: ${message}`
    );

    return json({
      currentFolder: {
        id: folderId,
        name: "Gallery",
      },
      folders: [] as DriveFolder[],
      photos: [] as DrivePhoto[],
      breadcrumbs: [] as BreadcrumbItem[],
      nextPageToken: null,
      error: "fetch_failed",
    });
  }
}

export default function Gallery() {
  const initial = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [folders, setFolders] = useState<DriveFolder[]>(initial.folders);
  const [photos, setPhotos] = useState<DrivePhoto[]>(initial.photos);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>(initial.breadcrumbs);
  const [nextPageToken, setNextPageToken] = useState<string | null>(initial.nextPageToken);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(initial.error);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [lightbox, setLightbox] = useState<DrivePhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxLoaded, setLightboxLoaded] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  const currentFolderId = initial.currentFolder.id;


  useEffect(() => {
    setFolders(initial.folders);
    setPhotos(initial.photos);
    setBreadcrumbs(initial.breadcrumbs);
    setNextPageToken(initial.nextPageToken);
    setLoadError(initial.error);
    setLoadedImages({});
    setLightbox(null);
  }, [initial]);

  useEffect(() => {
    if (!isAuthLoading && !user) setShowLicenseModal(true);
    else setShowLicenseModal(false);
  }, [isAuthLoading, user]);

  const loadNextPage = useCallback(() => {
    if (
      !nextPageToken ||
      loadingMoreRef.current ||
      fetcher.state !== "idle"
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadError(null);

    const params = new URLSearchParams({
      folder: currentFolderId,
      pageToken: nextPageToken,
    });

    fetcher.load(`/gallery?${params.toString()}`);
  }, [
    currentFolderId,
    nextPageToken,
    fetcher,
  ]);

  useEffect(() => {
    if (fetcher.state !== "idle") {
      return;
    }

    if (!loadingMoreRef.current) {
      return;
    }

    const data = fetcher.data;

    if (!data) {
      return;
    }

    if (data.error) {
      setLoadError("Gagal memuat foto berikutnya.");
      loadingMoreRef.current = false;
      setLoadingMore(false);
      return;
    }

    const incoming: DrivePhoto[] =
      data.photos || [];

    setPhotos((current) => {
      const ids = new Set(
        current.map((photo) => photo.id)
      );

      return [
        ...current,
        ...incoming.filter(
          (photo) => !ids.has(photo.id)
        ),
      ];
    });

    setNextPageToken(
      data.nextPageToken || null
    );

    loadingMoreRef.current = false;
    setLoadingMore(false);
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadNextPage();
      },
      { rootMargin: "1200px 0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage]);

  const openFolder = (folderId: string) => {
    if (loadingMoreRef.current) return;
    navigate(`/gallery?folder=${encodeURIComponent(folderId)}`);
  };

  const openBreadcrumb = (folderId: string) => {
    if (loadingMoreRef.current) return;
    navigate(`/gallery?folder=${encodeURIComponent(folderId)}`);
  };

  const openLightbox = (photo: DrivePhoto, index: number) => {
    setLightbox(photo);
    setLightboxIndex(index);
    setLightboxLoaded(false);
  };

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    setLightboxLoaded(false);
  }, []);

  const prevPhoto = useCallback(() => {
    if (!photos.length) return;
    const index = (lightboxIndex - 1 + photos.length) % photos.length;
    setLightboxIndex(index);
    setLightbox(photos[index]);
    setLightboxLoaded(false);
  }, [lightboxIndex, photos]);

  const nextPhoto = useCallback(() => {
    if (!photos.length) return;
    const index = (lightboxIndex + 1) % photos.length;
    setLightboxIndex(index);
    setLightbox(photos[index]);
    setLightboxLoaded(false);
  }, [lightboxIndex, photos]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!lightbox) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") prevPhoto();
      if (event.key === "ArrowRight") nextPhoto();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, closeLightbox, prevPhoto, nextPhoto]);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <div className="min-h-screen bg-[#070503]">
      <LicenseModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        onSuccess={() => setShowLicenseModal(false)}
      />

      <Navbar />

      <main className="mx-auto max-w-7xl px-3 pb-24 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mb-7 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-strong">
            Dokumentasi
          </div>

          <h1 className="text-3xl font-black uppercase tracking-[0.06em] text-primary-soft sm:text-4xl lg:text-5xl">
            Photo Gallery
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-text-muted">
            Dokumentasi foto eksklusif Panggung Gembira Impervious Generation
          </p>
        </div>

        {/* BREADCRUMB */}
        <nav className="mb-7 overflow-x-auto" aria-label="Breadcrumb">
          <div className="flex min-w-max items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <div key={item.id} className="flex items-center gap-1">
                  {index > 0 && (
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-3.5 w-3.5 text-text-muted/40"
                    >
                      <path d="m7 4 5 6-5 6" />
                    </svg>
                  )}

                  <button
                    type="button"
                    disabled={isLast || loadingMore}
                    onClick={() => openBreadcrumb(item.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs transition ${isLast
                      ? "font-semibold text-primary"
                      : "text-text-muted hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {item.name}
                  </button>
                </div>
              );
            })}
          </div>
        </nav>

        {loadError === "fetch_failed" && (
          <div className="flex min-h-[35vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-text-muted">
              Gagal membaca folder Google Drive.
            </p>
            <p className="max-w-md text-xs text-text-muted/60">
              Pastikan service account mempunyai akses ke folder utama dan semua
              subfolder di dalamnya.
            </p>
          </div>
        )}

        {/* FOLDERS — shown even when there are zero photos */}
        {folders.length > 0 && (
          <section className="mb-9">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                Folder
              </h2>
              <span className="text-[10px] text-text-muted/50">
                {folders.length} folder
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  disabled={loadingMore}
                  onClick={() => openFolder(folder.id)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[0.06] disabled:opacity-50"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
                      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2h7A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
                    </svg>
                  </div>

                  <p className="line-clamp-2 text-sm font-semibold text-white/90">
                    {folder.name}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-text-muted/60">
                    Buka folder
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* PHOTOS */}
        {photos.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                Foto
              </h2>
              <span className="text-[10px] text-text-muted/50">
                {photos.length}{nextPageToken ? "+" : ""} foto
              </span>
            </div>

            <div className="columns-2 gap-2 sm:columns-3 sm:gap-3 md:columns-4 lg:columns-5">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group mb-2 break-inside-avoid cursor-pointer overflow-hidden rounded-xl sm:mb-3 sm:rounded-2xl"
                  onClick={() => openLightbox(photo, index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openLightbox(photo, index);
                    }
                  }}
                >
                  <div className="relative overflow-hidden rounded-xl bg-surface/30 sm:rounded-2xl">
                    {!loadedImages[photo.id] && (
                      <div className="absolute inset-0 z-10 flex min-h-[180px] items-center justify-center bg-surface/70 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                          <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
                            Loading
                          </span>
                        </div>
                      </div>
                    )}

                    <img
                      src={photo.thumbnailLink}
                      alt={photo.name}
                      loading="lazy"
                      decoding="async"
                      className={`block w-full object-cover transition-all duration-500 group-hover:scale-105 ${loadedImages[photo.id] ? "opacity-100" : "opacity-0"
                        }`}
                      onLoad={() =>
                        setLoadedImages((current) => ({
                          ...current,
                          [photo.id]: true,
                        }))
                      }
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        setLoadedImages((current) => ({
                          ...current,
                          [photo.id]: true,
                        }));
                      }}
                    />

                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 sm:rounded-2xl">
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                        <p className="line-clamp-2 text-[10px] font-medium text-white/90 sm:text-xs">
                          {photo.name.replace(/\.[^/.]+$/, "")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Infinite-scroll sentinel */}
        <div ref={sentinelRef} className="h-28 w-full" aria-hidden="true">
          {loadingMore && (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-text-muted">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                Memuat foto...
              </div>
            </div>
          )}
        </div>

        {loadError && loadError !== "fetch_failed" && photos.length > 0 && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-text-muted">{loadError}</p>
            <button
              type="button"
              onClick={loadNextPage}
              className="rounded-full border border-primary/30 px-4 py-2 text-xs text-primary hover:bg-primary/10"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!loadingMore && !nextPageToken && photos.length > 0 && (
          <p className="mt-2 text-center text-xs text-text-muted/50">
            Semua foto di folder ini telah dimuat
          </p>
        )}

        {!loadError && folders.length === 0 && photos.length === 0 && (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-text-muted/50">
                <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2h7A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
              </svg>
            </div>
            <p className="text-sm text-text-muted">Folder ini kosong.</p>
            <p className="text-xs text-text-muted/50">
              Belum ada foto atau subfolder di dalamnya.
            </p>
          </div>
        )}
      </main>

      <Footer />

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={closeLightbox}
        >
          {photos.length > 1 && (
            <button
              type="button"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-2xl text-white backdrop-blur-md sm:left-6 sm:h-12 sm:w-12"
              onClick={(event) => {
                event.stopPropagation();
                prevPhoto();
              }}
              aria-label="Sebelumnya"
            >
              ‹
            </button>
          )}

          <div
            className="relative max-h-[90vh] max-w-[92vw] sm:max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            {!lightboxLoaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-black/40 px-5 py-4 backdrop-blur-md">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                    Loading
                  </span>
                </div>
              </div>
            )}

            <img
              src={`/api/drive-media/${encodeURIComponent(lightbox.id)}?size=full`}
              alt={lightbox.name}
              onLoad={() => setLightboxLoaded(true)}
              className={`max-h-[85vh] max-w-full rounded-xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.9)] transition-opacity duration-300 ${lightboxLoaded ? "opacity-100" : "opacity-0"
                }`}
            />

            <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
              <p className="text-xs font-medium text-white/80 sm:text-sm">
                {lightbox.name.replace(/\.[^/.]+$/, "")}
              </p>
              <p className="text-[10px] text-white/40 sm:text-xs">
                {lightboxIndex + 1} / {photos.length}
              </p>
            </div>
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-2xl text-white backdrop-blur-md sm:right-6 sm:h-12 sm:w-12"
              onClick={(event) => {
                event.stopPropagation();
                nextPhoto();
              }}
              aria-label="Berikutnya"
            >
              ›
            </button>
          )}

          <button
            type="button"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white backdrop-blur-md sm:right-5 sm:top-5"
            onClick={closeLightbox}
            aria-label="Tutup"
          >
            ×
          </button>

          <a
            href={lightbox.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-white/70 backdrop-blur-md hover:text-white"
            onClick={(event) => event.stopPropagation()}
          >
            Buka di Drive
          </a>
        </div>
      )}
    </div>
  );
}
