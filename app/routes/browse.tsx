import { useState, useMemo } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";

const ITEMS_PER_PAGE = 8;
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { CategoryFilter } from "~/components/CategoryFilter";
import { ContentCard } from "~/components/ContentCard";
import { getPerformancesByCategory, type Category, type Performance } from "~/data/performances.server";

const CATEGORIES: Category[] = ["Semua", "Seni Musik", "Seni Tari", "Seni Rupa", "Seni Bahasa", "Non-Performance"];

export async function loader(_args: LoaderFunctionArgs) {
  const allPerformances = await getPerformancesByCategory("Semua");
  return json({ allPerformances });
}

export default function Browse() {
  const { allPerformances } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [activeCategory, setActiveCategory] = useState<Category>("Semua");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);

  const performances = useMemo(() => {
    let filtered: Performance[] = allPerformances;

    if (activeCategory !== "Semua") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, searchQuery, allPerformances]);

  const totalPages = Math.max(1, Math.ceil(performances.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = performances.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />

      <header className="px-4 py-10 text-center sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-strong">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M4 7h16" />
              <path d="M7 3v4" />
              <path d="M17 3v4" />
              <rect x="4" y="5" width="16" height="15" rx="2" />
            </svg>
            <span>Jelajahi Koleksi</span>
          </div>
          <h1 className="mb-3 text-3xl font-black uppercase tracking-[0.14em] text-primary-soft sm:text-4xl lg:text-5xl">
            Jelajahi
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
            Temukan penampilan luar biasa dari Panggung Gembira dalam satu ruang yang lebih rapi dan elegan.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-full border border-primary/20 bg-surface/80 px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.28)] backdrop-blur">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary-strong">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Cari penampilan, seniman, atau kategori..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
      </header>

      <CategoryFilter categories={CATEGORIES} activeCategory={activeCategory} onSelect={handleCategoryChange} />

      <main className="mx-auto max-w-7xl px-3 py-6 pb-24 sm:px-8 sm:py-8 sm:pb-10 lg:px-12">
        {performances.length > 0 ? (
          <>
            <div className="mb-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted sm:text-xs">
              <span>Halaman {safePage} dari {totalPages}</span>
              <span>{performances.length} hasil</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
              {pageItems.map((perf, idx) => (
                <ContentCard key={perf.id} performance={perf} index={pageStart + idx} variant="grid" />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage === 1}
                  className="rounded-full border border-primary/25 bg-surface/80 px-3 py-2 text-sm font-semibold text-text-primary transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sebelumnya
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 min-w-9 rounded-full border px-3 text-sm font-semibold transition ${page === safePage
                      ? "border-primary bg-primary/20 text-primary-strong"
                      : "border-primary/20 bg-surface/70 text-text-muted hover:text-text-primary"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-full border border-primary/25 bg-surface/80 px-3 py-2 text-sm font-semibold text-text-primary transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[24px] border border-primary/20 bg-surface/80 px-6 py-12 text-center text-sm text-text-muted sm:px-8 sm:py-16">
            <p>Tidak ada penampilan yang sesuai dengan pencarian Anda.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
