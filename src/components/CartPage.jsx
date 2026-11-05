import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Minus, Plus, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { MAX_QUANTITY, useCart } from "../context/CartContext"
import { api } from "../lib/api"
import { formatPrice, formatSize } from "../lib/format"
import { usePageTitle } from "../hooks/usePageTitle"

const OrderConfirmation = ({ order }) => (
  <div className="border-y border-black/10 py-10">
    <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Merci !</p>
    <h2 className="mt-3 text-2xl font-bold uppercase tracking-tight">
      Commande n° {order.id} enregistrée
    </h2>
    <p className="mt-4 max-w-lg text-sm text-black/60">
      Total : <strong className="price text-black">{formatPrice(order.total)}</strong>. Nous revenons vers toi
      rapidement pour la livraison et le paiement.
    </p>
    <div className="mt-8 flex flex-wrap gap-4">
      <Link
        to="/account"
        className="inline-flex min-h-12 items-center justify-center border border-black bg-black px-7 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700"
      >
        Suivre mes commandes
      </Link>
      <Link
        to="/collections"
        className="inline-flex min-h-12 items-center justify-center border border-black px-7 text-sm font-semibold uppercase tracking-wide transition-colors hover:border-amber-700 hover:bg-amber-700 hover:text-white"
      >
        Continuer mes achats
      </Link>
    </div>
  </div>
)

export const CartPage = () => {
  const { items, total, setQuantity, removeFromCart, clearCart } = useCart()
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)

  usePageTitle(order ? "Commande confirmée" : "Panier")

  const checkout = async () => {
    if (!user) {
      navigate("/account?redirect=/cart")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const created = await api.createOrder(
        items.map((item) => ({ productId: item.id, size: item.size, quantity: item.quantity })),
        token,
      )
      clearCart()
      setOrder(created)
    } catch (err) {
      if (err.status === 401) {
        logout()
        navigate("/account?redirect=/cart")
        return
      }
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8 lg:py-24">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            Votre sélection
          </span>
          <h1 className="mt-3 text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl">
            Panier
          </h1>
        </div>

        {order ? (
          <OrderConfirmation order={order} />
        ) : items.length === 0 ? (
          <div className="border-t border-black/10 py-10">
            <p className="text-sm text-black/60">Votre panier est vide.</p>
            <Link
              to="/collections"
              className="inline-flex min-h-11 items-center justify-center mt-6 border border-black px-6 text-xs font-semibold uppercase tracking-wide transition-colors hover:border-amber-700 hover:bg-amber-700 hover:text-white"
            >
              Voir la collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="border-y border-black/10">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center gap-4 border-b border-black/10 py-4 last:border-b-0"
                >
                  <Link to={`/shop/${item.id}`} className="flex-shrink-0">
                    <img src={item.image} alt={item.name} className="h-24 w-20 object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-black/60">{item.category}</p>
                    <h2 className="mt-1 text-sm font-semibold uppercase tracking-wide">
                      <Link to={`/shop/${item.id}`} className="hover:text-amber-700">
                        {item.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-xs text-black/75">
                      <span className="font-semibold text-black">{formatSize(item.size)}</span>
                    </p>
                    <p className="price mt-0.5 text-xs text-black/60">{formatPrice(item.price)} l&apos;unité</p>
                    <div className="mt-3 inline-flex items-center border border-black/20">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                        className="flex h-11 w-11 items-center justify-center transition-colors hover:text-amber-700"
                        aria-label={`Retirer un ${item.name} taille ${item.size}`}
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span className="price min-w-8 text-center text-sm font-semibold" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                        disabled={item.quantity >= MAX_QUANTITY}
                        className="flex h-11 w-11 items-center justify-center transition-colors hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Ajouter un ${item.name} taille ${item.size}`}
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.key)}
                      className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center text-black/60 transition-colors hover:text-black"
                      aria-label={`Supprimer ${item.name} taille ${item.size} du panier`}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                    <p className="price text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-start gap-5 sm:items-end">
              <p className="price text-lg font-semibold uppercase">Total : {formatPrice(total)}</p>
              <p className="-mt-3 text-xs text-black/60">Prix confirmé à la validation. Livraison et paiement organisés avec toi après la commande.</p>
              {error && (
                <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={checkout}
                disabled={submitting}
                className="inline-flex min-h-12 w-full items-center justify-center border border-black bg-black px-8 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Envoi…" : user ? "Commander" : "Se connecter pour commander"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
