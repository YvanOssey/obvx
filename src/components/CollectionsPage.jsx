import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useProducts } from "../hooks/useProducts"
import { usePageTitle } from "../hooks/usePageTitle"
import { LoadError, ProductCard, ProductGridSkeleton } from "./ProductCard"

// Filtres disponibles, pilotés par l'URL (?filtre=...) pour que les liens du menu Boutique marchent.
const FILTERS = [
  { key: "tous", label: "Tous", title: "Toute la collection", match: () => true },
  { key: "nouveautes", label: "Nouveautés", title: "Nouveautés", match: (p) => p.isNew },
  { key: "vetements", label: "Vêtements", title: "Vêtements", match: (p) => p.category === "Vêtements" },
  { key: "accessoires", label: "Accessoires", title: "Accessoires", match: (p) => p.category === "Accessoires" },
]

const SORTS = [
  { key: "pertinence", label: "Pertinence", compare: null },
  { key: "prix-croissant", label: "Prix croissant", compare: (a, b) => a.price - b.price },
  { key: "prix-decroissant", label: "Prix décroissant", compare: (a, b) => b.price - a.price },
  { key: "nom", label: "Nom (A → Z)", compare: (a, b) => a.name.localeCompare(b.name, "fr") },
]

export const CollectionsPage = () => {
  const { products, loading, error, retry } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeFilter =
    FILTERS.find((filter) => filter.key === searchParams.get("filtre")) ?? FILTERS[0]

  const activeSort = SORTS.find((sort) => sort.key === searchParams.get("tri")) ?? SORTS[0]

  usePageTitle(activeFilter.title)

  const filteredProducts = useMemo(() => {
    const list = products.filter(activeFilter.match)
    return activeSort.compare ? [...list].sort(activeSort.compare) : list
  }, [products, activeFilter, activeSort])

  // Met à jour un paramètre de l'URL sans perdre les autres (filtre + tri partageables)
  const updateParam = (key, value, defaultValue) => {
    const next = new URLSearchParams(searchParams)
    if (value === defaultValue) next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
        <div className="mb-10 flex flex-col items-start gap-3 sm:mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            Boutique
          </span>
          <h1 className="text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl">
            {activeFilter.title}
          </h1>
        </div>

        <div className="mb-10 flex flex-col gap-5 border-b border-black/10 pb-6 sm:mb-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Filtrer les produits">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              aria-pressed={activeFilter.key === filter.key}
              onClick={() => updateParam("filtre", filter.key, "tous")}
              className={`inline-flex min-h-11 items-center border px-5 text-xs font-semibold uppercase tracking-wide transition-colors sm:text-sm ${
                activeFilter.key === filter.key
                  ? "border-black bg-black text-white"
                  : "border-black/20 hover:border-amber-700 hover:text-amber-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <p className="text-sm text-black/60" aria-live="polite">
              {!loading && !error &&
                `${filteredProducts.length} produit${filteredProducts.length > 1 ? "s" : ""}`}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-black/60">Trier par</span>
              <select
                value={activeSort.key}
                onChange={(event) => updateParam("tri", event.target.value, "pertinence")}
                className="min-h-11 cursor-pointer border border-black/20 bg-white px-3 text-base font-medium hover:border-black sm:text-sm"
              >
                {SORTS.map((sort) => (
                  <option key={sort.key} value={sort.key}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : error ? (
          <LoadError message={error} onRetry={retry} />
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-black/60">Aucun produit dans cette catégorie pour le moment.</p>
            <button
              type="button"
              onClick={() => updateParam("filtre", "tous", "tous")}
              className="mt-5 inline-flex min-h-11 items-center border border-black px-6 text-xs font-semibold uppercase tracking-wide transition-colors hover:border-amber-700 hover:bg-amber-700 hover:text-white"
            >
              Voir tous les produits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
