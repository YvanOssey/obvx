import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ChevronRight, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react"
import { api } from "../lib/api"
import { formatPrice } from "../lib/format"
import { useCart } from "../context/CartContext"
import { usePageTitle } from "../hooks/usePageTitle"
import { LoadError } from "./ProductCard"

// La clé force un état neuf quand on passe d'un produit à un autre.
export const ProductPage = () => {
  const { id } = useParams()
  return <ProductDetails key={id} id={id} />
}

const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 border border-black bg-black px-8 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700"

const ProductDetails = ({ id }) => {
  const { addToCart } = useCart()
  const [state, setState] = useState({ status: "loading", product: null, error: null })
  const [showBack, setShowBack] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [size, setSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)
  const sizeGroupRef = useRef(null)

  usePageTitle(
    state.product?.name ?? (state.status === "notFound" ? "Produit introuvable" : "Produit"),
  )

  useEffect(() => {
    const controller = new AbortController()
    api
      .product(id, { signal: controller.signal })
      .then((product) => {
        // Taille unique : présélectionnée
        if (product.sizes?.length === 1) setSize(product.sizes[0])
        setState({ status: "ready", product, error: null })
      })
      .catch((error) => {
        if (error.name === "AbortError") return
        setState({
          status: error.status === 404 ? "notFound" : "error",
          product: null,
          error: error.message,
        })
      })
    return () => controller.abort()
  }, [id, attempt])

  const retry = () => {
    setState({ status: "loading", product: null, error: null })
    setAttempt((n) => n + 1)
  }

  if (state.status === "loading") {
    return (
      <div
        className="mx-auto grid max-w-6xl animate-pulse grid-cols-1 gap-10 px-4 py-12 sm:px-8 lg:grid-cols-2 lg:py-20"
        aria-busy="true"
      >
        <span className="sr-only">Chargement du produit…</span>
        <div className="aspect-[3/4] bg-black/5" />
        <div className="space-y-4 lg:pt-16">
          <div className="h-4 w-1/4 bg-black/5" />
          <div className="h-10 w-2/3 bg-black/10" />
          <div className="h-5 w-1/3 bg-black/5" />
          <div className="mt-8 h-12 w-full bg-black/10" />
        </div>
      </div>
    )
  }

  if (state.status === "notFound") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-8">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">Produit introuvable</h1>
        <p className="mt-4 text-sm text-black/60">
          Ce produit n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link to="/collections" className={`${primaryButton} mt-8`}>
          Voir la collection
        </Link>
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-8">
        <LoadError message={state.error} onRetry={retry} />
      </div>
    )
  }

  const { product } = state
  const views = [
    { back: false, label: "Face", src: product.image },
    ...(product.backImage ? [{ back: true, label: "Dos", src: product.backImage }] : []),
  ]
  const image = showBack && product.backImage ? product.backImage : product.image

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-14">
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" className="mb-8 text-xs uppercase tracking-wide text-black/60">
          <ol className="flex flex-wrap items-center gap-1">
            <li className="flex items-center gap-1">
              <Link to="/" className="inline-flex min-h-6 items-center hover:text-amber-700">
                Accueil
              </Link>
              <ChevronRight size={14} aria-hidden="true" />
            </li>
            <li className="flex items-center gap-1">
              <Link to="/collections" className="inline-flex min-h-6 items-center hover:text-amber-700">
                Collection
              </Link>
              <ChevronRight size={14} aria-hidden="true" />
            </li>
            <li aria-current="page" className="font-semibold text-black">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="relative overflow-hidden border border-black/10 bg-cream">
              {product.isNew && (
                <span className="absolute left-4 top-4 z-10 bg-black px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Nouveau
                </span>
              )}
              <img
                src={image}
                alt={`${product.name}, vue de ${showBack ? "dos" : "face"}`}
                width={900}
                height={1200}
                fetchPriority="high"
                className="aspect-[3/4] h-auto w-full object-cover"
              />
            </div>
            {views.length > 1 && (
              <div className="mt-4 flex gap-3" role="group" aria-label="Choisir la vue">
                {views.map((view) => (
                  <button
                    key={view.label}
                    type="button"
                    onClick={() => setShowBack(view.back)}
                    aria-pressed={showBack === view.back}
                    aria-label={`Vue de ${view.label.toLowerCase()}`}
                    className={`w-20 border-2 transition-colors ${
                      showBack === view.back ? "border-black" : "border-transparent hover:border-amber-700"
                    }`}
                  >
                    <img
                      src={view.src}
                      alt=""
                      width={80}
                      height={107}
                      loading="lazy"
                      className="aspect-[3/4] h-auto w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              {product.category}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-balance sm:text-5xl">
              {product.name}
            </h1>
            <p className="price mt-5 text-2xl font-semibold">{formatPrice(product.price)}</p>

            {product.sizes?.length > 0 && (
              <fieldset className="mt-8" aria-describedby={sizeError ? "taille-erreur" : undefined}>
                <legend className="text-xs font-semibold uppercase tracking-wide">
                  Taille
                  {size && <span className="font-normal normal-case text-black/60"> : {size}</span>}
                </legend>
                <div ref={sizeGroupRef} className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((option) => (
                    <label key={option} className="cursor-pointer">
                      <input
                        type="radio"
                        name="taille"
                        value={option}
                        checked={size === option}
                        onChange={() => {
                          setSize(option)
                          setSizeError(false)
                        }}
                        className="peer sr-only"
                      />
                      <span
                        className={`inline-flex min-h-12 min-w-12 items-center justify-center border px-4 text-sm font-semibold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-700 ${
                          size === option
                            ? "border-black bg-black text-white"
                            : `${sizeError ? "border-red-600" : "border-black/30"} bg-white hover:border-black`
                        }`}
                      >
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                {sizeError && (
                  <p id="taille-erreur" role="alert" className="mt-3 text-sm font-medium text-red-700">
                    Choisis une taille avant d&apos;ajouter au panier.
                  </p>
                )}
              </fieldset>
            )}

            <button
              type="button"
              onClick={() => {
                if (!size) {
                  setSizeError(true)
                  sizeGroupRef.current?.querySelector("input")?.focus()
                  return
                }
                addToCart(product, size)
              }}
              className={`${primaryButton} mt-8 w-full`}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              Ajouter au panier
            </button>

            <ul className="mt-10 space-y-4 border-t border-black/10 pt-8 text-sm text-black/75">
              <li className="flex gap-3">
                <ShieldCheck size={20} className="flex-shrink-0 text-amber-700" aria-hidden="true" />
                <span>Prix vérifié par nos serveurs au moment de la commande.</span>
              </li>
              <li className="flex gap-3">
                <MessageCircle size={20} className="flex-shrink-0 text-amber-700" aria-hidden="true" />
                <span>
                  Après ta commande, l&apos;équipe OBVX te recontacte pour la livraison et le paiement.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
