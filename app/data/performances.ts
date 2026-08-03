export type Category = "Semua" | "Seni Musik" | "Seni Tari" | "Seni Rupa" | "Seni Bahasa" | "Non-Performance";

export interface Performance {
  id: string;
  title: string;
  category: Category;
  description: string;
  artist: string;
  thumbnail: string;
  duration: string;
  year: number;
  featured?: boolean;
  videoUrl?: string;
  videoType?: "video/mp4" | "youtube";
  views?: number;
  trendingScore?: number;
}
