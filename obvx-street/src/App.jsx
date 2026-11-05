import { lazy, Suspense, useEffect, useRef } from "react"
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom"
import { Navbar } from "./components/Navbar"
import { Footer } from "./components/Footer"
import { CartToast } from "./components/CartToast"
import { Home } from "./components/Home"
import { FeaturedCollection } from "./components/FeaturedCollection"
import { usePageTitle } from "./hooks/usePageTitle"

// Pages secondaires chargées à la demande : l'accueil s'affiche plus vite
const CollectionsPage = lazy(() =>
  import("./components/CollectionsPage").then((m) => ({ default: m.CollectionsPage })),
)
const ProductPage = lazy(() =>
  import("./components/ProductPage").then((m) => ({ default: m.ProductPage })),
)
const CartPage = lazy(() => import("./components/CartPage").then((m) => ({ default: m.CartPage })))
const About = lazy(() => import("./components/About").then((m) => ({ default: m.About })))
const AdminPage = lazy(() =>
  import("./components/admin/AdminPage").then((m) => ({ default: m.AdminPage })),
)
const AccountPage = lazy(() =>
  import("./components/AccountPage").then((m) => ({ default: m.AccountPage })),
)

const HomePage = () => {
  usePageTitle(null)
  return (
    <>
      <Home />
      <FeaturedCollection />
    </>
  )
}

const NotFound = () => {
  usePageTitle("Page introuvable")
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-8">
      <h1 className="text-4xl font-bold uppercase tracking-tight">Page introuvable</h1>
      <p className="mt-4 text-sm text-black/60">Le lien est peut-être cassé ou la page a été déplacée.</p>
      <Link
        to="/"
        className="mt-8 inline-block border border-black bg-black px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}

const PageFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true">
    <span className="sr-only">Chargement de la page…</span>
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-black" aria-hidden="true" />
  </div>
)

export const App = () => {
  const { pathname } = useLocation()
  const mainRef = useRef(null)
  const isFirstRender = useRef(true)

  // À chaque changement de page : retour en haut et focus sur le contenu (lecteurs d'écran)
  useEffect(() => {
    window.scrollTo(0, 0)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col bg-cream pt-20 sm:pt-24">
      <a
        href="#contenu"
        className="fixed left-4 top-4 z-[70] -translate-y-24 bg-black px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-transform focus:translate-y-0"
      >
        Aller au contenu
      </a>
      <Navbar />
      <main id="contenu" ref={mainRef} tabIndex={-1} className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/shop" element={<Navigate to="/collections" replace />} />
            <Route path="/shop/:id" element={<ProductPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CartToast />
    </div>
  )
}
