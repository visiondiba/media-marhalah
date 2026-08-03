export type Category = "Semua" | "Seni Musik" | "Seni Tari" | "Seni Rupa" | "Seni Bahasa" | "Non-Performance";

export interface Performance {
    id: string;
    title: string;
    category: Category;
    description: string;
    thumbnail?: string;
    featured?: boolean;
    videoUrl?: string;
    videoType?: "video/mp4" | "youtube";
}
