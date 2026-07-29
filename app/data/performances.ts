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

export const performances: Performance[] = [
  {
    id: "pg-01",
    title: "Grand Opening Ceremony",
    category: "Non-Performance",
    description: "Pembukaan megah Panggung Gembira dengan pidato, kembang api, dan parade seluruh panitia. Sebuah awal untuk malam yang tak terlupakan.",
    artist: "Panitia PG",
    thumbnail: "https://placehold.co/600x400",
    duration: "45m",
    year: 2024,
    featured: true,
    views: 12500,
    trendingScore: 98,
    videoUrl: "https://lorem.video/720p",
    videoType: "video/mp4",
  },
  {
    id: "pg-02",
    title: "Symphony of The Stars",
    category: "Seni Musik",
    description: "Orkestra simfoni memainkan aransemen lagu-lagu epik dari berbagai era, memadukan instrumen klasik dengan sentuhan modern.",
    artist: "Music Marhalah Team",
    thumbnail: "https://placehold.co/600x400",
    duration: "15m",
    year: 2024,
    featured: true,
    views: 8900,
    trendingScore: 94,
    videoUrl: "https://lorem.video/720p",
    videoType: "video/mp4",
  },
  {
    id: "pg-03",
    title: "Tari Saman Harmoni",
    category: "Seni Tari",
    description: "Tarian tradisional dari Aceh yang dibawakan dengan kecepatan dan kekompakan luar biasa oleh puluhan penari.",
    artist: "Dance Club",
    thumbnail: "https://placehold.co/600x400",
    duration: "12m",
    year: 2024,
    featured: true,
    views: 15400,
    trendingScore: 99,
    videoUrl: "https://lorem.video/720p",
    videoType: "video/mp4",
  },
  {
    id: "pg-04",
    title: "Puisi Berantai",
    category: "Seni Bahasa",
    description: "Penampilan teatrikal puisi yang saling menyambung dengan emosi dan intonasi yang mendalam.",
    artist: "Language Ambassador",
    thumbnail: "https://placehold.co/600x400",
    duration: "8m",
    year: 2024,
    views: 4200,
    trendingScore: 82,
    videoUrl: "https://lorem.video/720p",
    videoType: "video/mp4",
  },
  {
    id: "pg-05",
    title: "Pesan Ketiga : Negosiasi",
    category: "Seni Musik",
    description: "Lantunan sholawat dengan iringan musik rebana khas Al-Banjari yang menyejukkan jiwa.",
    artist: "Tim Hadroh 6101",
    thumbnail: "https://placehold.co/600x400",
    duration: "20m",
    year: 2024,
    featured: true,
    views: 11200,
    trendingScore: 91,
    videoUrl: "https://www.youtube.com/watch?v=lepVoBRvhN8",
    videoType: "video/mp4",
  },
  {
    id: "pg-06",
    title: "Live Painting: Golden Era",
    category: "Seni Rupa",
    description: "Pertunjukan melukis langsung di atas kanvas besar dengan tema masa keemasan.",
    artist: "Art Studio",
    thumbnail: "https://placehold.co/600x400",
    duration: "30m",
    year: 2024,
    views: 6300,
    trendingScore: 86,
    videoUrl: "youtube.com/watch?v=-tKVN2mAKRI",
    videoType: "video/mp4",
  },
];

export function getPerformancesByCategory(category: Category | "Semua"): Performance[] {
  if (category === "Semua") return performances;
  return performances.filter((p) => p.category === category);
}

export function getPerformanceById(id: string): Performance | undefined {
  return performances.find((p) => p.id === id);
}

export function getFeaturedPerformances(): Performance[] {
  // Returns top trending & featured performances
  return performances.filter((p) => p.featured || (p.trendingScore && p.trendingScore > 90));
}
