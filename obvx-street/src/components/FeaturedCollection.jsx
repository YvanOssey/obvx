import { Link } from "react-router-dom"
import { useProducts } from "../hooks/useProducts"
import { LoadError, ProductCard, ProductGridSkeleton } from "./ProductCard"

export const FeaturedCollection = () => {
    const { products, loading, error, retry } = useProducts()

    return (
        <section id="collections" className="border-b border-black/10 bg-white" aria-labelledby="collections-titre">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
                <div className="mb-12 flex flex-col items-start gap-3 sm:mb-16">
                    <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
                        Collection
                    </span>
                    <h2 id="collections-titre" className="text-3xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-4xl">
                        Nos produits
                    </h2>
                </div>

                {loading ? (
                    <ProductGridSkeleton />
                ) : error ? (
                    <LoadError message={error} onRetry={retry} />
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
                        {products.slice(0, 8).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                <div className="mt-14 flex justify-center">
                    <Link
                        to="/collections"
                        className="inline-flex min-h-12 items-center border border-black px-8 text-sm font-semibold uppercase tracking-wide transition-colors hover:border-amber-700 hover:bg-amber-700 hover:text-white"
                    >
                        Voir plus
                    </Link>
                </div>
            </div>
        </section>
    )
}
