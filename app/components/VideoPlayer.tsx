import { useEffect, useRef } from "react";

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
  const youtubeId = getYouTubeVideoId(sourceUrl);

  useEffect(() => {
    let player: any = null;
    let isCancelled = false;
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
                rel: 0,           // Nonaktifkan video terkait
                showinfo: 0,      // Sembunyikan info judul/channel
                modestbranding: 1, // Minimalkan branding YouTube
                iv_load_policy: 3 // Nonaktifkan anotasi
              },
            });
          }
        })
        .catch((err) => {
          console.error("Error loading Plyr:", err);
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

  if (youtubeId) {
    return (
      <div key={sourceUrl} className="plyr-wrapper">
        <div
          ref={youtubeRef}
          className="plyr"
          data-plyr-provider="youtube"
          data-plyr-embed-id={youtubeId}
          title={title}
        />
      </div>
    );
  }

  return (
    <div key={sourceUrl} className="plyr-wrapper">
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
    </div>
  );
}
