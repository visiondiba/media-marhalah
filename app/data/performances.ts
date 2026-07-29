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
    id: "pg-101",
    title: "Moonlight Gala Opening",
    category: "Non-Performance",
    description: "Pembukaan malam puncak dengan lampu panggung, sorak sorai, dan suasana megah yang memikat seluruh penonton.",
    artist: "Panitia Utama",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    duration: "42m",
    year: 2024,
    featured: true,
    views: 18400,
    trendingScore: 98,
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    videoType: "youtube",
  },
  {
    id: "pg-102",
    title: "Ruang Nada: Evening Strings",
    category: "Seni Musik",
    description: "Pertunjukan orkestra malam yang menampilkan harmoni senar, piano, dan vokal hangat dalam suasana intim.",
    artist: "Orkestra Sore",
    thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
    duration: "18m",
    year: 2024,
    featured: true,
    views: 14320,
    trendingScore: 96,
    videoUrl: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    videoType: "youtube",
  },
  {
    id: "pg-103",
    title: "Suaraku, Suaramu",
    category: "Seni Musik",
    description: "Kolaborasi vokal yang mengangkat emosi lewat lirik sederhana dan irama yang penuh ketenangan.",
    artist: "Vocal Collective",
    thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
    duration: "11m",
    year: 2024,
    views: 8760,
    trendingScore: 89,
    videoUrl: "https://www.youtube.com/watch?v=1H6Mbdxj_OI",
    videoType: "youtube",
  },
  {
    id: "pg-104",
    title: "Ritme Bumi",
    category: "Seni Tari",
    description: "Tarian energik yang menggabungkan gerak tradisional dengan ritme modern, penuh kekuatan dan ketepatan.",
    artist: "Dance Lab",
    thumbnail: "https://images.unsplash.com/photo-1504609813442-42c8f0f8e7f5?auto=format&fit=crop&w=900&q=80",
    duration: "14m",
    year: 2024,
    featured: true,
    views: 16250,
    trendingScore: 97,
    videoUrl: "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    videoType: "youtube",
  },
  {
    id: "pg-105",
    title: "Tarian Ombak & Api",
    category: "Seni Tari",
    description: "Penampilan tari yang memadukan aksen lembut dan ledakan energi dengan latar musik berwarna.",
    artist: "Studio Gerak",
    thumbnail: "https://images.unsplash.com/photo-1511117833891-3dcc6b862fc0?auto=format&fit=crop&w=900&q=80",
    duration: "9m",
    year: 2024,
    views: 10240,
    trendingScore: 91,
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    videoType: "youtube",
  },
  {
    id: "pg-106",
    title: "Pilar Cahaya",
    category: "Seni Rupa",
    description: "Sesi melukis langsung dengan warna-warna hangat dan komposisi visual yang terasa hidup dan monumental.",
    artist: "Art House Studio",
    thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    duration: "24m",
    year: 2024,
    featured: true,
    views: 9800,
    trendingScore: 95,
    videoUrl: "https://www.youtube.com/watch?v=3fumBcKC6RE",
    videoType: "youtube",
  },
  {
    id: "pg-107",
    title: "Warna di Langit",
    category: "Seni Rupa",
    description: "Karya seni rupa yang mengekspresikan suasana sore hari dengan goresan warna yang lembut dan dramatis.",
    artist: "Kanvas Merah",
    thumbnail: "https://images.unsplash.com/photo-1492691527719-0d8b575c4db0?auto=format&fit=crop&w=900&q=80",
    duration: "17m",
    year: 2024,
    views: 7420,
    trendingScore: 88,
    videoUrl: "https://www.youtube.com/watch?v=Vb4g8j1wR6A",
    videoType: "youtube",
  },
  {
    id: "pg-108",
    title: "Menyusun Harapan",
    category: "Seni Bahasa",
    description: "Pertunjukan puisi dan deklamasi yang membangun suasana reflektif lewat kata-kata yang tajam dan indah.",
    artist: "Lafal Nusantara",
    thumbnail: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
    duration: "13m",
    year: 2024,
    featured: true,
    views: 8090,
    trendingScore: 94,
    videoUrl: "https://www.youtube.com/watch?v=8aGhZQkoFbQ",
    videoType: "youtube",
  },
  {
    id: "pg-109",
    title: "Kisah dari Satu Kata",
    category: "Seni Bahasa",
    description: "Monolog puitis yang membawa penonton menelusuri emosi lewat jeda, intonasi, dan makna yang tersisa.",
    artist: "Teater Kata",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
    duration: "7m",
    year: 2024,
    views: 6110,
    trendingScore: 87,
    videoUrl: "https://www.youtube.com/watch?v=4uCwsXG5U18",
    videoType: "youtube",
  },
  {
    id: "pg-110",
    title: "Bintang Hening",
    category: "Non-Performance",
    description: "Segmen penutupan berkesan dengan nuansa tenang, pencahayaan lembut, dan momen refleksi untuk penonton.",
    artist: "Tim Pencahayaan",
    thumbnail: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=900&q=80",
    duration: "16m",
    year: 2024,
    views: 7130,
    trendingScore: 90,
    videoUrl: "https://www.youtube.com/watch?v=YQHsXMglC9A",
    videoType: "youtube",
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
  const categories: Category[] = ["Non-Performance", "Seni Musik", "Seni Tari", "Seni Rupa", "Seni Bahasa"];
  const featuredByCategory = new Map<Category, Performance>();

  for (const performance of performances) {
    const isFeatured = performance.featured || (performance.trendingScore ?? 0) > 90;
    if (!isFeatured) continue;

    const current = featuredByCategory.get(performance.category as Category);
    const currentScore = current?.trendingScore ?? 0;
    const candidateScore = performance.trendingScore ?? 0;

    if (!current || candidateScore > currentScore) {
      featuredByCategory.set(performance.category as Category, performance);
    }
  }

  return categories
    .map((category) => featuredByCategory.get(category) ?? performances.find((performance) => performance.category === category))
    .filter((performance): performance is Performance => Boolean(performance));
}
