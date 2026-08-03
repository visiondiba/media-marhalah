/**
 * Helper to parse ISO 8601 duration format from YouTube API (e.g. PT15M33S)
 * into a simple format (e.g. 15m or 1h 15m)
 */
export function parseYouTubeDuration(durationStr: string): string {
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  const pad = (value: number) => String(value).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${minutes}:${pad(seconds)}`;
}

/**
 * Fetch video duration from YouTube Data API v3
 */
export async function fetchVideoDuration(videoUrl: string, apiKey: string): Promise<string | null> {
  const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch) return null;

  const videoId = videoIdMatch[1];
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const isoDuration = data.items[0].contentDetails.duration;
      return parseYouTubeDuration(isoDuration);
    }
  } catch (err) {
    console.error("Gagal mengambil durasi YouTube:", err);
  }

  return null;
}
