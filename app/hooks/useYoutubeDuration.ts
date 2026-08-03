import { useEffect, useState } from "react";
import { fetchVideoDuration } from "~/utils/youtube";

const durationCache = new Map<string, string | null>();

export function useYoutubeDuration(videoUrl?: string, fallback = "") {
    const [duration, setDuration] = useState<string>(fallback);

    useEffect(() => {
        if (!videoUrl) {
            setDuration(fallback);
            return;
        }

        const cached = durationCache.get(videoUrl);
        if (cached !== undefined) {
            setDuration(cached ?? fallback);
            return;
        }

        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY ?? process.env.VITE_YOUTUBE_API_KEY;
        if (!apiKey) {
            durationCache.set(videoUrl, null);
            setDuration(fallback);
            return;
        }

        let cancelled = false;
        fetchVideoDuration(videoUrl, apiKey)
            .then((result) => {
                if (cancelled) return;
                durationCache.set(videoUrl, result ?? null);
                setDuration(result ?? fallback);
            })
            .catch(() => {
                if (cancelled) return;
                durationCache.set(videoUrl, null);
                setDuration(fallback);
            });

        return () => {
            cancelled = true;
        };
    }, [videoUrl, fallback]);

    return duration;
}
