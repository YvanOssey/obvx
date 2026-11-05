import { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Eye, EyeOff, LockKeyhole } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { usePageTitle } from "../../hooks/usePageTitle"

const inputClass =
  "mt-2 min-h-12 w-full border border-black/30 bg-white px-4 text-base transition-colors hover:border-black/60 focus:border-black"

/** Connexion réservée à l'administrateur, séparée de l'espace client. */
export const AdminLoginPage = () => {
  const { user, adminLogin } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const errorRef = useRef(null)

  usePageTitle("Connexion admin")

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  if (user?.admin) return <Navigate to="/admin" replace />

  const submit = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setError(null)
    setSubmitting(true)
    try {
      await adminLogin({ email: data.email, password: data.password })
      navigate("/admin", { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-md px-4 py-16 sm:px-8 lg:py-24">
        <div className="flex h-12 w-12 items-center justify-center bg-black text-white">
          <LockKeyhole size={22} aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-amber-700">
          Espace administrateur
        </p>
        <h1 className="mt-2 text-4xl font-extrabold uppercase leading-[0.95] tracking-tight">Connexion</h1>

        {user && !user.admin && (
          <p className="mt-6 border-l-2 border-amber-700 bg-amber-50 px-4 py-3 text-sm text-black/75">
            Tu es connecté avec un compte client ({user.email}). La connexion admin le remplacera.
          </p>
        )}

        <form onSubmit={submit} className="mt-8 space-y-5" aria-label="Connexion administrateur">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-black/75">Email</span>
            <input name="email" type="email" autoComplete="username" required className={inputClass} />
          </label>
          <div>
            <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wide text-black/75">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className={`${inputClass} pr-14`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={showPassword}
                className="absolute bottom-0.5 right-0.5 flex h-11 w-11 items-center justify-center text-black/60 hover:text-black"
              >
                {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {error && (
            <p
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 w-full items-center justify-center border border-black bg-black px-8 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Connexion…" : "Accéder à l'admin"}
          </button>
        </form>
      </div>
    </div>
  )
}
