import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, MapPin, MessageCircle, Phone, RefreshCw, Search, StickyNote } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { adminApi } from "../../lib/api"
import { formatDate, formatPrice, formatSize } from "../../lib/format"
import { ORDER_STATUSES, statusInfo } from "../../lib/orderStatus"

const PAGE_SIZE = 20

// Lien WhatsApp seulement si le numéro est au format international (+225…, 00225…)
const whatsappLink = (phone) => {
  if (!phone) return null
  const trimmed = phone.trim()
  if (!trimmed.startsWith("+") && !trimmed.startsWith("00")) return null
  const digits = trimmed.replace(/\D/g, "").replace(/^00/, "")
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}

export const AdminOrders = () => {
  const { token, logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [status, setStatus] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [state, setState] = useState({ loading: true, error: null, data: null })
  const [reloadKey, setReloadKey] = useState(0)
  const [announce, setAnnounce] = useState("")

  const handleError = useCallback(
    (error) => {
      if (error.status === 401) logout()
      return error.message
    },
    [logout],
  )

  // Recherche lancée 300 ms après la dernière frappe
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    adminApi
      .summary(token)
      .then((data) => !cancelled && setSummary(data))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [token, reloadKey])

  useEffect(() => {
    const controller = new AbortController()
    adminApi
      .orders(token, { status, q: query, page, size: PAGE_SIZE }, controller.signal)
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((error) => {
        if (error.name === "AbortError") return
        setState({ loading: false, error: handleError(error), data: null })
      })
    return () => controller.abort()
  }, [token, status, query, page, reloadKey, handleError])

  const refresh = () => {
    setState((s) => ({ ...s, loading: true }))
    setReloadKey((k) => k + 1)
  }

  const chooseStatus = (key) => {
    setStatus(key)
    setPage(0)
    setState((s) => ({ ...s, loading: true }))
  }

  const changeStatus = async (order, newStatus) => {
    const previous = order.status
    const apply = (value) =>
      setState((s) => ({
        ...s,
        data: s.data && {
          ...s.data,
          items: s.data.items.map((o) => (o.id === order.id ? { ...o, status: value } : o)),
        },
      }))
    apply(newStatus)
    try {
      await adminApi.setOrderStatus(token, order.id, newStatus)
      setAnnounce(`Commande ${order.id} : ${statusInfo(newStatus).label}`)
      adminApi.summary(token).then(setSummary).catch(() => {})
    } catch (error) {
      apply(previous)
      setAnnounce(`Échec : ${handleError(error)}`)
    }
  }

  const data = state.data

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {/* Chiffres clés : cliquer filtre la liste */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ORDER_STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => chooseStatus(status === s.key ? "" : s.key)}
            aria-pressed={status === s.key}
            className={`border p-4 text-left transition-colors ${
              status === s.key ? "border-black bg-black text-white" : "border-black/15 hover:border-black"
            }`}
          >
            <span className="block text-xs font-semibold uppercase tracking-wide opacity-75">{s.label}</span>
            <span className="price mt-1 block text-2xl font-extrabold">
              {summary ? summary.countByStatus[s.key] ?? 0 : "–"}
            </span>
          </button>
        ))}
        <div className="col-span-2 border border-black/15 bg-amber-50 p-4 sm:col-span-3 lg:col-span-1">
          <span className="block text-xs font-semibold uppercase tracking-wide text-black/75">
            Chiffre d&apos;affaires
          </span>
          <span className="price mt-1 block text-lg font-extrabold">
            {summary ? formatPrice(summary.revenue) : "–"}
          </span>
          <span className="block text-xs text-black/60">hors commandes annulées</span>
        </div>
      </div>

      {/* Recherche */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Rechercher une commande</span>
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/60"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nom, email, téléphone ou n° de commande"
            className="min-h-11 w-full border border-black/30 bg-white pl-10 pr-4 text-base hover:border-black/60 focus:border-black sm:text-sm"
          />
        </label>
        {status && (
          <button
            type="button"
            onClick={() => chooseStatus("")}
            className="inline-flex min-h-11 items-center border border-black/20 px-4 text-xs font-semibold uppercase tracking-wide hover:border-black"
          >
            Tous les statuts
          </button>
        )}
        <button
          type="button"
          onClick={refresh}
          className="inline-flex min-h-11 items-center gap-2 border border-black/20 px-4 text-xs font-semibold uppercase tracking-wide hover:border-black"
        >
          <RefreshCw size={15} aria-hidden="true" className={state.loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Liste */}
      <div className="mt-6" aria-busy={state.loading}>
        {state.error ? (
          <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : !data ? (
          <p className="py-10 text-sm text-black/60">Chargement des commandes…</p>
        ) : data.items.length === 0 ? (
          <p className="border-y border-black/10 py-10 text-center text-sm text-black/60">
            {query || status ? "Aucune commande ne correspond à ces critères." : "Aucune commande pour le moment."}
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-black/60">
              {data.totalItems} commande{data.totalItems > 1 ? "s" : ""}
            </p>
            <ul className={`space-y-4 ${state.loading ? "opacity-60" : ""}`}>
              {data.items.map((order) => (
                <OrderCard key={order.id} order={order} onStatusChange={changeStatus} />
              ))}
            </ul>

            {data.totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Pages de commandes">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex min-h-11 items-center gap-1 border border-black/20 px-4 text-xs font-semibold uppercase tracking-wide hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} aria-hidden="true" /> Précédentes
                </button>
                <span className="text-sm text-black/60">
                  Page {data.page + 1} / {data.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex min-h-11 items-center gap-1 border border-black/20 px-4 text-xs font-semibold uppercase tracking-wide hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivantes <ChevronRight size={16} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const OrderCard = ({ order, onStatusChange }) => {
  const info = statusInfo(order.status)
  const wa = whatsappLink(order.phone)
  const selectId = `statut-${order.id}`

  return (
    <li className="border border-black/15 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">
            Commande n° {order.id}
            <span className={`ml-3 px-2 py-1 align-middle text-xs ${info.className}`}>{info.label}</span>
          </p>
          <p className="mt-1 text-xs text-black/60">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wide text-black/60">
            Statut
          </label>
          <select
            id={selectId}
            value={order.status}
            onChange={(e) => onStatusChange(order, e.target.value)}
            className="min-h-11 cursor-pointer border border-black/30 bg-white px-3 text-sm font-medium hover:border-black"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Client et livraison */}
        <div className="space-y-2 text-sm">
          <p className="font-semibold">
            {order.customer.firstName} {order.customer.lastName}
            <a
              href={`mailto:${order.customer.email}`}
              className="ml-2 font-normal text-black/60 underline-offset-4 hover:text-amber-700 hover:underline"
            >
              {order.customer.email}
            </a>
          </p>
          {order.phone ? (
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href={`tel:${order.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-8 items-center gap-1.5 font-semibold hover:text-amber-700"
              >
                <Phone size={15} aria-hidden="true" />
                {order.phone}
              </a>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-8 items-center gap-1.5 text-emerald-800 hover:underline"
                >
                  <MessageCircle size={15} aria-hidden="true" />
                  WhatsApp
                </a>
              )}
            </p>
          ) : (
            <p className="text-black/60">Pas de téléphone (commande antérieure)</p>
          )}
          {order.address && (
            <p className="flex gap-1.5">
              <MapPin size={15} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
              {order.address}
            </p>
          )}
          {order.note && (
            <p className="flex gap-1.5 bg-amber-50 px-2 py-1.5">
              <StickyNote size={15} className="mt-0.5 flex-shrink-0 text-amber-700" aria-hidden="true" />
              {order.note}
            </p>
          )}
        </div>

        {/* Articles */}
        <div>
          <ul className="divide-y divide-black/10 border-y border-black/10 text-sm">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.size}`} className="flex items-center gap-3 py-2">
                <img src={item.image} alt="" width={40} height={53} loading="lazy" className="h-[53px] w-10 object-cover" />
                <span className="flex-1">
                  <span className="font-semibold">{item.quantity} ×</span> {item.name}
                  {item.size && <span className="text-black/60"> — {formatSize(item.size).toLowerCase()}</span>}
                </span>
                <span className="price">{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="price mt-2 text-right font-bold">Total : {formatPrice(order.total)}</p>
        </div>
      </div>
    </li>
  )
}
