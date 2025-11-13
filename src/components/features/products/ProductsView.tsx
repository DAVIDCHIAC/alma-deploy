import { useState } from "react";
import ProductList from "./ProductList";
import { ProductFilters } from "./ProductFilters";
import type { FilterState } from "./ProductFilters";
import { Filter } from "lucide-react";

export const ProductsView = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: ["Todos"],
    priceRange: "all",
    sortBy: "newest",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extralight tracking-widest text-black uppercase">Colección</h1>
          
          {/* Botón de filtros móvil */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-black/20 text-sm tracking-wide uppercase hover:border-black/40 transition-colors"
          >
            <Filter size={16} />
            Filtros
          </button>
        </div>

        <div className="flex gap-12">
          {/* Filtros desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <ProductFilters onFilterChange={handleFilterChange} />
          </aside>

          {/* Filtros móvil */}
          {showMobileFilters && (
            <ProductFilters
              onFilterChange={handleFilterChange}
              onClose={() => setShowMobileFilters(false)}
              isMobile={true}
            />
          )}

          {/* Lista de productos */}
          <div className="flex-1">
            <ProductList filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
};