import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  sourceUrl: string;
  posterUrl: string;
  title: string;
}

function getYouTubeVideoId(url: string): string | null {
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
    let player: any;
    const target = youtubeId ? youtubeRef.current : videoRef.current;

    if (typeof window !== "undefined" && target) {
      import("plyr")
        .then((PlyrModule) => {
          const PlyrConstructor = PlyrModule.default || PlyrModule;

          if (target) {
            player = new PlyrConstructor(target, {
              autoplay: false,
              controls: [
                "play-large",
                "play",
                "progress",
                "current-time",
                "duration",
                "mute",
                "volume",
                "captions",
                "settings",
                "pip",
                "airplay",
                "fullscreen",
              ],
            });
          }
        })
        .catch((err) => {
          console.error("Error loading Plyr:", err);
        });
    }

    return () => {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    };
  }, [youtubeId, sourceUrl, title]);

  if (youtubeId) {
    return (
      <div className="plyr-wrapper">
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
    <div className="plyr-wrapper">
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
