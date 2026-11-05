import { useEffect } from "react"
import { Link } from "react-router-dom"
import { Check, X } from "lucide-react"
import { useCart } from "../context/CartContext"
import { formatSize } from "../lib/format"

const DURATION = 4500

// Confirmation d'ajout au panier : visible, annoncée aux lecteurs d'écran, sans voler le focus.
export const CartToast = () => {
  const { notice, dismissNotice } = useCart()

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(dismissNotice, DURATION)
    return () => clearTimeout(timer)
  }, [notice, dismissNotice])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      {notice && (
        <div
          key={notice.id}
          className="toast-enter pointer-events-auto flex w-full max-w-sm items-center gap-3 border border-black bg-white p-3 shadow-[6px_6px_0_0_#0a0a0a]"
        >
          <img src={notice.image} alt="" className="h-16 w-12 flex-shrink-0 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
              Ajouté au panier
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold uppercase" title={notice.name}>
              {notice.name}
            </p>
            {notice.size && <p className="text-xs text-black/75">{formatSize(notice.size)}</p>}
            <Link
              to="/cart"
              onClick={dismissNotice}
              className="mt-1 inline-block text-sm font-semibold underline underline-offset-4 hover:text-accent"
            >
              Voir le panier
            </Link>
          </div>
          <button
            type="button"
            onClick={dismissNotice}
            className="-m-1 flex h-11 w-11 items-center justify-center self-start text-black/60 hover:text-black"
            aria-label="Fermer la notification"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
