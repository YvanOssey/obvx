import { Link } from "react-router-dom"
import { ShoppingBag } from "lucide-react"
import { useCart } from "../context/CartContext"
import { formatPrice } from "../lib/format"

const cardButton =
  "mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 border px-3 text-xs font-semibold uppercase tracking-wide transition-colors"

export const ProductCard = ({ product, priority = false }) => {
  const { addToCart } = useCart()

  return (
    <article className="group flex flex-col">
      {/* Lien image retiré du parcours clavier : le titre mène déjà à la fiche */}
      <Link to={`/shop/${product.id}`} tabIndex={-1} aria-hidden="true" className="block">
        <div className="relative overflow-hidden border border-black/10 bg-cream">
          {product.isNew && (
            <span className="absolute left-3 top-3 z-10 bg-black px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Nouveau
            </span>
          )}
          <img
            src={product.image}
            alt=""
            width={600}
            height={800}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="aspect-[3/4] h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-xs uppercase tracking-wide text-black/60">{product.category}</p>
        <h3 className="mt-1 text-sm font-semibold uppercase tracking-wide">
          <Link
            to={`/shop/${product.id}`}
            className="inline-block py-1 transition-colors hover:text-amber-700 group-hover:text-amber-700"
          >
            {product.name}
          </Link>
        </h3>
        <p className="price mt-1 text-sm text-black/75">{formatPrice(product.price)}</p>
        {product.sizes?.length > 0 && (
          <p className="mt-1 text-xs text-black/60">
            {product.sizes.length === 1
              ? product.sizes[0]
              : `Tailles ${product.sizes[0]} à ${product.sizes[product.sizes.length - 1]}`}
          </p>
        )}
        <div className="h-3 flex-shrink-0" aria-hidden="true" />
        {product.sizes?.length === 1 ? (
          <button
            type="button"
            onClick={() => addToCart(product, product.sizes[0])}
            aria-label={`Ajouter ${product.name} au panier`}
            className={`${cardButton} border-black bg-black text-white hover:border-amber-700 hover:bg-amber-700 active:scale-[0.98]`}
          >
            <ShoppingBag size={15} aria-hidden="true" />
            Ajouter
          </button>
        ) : (
          // Plusieurs tailles : le choix se fait sur la fiche produit
          <Link
            to={`/shop/${product.id}`}
            aria-label={`Choisir une taille pour ${product.name}`}
            className={`${cardButton} border-black bg-white hover:border-amber-700 hover:bg-amber-700 hover:text-white`}
          >
            Choisir une taille
          </Link>
        )}
      </div>
    </article>
  )
}

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div
    className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
    aria-busy="true"
  >
    <span className="sr-only">Chargement des produits…</span>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="animate-pulse" aria-hidden="true">
        <div className="aspect-[3/4] w-full bg-black/5" />
        <div className="mt-3 h-3 w-1/3 bg-black/5" />
        <div className="mt-2 h-4 w-2/3 bg-black/10" />
        <div className="mt-2 h-3 w-1/4 bg-black/5" />
        <div className="mt-3 h-11 w-full bg-black/5" />
      </div>
    ))}
  </div>
)

export const LoadError = ({ message, onRetry }) => (
  <div role="alert" className="border-y border-black/10 py-12 text-center">
    <p className="text-sm text-black/75">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-11 items-center border border-black px-6 text-xs font-semibold uppercase tracking-wide transition-colors hover:border-amber-700 hover:bg-amber-700 hover:text-white"
      >
        Réessayer
      </button>
    )}
  </div>
)
