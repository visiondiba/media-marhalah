import { useState, useEffect, useCallback } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { LicenseModal } from "~/components/LicenseModal";
import { useAuth } from "~/hooks/useAuth";

export const meta: MetaFunction = () => [
  { title: "Gallery — catalystSTREAM" },
  { name: "description", content: "Galeri foto dokumentasi Panggung Gembira Impervious Generation." },
];

const FOLDER_ID = "1YSUbMrrPDEOwpzXOgZ_RX5H-xkMx0BBs";

interface DrivePhoto {
  id: string;
  name: string;
  thumbnailLink: string;
  webViewLink: string;
  imageMediaMetadata?: {
    width?: number;
    height?: number;
  };
}

export async function loader(_args: LoaderFunctionArgs) {
  const apiKey = import.meta.env.GOOGLE_DRIVE_API_KEY ?? process.env.GOOGLE_DRIVE_API_KEY;
  const { logErrorOnce } = await import("~/utils/errorLogger.server");

  if (!apiKey) {
    return json({ photos: [] as DrivePhoto[], error: "no_api_key" });
  }

  try {
    // Hilangkan 'in parents' jika API Key dibatasi, atau gunakan list biasa dengan asumsi key valid.
    // Pastikan folder & seluruh isi file di dalamnya sudah disetting "Anyone with the link" (Viewer).
    const query = encodeURIComponent(`'${FOLDER_ID}' in parents and mimeType contains 'image' and trashed = false`);
    const fields = encodeURIComponent("files(id,name,thumbnailLink,webViewLink,imageMediaMetadata)");
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${apiKey}&fields=${fields}&orderBy=name&pageSize=100`;

    const res = await fetch(url);
    if (!res.ok) {
      // Jika tetap gagal karena 403/400, kemungkinan besar API Key tidak diizinkan query parents public
      throw new Error(`Drive API error: ${res.status}`);
    }

    const data = await res.json();
    const photos: DrivePhoto[] = (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      webViewLink: f.webViewLink,
      thumbnailLink: `https://drive.google.com/uc?export=view&id=${f.id}`,
    }));

    return json({ photos, error: null });
  }
  catch (err) {
    console.error("Gallery loader error:", err);
    const errMsg = err && typeof err === "object" && "message" in err ? (err as any).message : String(err);
    logErrorOnce(`drive-fetch-exception-${String(errMsg)}`, `Gallery loader fetch failed: ${String(err)}`);
    return json({ photos: [] as DrivePhoto[], error: "fetch_failed" });
  }
}

