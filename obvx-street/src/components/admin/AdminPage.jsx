import { Link, useSearchParams } from "react-router-dom"
import { ClipboardList, Shirt } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { usePageTitle } from "../../hooks/usePageTitle"
import { AdminOrders } from "./AdminOrders"
import { AdminProducts } from "./AdminProducts"

const TABS = [
  { key: "commandes", label: "Commandes", icon: ClipboardList },
  { key: "produits", label: "Produits", icon: Shirt },
]

export const AdminPage = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = TABS.find((t) => t.key === searchParams.get("onglet")) ?? TABS[0]

  usePageTitle(`Admin · ${tab.label}`)

  if (!user) {
    return (
      <Notice title="Espace administrateur">
        Connecte-toi avec ton compte administrateur pour continuer.
        <Link
          to="/account?redirect=/admin"
          className="mt-6 inline-flex min-h-12 items-center border border-black bg-black px-7 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700"
        >
          Se connecter
        </Link>
      </Notice>
    )
  }

  if (!user.admin) {
    return (
      <Notice title="Accès réservé">
        Ce compte n&apos;a pas les droits d&apos;administration.
      </Notice>
    )
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              Espace administrateur
            </span>
            <h1 className="mt-2 text-4xl font-extrabold uppercase leading-[0.95] tracking-tight">
              {tab.label}
            </h1>
          </div>
          <nav aria-label="Sections de l'admin" className="flex border border-black">
            {TABS.map((t) => {
              const Icon = t.icon
              const active = t.key === tab.key
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setSearchParams(t.key === "commandes" ? {} : { onglet: t.key })}
                  className={`inline-flex min-h-11 items-center gap-2 px-5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    active ? "bg-black text-white" : "hover:text-amber-700"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {t.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-10">{tab.key === "commandes" ? <AdminOrders /> : <AdminProducts />}</div>
      </div>
    </div>
  )
}

const Notice = ({ title, children }) => {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-8">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight">{title}</h1>
      <div className="mt-4 flex flex-col items-center text-sm text-black/70">{children}</div>
    </div>
  )
}
