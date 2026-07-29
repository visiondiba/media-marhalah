import type { Category } from "../data/performances";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: Category;
  onSelect: (category: Category) => void;
}

export function CategoryFilter({ categories, activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="sticky top-16 z-40 border-y border-primary/20 bg-[#0A0804]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-8 lg:px-12">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${activeCategory === cat ? "border-primary bg-primary/20 text-primary-strong" : "border-transparent bg-white/5 text-text-muted hover:border-primary/25 hover:text-text-primary"}`}
            onClick={() => onSelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
