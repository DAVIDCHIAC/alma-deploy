import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { Skeleton } from "@heroui/react";

type FilterProps = {
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
};

export type FilterState = {
  categories: string[];
  priceRange: string;
  sortBy: string;
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE;
const CACHE_KEY = "alma_filters_categories_cache";
const CACHE_TTL = 1000 * 60 * 60 * 12;

const priceRanges = [
  { label: "Todos los precios", value: "all" },
  { label: "Menos de $500", value: "0-500" },
  { label: "$500 - $1,000", value: "500-1000" },
  { label: "$1,000 - $2,000", value: "1000-2000" },
  { label: "Más de $2,000", value: "2000+" },
];

const sortOptions = [
  { label: "Más recientes", value: "newest" },
  { label: "Precio: Menor a Mayor", value: "price-asc" },
  { label: "Precio: Mayor a Menor", value: "price-desc" },
  { label: "Nombre: A-Z", value: "name-asc" },
];

export const ProductFilters = ({ onFilterChange, onClose, isMobile = false }: FilterProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Todos"]);
  const [availableCategories, setAvailableCategories] = useState<string[]>(["Todos"]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    sort: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { names: string[]; ts: number };
          if (Array.isArray(parsed.names) && parsed.ts && Date.now() - parsed.ts < CACHE_TTL) {
            setAvailableCategories(["Todos", ...parsed.names]);
            setLoadingCats(false);
            return;
          }
        }
        setLoadingCats(true);
        const res = await fetch(`${API_BASE}/api/categories`, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const names = Array.isArray(data) ? data.map((c: any) => c.name) : [];
        setAvailableCategories(["Todos", ...names]);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ names, ts: Date.now() }));
        setLoadingCats(false);
      } catch {
        setAvailableCategories(["Todos"]);
        setLoadingCats(false);
      }
    };
    load();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (category: string) => {
    let newCategories: string[];
    
    if (category === "Todos") {
      newCategories = ["Todos"];
    } else {
      if (selectedCategories.includes("Todos")) {
        newCategories = [category];
      } else if (selectedCategories.includes(category)) {
        newCategories = selectedCategories.filter((c) => c !== category);
        if (newCategories.length === 0) newCategories = ["Todos"];
      } else {
        newCategories = [...selectedCategories, category];
      }
    }

    setSelectedCategories(newCategories);
    onFilterChange({
      categories: newCategories,
      priceRange: selectedPriceRange,
      sortBy: selectedSort,
    });
  };

  const handlePriceChange = (range: string) => {
    setSelectedPriceRange(range);
    onFilterChange({
      categories: selectedCategories,
      priceRange: range,
      sortBy: selectedSort,
    });
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onFilterChange({
      categories: selectedCategories,
      priceRange: selectedPriceRange,
      sortBy: sort,
    });
  };

  const clearFilters = () => {
    setSelectedCategories(["Todos"]);
    setSelectedPriceRange("all");
    setSelectedSort("newest");
    onFilterChange({
      categories: ["Todos"],
      priceRange: "all",
      sortBy: "newest",
    });
  };

  return (
    <div className={`${isMobile ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'sticky top-24'}`}>
      {isMobile && (
        <div className="flex justify-between items-center px-6 py-4 border-b border-black/10">
          <h2 className="text-sm font-normal tracking-wide uppercase">Filtros</h2>
          <button onClick={onClose} className="p-2">
            <X size={20} />
          </button>
        </div>
      )}

      <div className={isMobile ? "px-6 py-6" : ""}>
        {loadingCats ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="w-2/5 rounded-lg"><div className="h-4 w-2/5 rounded-lg bg-default-200" /></Skeleton>
              <div className="space-y-3">
                <Skeleton className="w-3/5 rounded-lg"><div className="h-3 w-3/5 rounded-lg bg-default-300" /></Skeleton>
                <Skeleton className="w-4/5 rounded-lg"><div className="h-3 w-4/5 rounded-lg bg-default-200" /></Skeleton>
                <Skeleton className="w-2/5 rounded-lg"><div className="h-3 w-2/5 rounded-lg bg-default-300" /></Skeleton>
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="w-2/5 rounded-lg"><div className="h-4 w-2/5 rounded-lg bg-default-200" /></Skeleton>
              <div className="space-y-3">
                <Skeleton className="w-3/5 rounded-lg"><div className="h-3 w-3/5 rounded-lg bg-default-300" /></Skeleton>
                <Skeleton className="w-4/5 rounded-lg"><div className="h-3 w-4/5 rounded-lg bg-default-200" /></Skeleton>
                <Skeleton className="w-2/5 rounded-lg"><div className="h-3 w-2/5 rounded-lg bg-default-300" /></Skeleton>
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="w-2/5 rounded-lg"><div className="h-4 w-2/5 rounded-lg bg-default-200" /></Skeleton>
              <div className="space-y-3">
                <Skeleton className="w-3/5 rounded-lg"><div className="h-3 w-3/5 rounded-lg bg-default-300" /></Skeleton>
                <Skeleton className="w-4/5 rounded-lg"><div className="h-3 w-4/5 rounded-lg bg-default-200" /></Skeleton>
                <Skeleton className="w-2/5 rounded-lg"><div className="h-3 w-2/5 rounded-lg bg-default-300" /></Skeleton>
              </div>
            </div>
          </div>
        ) : (
          <>
        <div className="border-b border-black/10 pb-6 mb-6">
          <button
            onClick={() => toggleSection("category")}
            className="flex justify-between items-center w-full mb-4"
          >
            <h3 className="text-xs font-normal tracking-wide uppercase">Categoría</h3>
            <ChevronDown
              size={16}
              className={`transition-transform ${expandedSections.category ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSections.category && (
            <div className="space-y-3">
              {availableCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 border border-black/30 peer-checked:bg-[#314737] peer-checked:border-[#314737] transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-black/70 group-hover:text-black transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-black/10 pb-6 mb-6">
          <button
            onClick={() => toggleSection("price")}
            className="flex justify-between items-center w-full mb-4"
          >
            <h3 className="text-xs font-normal tracking-wide uppercase">Precio</h3>
            <ChevronDown
              size={16}
              className={`transition-transform ${expandedSections.price ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSections.price && (
            <div className="space-y-3">
              {priceRanges.map((range) => (
                <label
                  key={range.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange === range.value}
                      onChange={() => handlePriceChange(range.value)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 rounded-full border border-black/30 peer-checked:border-[#314737] transition-colors" />
                    <div className="absolute inset-1 rounded-full bg-[#314737] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-black/70 group-hover:text-black transition-colors">
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="pb-6 mb-6">
          <button
            onClick={() => toggleSection("sort")}
            className="flex justify-between items-center w-full mb-4"
          >
            <h3 className="text-xs font-normal tracking-wide uppercase">Ordenar por</h3>
            <ChevronDown
              size={16}
              className={`transition-transform ${expandedSections.sort ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSections.sort && (
            <div className="space-y-3">
              {sortOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="sortBy"
                      checked={selectedSort === option.value}
                      onChange={() => handleSortChange(option.value)}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 rounded-full border border-black/30 peer-checked:border-[#314737] transition-colors" />
                    <div className="absolute inset-1 rounded-full bg-[#314737] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-black/70 group-hover:text-black transition-colors">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
       <button
          onClick={clearFilters}
          className="w-full py-2 text-sm tracking-wide text-[#314737] hover:text-black border border-black/20 hover:border-black/40 transition-colors uppercase"
        >
          Limpiar filtros
        </button>
      </>
      )}
      </div>
    </div>
  );
};
