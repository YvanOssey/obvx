import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, Pencil, Plus } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { adminApi } from "../../lib/api"
import { formatPrice } from "../../lib/format"
import { invalidateProducts } from "../../hooks/useProducts"
import { ProductForm } from "./ProductForm"

export const AdminProducts = () => {
  const { token, logout } = useAuth()
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)
  const [uploadEnabled, setUploadEnabled] = useState(false)
  // null = formulaire fermé, "new" = création, sinon le produit modifié
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState("")
  const [filter, setFilter] = useState("tous")

  const load = useCallback(() => {
    adminApi
      .products(token)
      .then((list) => {
        setProducts(list)
        setError(null)
      })
      .catch((err) => {
        if (err.status === 401) logout()
        setError(err.message)
      })
  }, [token, logout])

  useEffect(() => {
    load()
    adminApi
      .uploadStatus(token)
      .then((s) => setUploadEnabled(s.enabled))
      .catch(() => {})
  }, [load, token])

  const saved = (product, wasEdit) => {
    invalidateProducts()
    setEditing(null)
    setMessage(wasEdit ? `« ${product.name} » enregistré.` : `« ${product.name} » créé.`)
    load()
  }

  const toggleVisible = async (product) => {
    try {
      await adminApi.updateProduct(token, product.id, { ...product, active: !product.active })
      invalidateProducts()
      setMessage(`« ${product.name} » ${product.active ? "masqué" : "visible"} dans la boutique.`)
      load()
    } catch (err) {
      setMessage(`Échec : ${err.message}`)
    }
  }

  const visibleList = (products ?? []).filter((p) =>
    filter === "tous" ? true : filter === "visibles" ? p.active : !p.active,
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les produits">
          {[
            ["tous", "Tous"],
            ["visibles", "Visibles"],
            ["masques", "Masqués"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`inline-flex min-h-11 items-center border px-4 text-xs font-semibold uppercase tracking-wide ${
                filter === key ? "border-black bg-black text-white" : "border-black/20 hover:border-black"
              }`}
            >
              {label}
              {products && (
                <span className="ml-2 opacity-70">
                  {key === "tous"
                    ? products.length
                    : products.filter((p) => (key === "visibles" ? p.active : !p.active)).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setMessage("")
            setEditing("new")
          }}
          className="inline-flex min-h-12 items-center gap-2 border border-black bg-black px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700"
        >
          <Plus size={18} aria-hidden="true" />
          Nouveau produit
        </button>
      </div>

      <p className="mt-4 min-h-5 text-sm font-medium text-emerald-800" role="status" aria-live="polite">
        {message}
      </p>

      {!uploadEnabled && products && (
        <p className="mt-2 text-xs text-black/60">
          Envoi de photos désactivé : ajoute CLOUDINARY_URL sur Render pour envoyer des photos depuis ici. En
          attendant, colle l&apos;adresse d&apos;une image.
        </p>
      )}

      {editing && (
        <div className="mt-6">
          <ProductForm
            key={editing === "new" ? "new" : editing.id}
            product={editing === "new" ? null : editing}
            uploadEnabled={uploadEnabled}
            onSaved={saved}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="mt-8">
        {error ? (
          <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : !products ? (
          <p className="text-sm text-black/60">Chargement des produits…</p>
        ) : visibleList.length === 0 ? (
          <p className="border-y border-black/10 py-10 text-center text-sm text-black/60">Aucun produit.</p>
        ) : (
          <ul className="divide-y divide-black/10 border-y border-black/10">
            {visibleList.map((product) => (
              <li
                key={product.id}
                className={`flex flex-wrap items-center gap-4 py-4 ${product.active ? "" : "bg-black/[0.03]"}`}
              >
                <img
                  src={product.image}
                  alt=""
                  width={56}
                  height={75}
                  loading="lazy"
                  className={`h-[75px] w-14 flex-shrink-0 object-cover ${product.active ? "" : "opacity-50 grayscale"}`}
                />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    {product.name}
                    {product.isNew && (
                      <span className="ml-2 bg-black px-1.5 py-0.5 align-middle text-xs text-white">Nouveau</span>
                    )}
                    {!product.active && (
                      <span className="ml-2 bg-black/10 px-1.5 py-0.5 align-middle text-xs">Masqué</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-black/60">
                    {product.category} · {product.sizes.join(", ")}
                  </p>
                  {product.active && (
                    <Link
                      to={`/shop/${product.id}`}
                      className="mt-0.5 inline-block text-xs text-black/60 underline-offset-4 hover:text-amber-700 hover:underline"
                    >
                      /shop/{product.id}
                    </Link>
                  )}
                </div>
                <p className="price w-28 text-right text-sm font-semibold">{formatPrice(product.price)}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleVisible(product)}
                    aria-label={product.active ? `Masquer ${product.name}` : `Afficher ${product.name}`}
                    title={product.active ? "Masquer de la boutique" : "Afficher dans la boutique"}
                    className="flex h-11 w-11 items-center justify-center border border-black/20 hover:border-black"
                  >
                    {product.active ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessage("")
                      setEditing(product)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="inline-flex min-h-11 items-center gap-2 border border-black/20 px-4 text-xs font-semibold uppercase tracking-wide hover:border-black"
                  >
                    <Pencil size={15} aria-hidden="true" />
                    Modifier
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
