import { useEffect, useRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { usePageTitle } from "../hooks/usePageTitle"
import { statusInfo } from "../lib/orderStatus"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/api"
import { formatDate, formatPrice, formatSize } from "../lib/format"

const inputClass =
  "mt-2 min-h-12 w-full border border-black/30 bg-white px-4 text-base transition-colors hover:border-black/60 focus:border-black"

const Label = ({ children, required }) => (
  <span className="text-xs font-semibold uppercase tracking-wide text-black/75">
    {children}
    {required && (
      <span className="text-amber-700" aria-hidden="true">
        {" "}*
      </span>
    )}
  </span>
)

const Field = ({ label, hint, ...props }) => {
  const hintId = hint ? `${props.name}-aide` : undefined
  return (
    <label className="block">
      <Label required={props.required}>{label}</Label>
      <input className={inputClass} aria-describedby={hintId} {...props} />
      {hint && (
        <span id={hintId} className="mt-1.5 block text-xs text-black/60">
          {hint}
        </span>
      )}
    </label>
  )
}

// Mot de passe avec bouton afficher/masquer ; le collage et les gestionnaires de mots de passe restent permis
const PasswordField = ({ label, hint, ...props }) => {
  const [visible, setVisible] = useState(false)
  const hintId = hint ? `${props.name}-aide` : undefined
  return (
    <div>
      <label htmlFor={props.id}>
        <Label required={props.required}>{label}</Label>
      </label>
      <div className="relative">
        <input
          className={`${inputClass} pr-14`}
          type={visible ? "text" : "password"}
          aria-describedby={hintId}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute bottom-0.5 right-0.5 flex h-11 w-11 items-center justify-center text-black/60 transition-colors hover:text-black"
        >
          {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </button>
      </div>
      {hint && (
        <span id={hintId} className="mt-1.5 block text-xs text-black/60">
          {hint}
        </span>
      )}
    </div>
  )
}

const AuthForms = () => {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState("login")
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const errorRef = useRef(null)

  // Après un échec, le message d'erreur reçoit le focus pour être lu immédiatement
  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  // Uniquement des chemins internes (évite une redirection vers un autre site)
  const redirect = searchParams.get("redirect")
  const safeRedirect = redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : null

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setError(null)
    setSubmitting(true)
    try {
      if (mode === "login") await login({ email: data.email, password: data.password })
      else await register(data)
      if (safeRedirect) navigate(safeRedirect, { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setError(null)
  }

  return (
    <div className="mx-auto max-w-md">
      {safeRedirect === "/cart" && (
        <p className="mb-8 border-l-2 border-amber-700 bg-amber-50 px-4 py-3 text-sm text-black/70">
          Connecte-toi ou crée un compte pour valider ta commande. Ton panier est conservé.
        </p>
      )}

      <div className="mb-8 grid grid-cols-2 border border-black" role="group" aria-label="Se connecter ou créer un compte">
        {[
          { key: "login", label: "Connexion" },
          { key: "register", label: "Inscription" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={mode === tab.key}
            onClick={() => switchMode(tab.key)}
            className={`min-h-12 text-xs font-semibold uppercase tracking-wide transition-colors ${
              mode === tab.key ? "bg-black text-white" : "hover:text-amber-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form key={mode} onSubmit={handleSubmit} className="space-y-5" aria-label={mode === "login" ? "Connexion" : "Création de compte"}>
        {mode === "register" && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Prénom" name="firstName" autoComplete="given-name" required maxLength={60} />
            <Field label="Nom" name="lastName" autoComplete="family-name" required maxLength={60} />
          </div>
        )}
        <Field label="Email" name="email" type="email" autoComplete="email" required maxLength={120} />
        <PasswordField
          id="password"
          label="Mot de passe"
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "register" ? 8 : undefined}
          maxLength={72}
          hint={mode === "register" ? "8 caractères minimum." : undefined}
        />
        <p className="text-xs text-black/60">
          <span className="text-amber-700" aria-hidden="true">*</span> Champ obligatoire
        </p>

        {error && (
          <p ref={errorRef} tabIndex={-1} role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-12 items-center justify-center w-full border border-black bg-black px-8 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting
            ? "Un instant…"
            : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
        </button>
      </form>
    </div>
  )
}

const OrderHistory = () => {
  const { token, logout } = useAuth()
  const [state, setState] = useState({ status: "loading", orders: [], error: null })

  useEffect(() => {
    let cancelled = false
    api
      .myOrders(token)
      .then((orders) => !cancelled && setState({ status: "ready", orders, error: null }))
      .catch((error) => {
        if (cancelled) return
        if (error.status === 401) logout()
        else setState({ status: "error", orders: [], error: error.message })
      })
    return () => {
      cancelled = true
    }
  }, [token, logout])

  if (state.status === "loading") {
    return <p className="py-8 text-sm text-black/60">Chargement de tes commandes…</p>
  }
  if (state.status === "error") {
    return <p className="py-8 text-sm text-red-700">{state.error}</p>
  }
  if (state.orders.length === 0) {
    return (
      <div className="py-8">
        <p className="text-sm text-black/60">Tu n&apos;as pas encore passé de commande.</p>
        <Link
          to="/collections"
          className="inline-flex min-h-11 items-center justify-center mt-5 border border-black px-6 text-xs font-semibold uppercase tracking-wide transition-colors hover:border-amber-700 hover:bg-amber-700 hover:text-white"
        >
          Découvrir la collection
        </Link>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-black/10">
      {state.orders.map((order) => (
        <li key={order.id} className="py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide">Commande n° {order.id}</p>
            <span
              className={`px-2 py-1 text-xs font-semibold uppercase tracking-wide ${statusInfo(order.status).className}`}
            >
              {statusInfo(order.status).label}
            </span>
          </div>
          <p className="mt-1 text-xs text-black/60">{formatDate(order.createdAt)}</p>
          <ul className="mt-4 space-y-1 text-sm text-black/70">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.size}`} className="flex justify-between gap-4">
                <span>
                  {item.quantity} × {item.name}
                  {item.size && <span className="text-black/60"> — {formatSize(item.size).toLowerCase()}</span>}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right text-sm font-semibold">Total : {formatPrice(order.total)}</p>
          {order.address && (
            <p className="mt-2 text-xs text-black/60">
              Livraison : {order.address}
              {order.phone && ` · ${order.phone}`}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

export const AccountPage = () => {
  const { user, logout } = useAuth()
  usePageTitle(user ? "Mon compte" : "Connexion")

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8 lg:py-24">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            Espace client
          </span>
          <h1 className="mt-3 text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl">
            {user ? `Salut ${user.firstName}` : "Mon compte"}
          </h1>
        </div>

        {!user ? (
          <AuthForms />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-black/10 py-5">
              <div className="text-sm">
                <p className="font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-black/60">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-11 items-center justify-center border border-black px-6 text-xs font-semibold uppercase tracking-wide transition-colors hover:border-amber-700 hover:bg-amber-700 hover:text-white"
              >
                Se déconnecter
              </button>
            </div>

            <h2 className="mt-12 text-xl font-bold uppercase tracking-tight">Mes commandes</h2>
            <OrderHistory />
          </>
        )}
      </div>
    </div>
  )
}
