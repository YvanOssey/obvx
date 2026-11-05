import { Link } from "react-router-dom"
import logo from "../assets/logo/logo-obvx-blanc.webp"

const COLUMNS = [
  {
    title: "Boutique",
    links: [
      { to: "/collections", label: "Tous les produits" },
      { to: "/collections?filtre=nouveautes", label: "Nouveautés" },
      { to: "/collections?filtre=vetements", label: "Vêtements" },
      { to: "/collections?filtre=accessoires", label: "Accessoires" },
    ],
  },
  {
    title: "OBVX",
    links: [
      { to: "/about", label: "Notre histoire" },
      { to: "/account", label: "Mon compte" },
      { to: "/cart", label: "Panier" },
    ],
  },
]

export const Footer = () => (
  <footer className="bg-ink text-white">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-8">
      <div>
        <img src={logo} alt="OBVX — Own your streets" width={720} height={319} loading="lazy" className="h-auto w-44" />
        <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/75">
          Streetwear né dans la rue, pensé pour celles et ceux qui la font vibrer.
        </p>
      </div>
      {COLUMNS.map((column) => (
        <nav key={column.title} aria-label={column.title}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
            {column.title}
          </h2>
          <ul className="mt-5 space-y-1">
            {column.links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-block py-1.5 text-sm text-white/85 transition-colors hover:text-amber-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
    <div className="border-t border-white/15">
      <p className="mx-auto max-w-7xl px-6 py-6 text-xs text-white/70 sm:px-8">
        © {new Date().getFullYear()} OBVX. Tous droits réservés.
      </p>
    </div>
  </footer>
)