export default function Gallery() {
  const { photos, error } = useLoaderData<typeof loader>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [localPhotos, setLocalPhotos] = useState<DrivePhoto[]>([]);
  const [lightbox, setLightbox] = useState<DrivePhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const displayedPhotos = (photos && photos.length) ? photos : localPhotos;
  const isDriveSource = photos && photos.length > 0;

  // Show the same license/login modal as other places when user is not authenticated
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // Open modal if not authenticated after initial auth load
  useEffect(() => {
    if (!isAuthLoading && !user) setShowLicenseModal(true);
    else setShowLicenseModal(false);
  }, [isAuthLoading, user]);

  const openLightbox = (photo: DrivePhoto, idx: number) => {
    setLightbox(photo);
    setLightboxIndex(idx);
  };

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const prevPhoto = useCallback(() => {
    if (!displayedPhotos || displayedPhotos.length === 0) return;
    const newIdx = (lightboxIndex - 1 + displayedPhotos.length) % displayedPhotos.length;
    setLightboxIndex(newIdx);
    setLightbox(displayedPhotos[newIdx]);
  }, [lightboxIndex, displayedPhotos]);

  const nextPhoto = useCallback(() => {
    if (!displayedPhotos || displayedPhotos.length === 0) return;
    const newIdx = (lightboxIndex + 1) % displayedPhotos.length;
    setLightboxIndex(newIdx);
    setLightbox(displayedPhotos[newIdx]);
  }, [lightboxIndex, displayedPhotos]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, closeLightbox, prevPhoto, nextPhoto]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  // Fallback: if Drive photos are empty, fetch local public images via our API
  useEffect(() => {
    if (photos && photos.length > 0) return;

    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/scan-folders?folder=public&recursive=true');
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.items) return;

        const images: DrivePhoto[] = [];

        function walk(items: any[]) {
          for (const it of items) {
            if (it.type === 'file' && it.isImage && it.path) {
              // convert 'public/...' -> '/...'
              const url = it.path.replace(/^public[\\/]/, '/').replace(/\\\\/g, '/');
              images.push({ id: it.path, name: it.name, thumbnailLink: url, webViewLink: url });
            }
            if (it.type === 'dir' && Array.isArray(it.children)) {
              walk(it.children);
            }
          }
        }

        walk(data.items);
        if (mounted) setLocalPhotos(images);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [photos]);

  return (
    <div className="min-h-screen bg-[#070503]">
      <LicenseModal isOpen={showLicenseModal} onClose={() => setShowLicenseModal(false)} onSuccess={() => setShowLicenseModal(false)} />
      <Navbar />

      <main className="mx-auto max-w-7xl px-3 pb-24 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-strong">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            Dokumentasi
          </div>
          <h1 className="text-3xl font-black uppercase tracking-[0.06em] text-primary-soft sm:text-4xl lg:text-5xl">
            Photo Gallery
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-text-muted">
            Dokumentasi foto eksklusif Panggung Gembira Impervious Generation
          </p>
          {displayedPhotos.length > 0 && (
            <p className="mt-2 text-xs text-text-muted/60">{displayedPhotos.length} foto</p>
          )}
        </div>

        {/* Error: No API Key */}
        {error === "no_api_key" && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-2xl border border-primary/20 bg-surface/60 p-8 backdrop-blur-md">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-primary-strong">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-bold text-text-primary">Google Drive API Key Diperlukan</h2>
              <p className="mt-2 text-sm text-text-muted">
                Tambahkan <code className="rounded bg-primary/15 px-1.5 py-0.5 text-xs text-primary-strong">GOOGLE_DRIVE_API_KEY</code> ke file <code className="rounded bg-primary/15 px-1.5 py-0.5 text-xs text-primary-strong">.env</code> untuk menampilkan foto dari Google Drive.
              </p>
            </div>
          </div>
        )}

        {/* Error: Fetch Failed */}
        {error === "fetch_failed" && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-text-muted">Gagal memuat foto. Pastikan folder Google Drive dapat diakses publik.</p>
          </div>
        )}

        {/* Pinterest Masonry Grid */}
        {displayedPhotos.length > 0 && (
          <div
            className="columns-2 gap-2 sm:columns-3 sm:gap-3 md:columns-4 lg:columns-5"
            style={{ columnFill: "balance" }}
          >
            {displayedPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                className="group mb-2 break-inside-avoid cursor-pointer overflow-hidden rounded-xl sm:mb-3 sm:rounded-2xl"
                onClick={() => openLightbox(photo, idx)}
              >
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
                  <img
                    src={isDriveSource ? `/api/drive-media/${photo.id}` : photo.thumbnailLink}
                    alt={photo.name}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = isDriveSource
                        ? `https://drive.google.com/uc?export=view&id=${photo.id}`
                        : photo.thumbnailLink;
                    }}
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl sm:rounded-2xl">
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                      <p className="line-clamp-2 text-[10px] font-medium text-white/90 sm:text-xs">
                        {photo.name.replace(/\.[^/.]+$/, "")}
                      </p>
                    </div>
                    {/* Expand Icon */}
                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-md sm:h-8 sm:w-8">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Photos */}
        {!error && displayedPhotos.length === 0 && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-text-muted">Belum ada foto tersedia.</p>
          </div>
        )}
      </main>

      <Footer />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onClick={closeLightbox}
        >
          {/* Prev Button */}
          {displayedPhotos.length > 1 && (
            <button
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/80 sm:left-6 sm:h-12 sm:w-12"
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              aria-label="Sebelumnya"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 sm:h-5 sm:w-5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[90vh] max-w-[92vw] sm:max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.thumbnailLink.replace("=s800", "=s1600")}
              alt={lightbox.name}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://drive.google.com/uc?export=view&id=${lightbox.id}`;
              }}
            />
            {/* Bottom Caption */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
              <p className="text-xs font-medium text-white/80 sm:text-sm">
                {lightbox.name.replace(/\.[^/.]+$/, "")}
              </p>
              <p className="text-[10px] text-white/40 sm:text-xs">
                {lightboxIndex + 1} / {displayedPhotos.length}
              </p>
            </div>
          </div>

          {/* Next Button */}
          {displayedPhotos.length > 1 && (
            <button
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/80 sm:right-6 sm:h-12 sm:w-12"
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              aria-label="Berikutnya"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 sm:h-5 sm:w-5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Close Button */}
          <button
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/80 sm:right-5 sm:top-5"
            onClick={closeLightbox}
            aria-label="Tutup"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* View on Drive */}
          <a
            href={lightbox.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs text-white/70 backdrop-blur-md transition hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Buka di Drive
          </a>
        </div>
      )}
    </div>
  );
}
