import { useEffect, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { ShoppingBag, UserRound, Menu, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import logo from "../assets/logo/logo-obvx.webp"
import ShopDropdown, { SHOP_LINKS } from "./ShopDropdown"

const desktopLinkClass = ({ isActive }) =>
  `relative inline-flex min-h-11 items-center transition-colors hover:text-amber-700 ${
    isActive ? "text-amber-700 after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:bg-amber-700" : ""
  }`

const mobileLinkClass = ({ isActive }) =>
  `flex min-h-12 items-center px-2 transition-colors hover:text-amber-700 ${isActive ? "text-amber-700" : ""}`

const iconButton =
  "relative flex h-11 w-11 items-center justify-center transition-colors hover:text-amber-700"

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { count: cartCount } = useCart()
  const { user } = useAuth()

  const closeMenu = () => setIsMenuOpen(false)

  // Échap ferme le menu mobile
  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (event) => event.key === "Escape" && setIsMenuOpen(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isMenuOpen])

  const cartLabel =
    cartCount === 0 ? "Panier (vide)" : `Panier, ${cartCount} article${cartCount > 1 ? "s" : ""}`

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-amber-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <nav
          className="flex min-h-20 items-center justify-between gap-4 py-3 sm:min-h-24"
          aria-label="Navigation principale"
        >
          <Link to="/" className="flex-shrink-0" onClick={closeMenu} aria-label="OBVX, accueil">
            <img
              src={logo}
              alt=""
              width={720}
              height={319}
              fetchPriority="high"
              className="h-auto w-[116px] object-contain sm:w-[150px]"
            />
          </Link>

          <ul className="hidden text-sm font-semibold uppercase tracking-wide md:flex md:items-center md:gap-8">
            <li>
              <NavLink to="/" end className={desktopLinkClass}>
                Accueil
              </NavLink>
            </li>
            <li>
              <ShopDropdown />
            </li>
            <li>
              <NavLink to="/about" className={desktopLinkClass}>
                À propos
              </NavLink>
            </li>
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              className={`${iconButton} hidden md:flex md:w-auto md:gap-2 md:px-2`}
              to="/account"
              aria-label={user ? `Mon compte, connecté en tant que ${user.firstName}` : "Mon compte"}
            >
              <UserRound size={22} strokeWidth={1.8} aria-hidden="true" />
              {user && (
                <span className="max-w-24 truncate text-xs font-semibold uppercase tracking-wide">
                  {user.firstName}
                </span>
              )}
            </Link>

            <Link className={iconButton} to="/cart" aria-label={cartLabel}>
              <ShoppingBag size={22} strokeWidth={1.8} aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs font-semibold text-white"
                  aria-hidden="true"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className={`${iconButton} md:hidden`}
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMenuOpen}
              aria-controls="menu-mobile"
            >
              {isMenuOpen ? (
                <X size={24} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Menu size={24} strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {/* inert : le menu fermé n'est ni cliquable ni atteignable au clavier */}
        <div
          id="menu-mobile"
          inert={!isMenuOpen}
          className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
            isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <ul className="flex flex-col border-t border-black/10 py-3 text-sm font-semibold uppercase tracking-wide">
              <li>
                <NavLink to="/" end onClick={closeMenu} className={mobileLinkClass}>
                  Accueil
                </NavLink>
              </li>
              <li className="px-2 pb-1 pt-4 text-xs text-black/60">Boutique</li>
              {SHOP_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={closeMenu}
                    className="flex min-h-12 items-center pl-6 pr-2 font-medium normal-case tracking-normal transition-colors hover:text-amber-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-black/10 pt-2">
                <NavLink to="/about" onClick={closeMenu} className={mobileLinkClass}>
                  À propos
                </NavLink>
              </li>
              <li>
                <NavLink to="/account" onClick={closeMenu} className={mobileLinkClass}>
                  {user ? `Mon compte (${user.firstName})` : "Mon compte"}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}
