import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  sourceUrl: string;
  posterUrl?: string;
  title: string;
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmedUrl = url.trim();

  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function VideoPlayer({ sourceUrl, posterUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const youtubeId = getYouTubeVideoId(sourceUrl);

  useEffect(() => {
    let player: any = null;
    let isCancelled = false;
    setIsPlayerReady(false);

    const target = youtubeId ? youtubeRef.current : videoRef.current;

    if (typeof window !== "undefined" && target) {
      import("plyr")
        .then((PlyrModule) => {
          if (isCancelled) return;
          const PlyrConstructor = PlyrModule.default || PlyrModule;

          if (target) {
            player = new PlyrConstructor(target, {
              autoplay: false,
              controls: [
                "play-large", "play", "progress", "current-time", "duration",
                "mute", "volume", "captions", "settings", "pip", "airplay", "fullscreen"
              ],
              youtube: {
                rel: 0,
                showinfo: 0,
                modestbranding: 1,
                iv_load_policy: 3,
                playsinline: 1,
              },
            });

            player.on("ready", () => {
              if (!isCancelled) setIsPlayerReady(true);
            });

            // Fallback timeout in case 'ready' event doesn't fire immediately
            setTimeout(() => {
              if (!isCancelled) setIsPlayerReady(true);
            }, 1200);

            // Handle fullscreen events to show/hide overlay
            const handleFullscreenChange = () => {
              if (overlayRef.current) {
                const isFullscreen = document.fullscreenElement || (document as any).webkitFullscreenElement;
                overlayRef.current.style.display = isFullscreen ? 'block' : 'none';
              }
            };

            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

            return () => {
              document.removeEventListener('fullscreenchange', handleFullscreenChange);
              document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            };
          }
        })
        .catch((err) => {
          console.error("Error loading Plyr:", err);
          if (!isCancelled) setIsPlayerReady(true);
        });
    }

    return () => {
      isCancelled = true;
      if (player && typeof player.destroy === "function") {
        try {
          player.destroy();
        } catch {
          // Ignore destroy errors
        }
      }
    };
  }, [youtubeId, sourceUrl, title]);

  return (
    <div key={sourceUrl} className="plyr-wrapper relative overflow-hidden bg-black aspect-video">
      {/* Video Loading Skeleton Overlay */}
      <div 
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#070503] transition-opacity duration-500 pointer-events-none ${
          isPlayerReady ? "opacity-0 invisible" : "opacity-100 visible"
        }`}
      >
        {posterUrl && (
          <img 
            src={posterUrl} 
            alt={title} 
            className="absolute inset-0 h-full w-full object-cover opacity-40 blur-sm scale-105" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-[#070503]/70 to-[#070503]/40" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 backdrop-blur-md">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-primary-strong ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-soft">
            Menyiapkan Pemutar...
          </span>
        </div>
      </div>

      {youtubeId ? (
        <>
          <div
            ref={youtubeRef}
            className="plyr"
            data-plyr-provider="youtube"
            data-plyr-embed-id={youtubeId}
            title={title}
          />
          <div
            ref={overlayRef}
            className="fullscreen-overlay pointer-events-none absolute left-0 top-0 z-50 hidden h-32 w-96 bg-gradient-to-b from-[#0A0804]/98 via-[#0A0804]/90 via-30% to-transparent"
            style={{
              display: 'none',
              position: 'fixed',
              left: 0,
              top: 0,
              zIndex: 2147483646,
              height: '180px',
              width: '400px',
              background: 'linear-gradient(to bottom, rgba(10, 8, 4, 0.98), rgba(10, 8, 4, 0.90), transparent)',
              pointerEvents: 'none',
            }}
          />
        </>
      ) : (
        <video
          ref={videoRef}
          className="plyr"
          playsInline
          controls
          poster={posterUrl}
          src={sourceUrl}
          width="100%"
        >
          <source src={sourceUrl} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
