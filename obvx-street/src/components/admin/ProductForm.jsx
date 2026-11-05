import { useEffect, useRef, useState } from "react"
import { ImageUp, Plus, X } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { adminApi } from "../../lib/api"

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "Taille unique"]
const CATEGORIES = ["Vêtements", "Accessoires"]

const inputClass =
  "mt-2 min-h-11 w-full border border-black/30 bg-white px-3 text-base hover:border-black/60 focus:border-black sm:text-sm"
const labelClass = "text-xs font-semibold uppercase tracking-wide text-black/75"

const emptyProduct = {
  id: "",
  name: "",
  category: "Vêtements",
  price: "",
  image: "",
  backImage: "",
  sizes: ["S", "M", "L", "XL", "XXL"],
  isNew: true,
  active: true,
}

/** Formulaire de création (product = null) ou de modification d'un produit. */
export const ProductForm = ({ product, uploadEnabled, onSaved, onCancel }) => {
  const { token } = useAuth()
  const isEdit = Boolean(product)
  const [form, setForm] = useState(() =>
    product ? { ...product, backImage: product.backImage ?? "", price: String(product.price) } : emptyProduct,
  )
  const [customSize, setCustomSize] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const errorRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  const set = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const toggleSize = (size) =>
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }))

  const addCustomSize = () => {
    const size = customSize.trim()
    if (size && !form.sizes.includes(size)) setForm((f) => ({ ...f, sizes: [...f.sizes, size] }))
    setCustomSize("")
  }

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    const payload = {
      id: isEdit ? undefined : form.id.trim(),
      name: form.name,
      category: form.category,
      price: Number(form.price),
      image: form.image,
      backImage: form.backImage || null,
      sizes: form.sizes,
      isNew: form.isNew,
      active: form.active,
    }
    try {
      const saved = isEdit
        ? await adminApi.updateProduct(token, product.id, payload)
        : await adminApi.createProduct(token, payload)
      onSaved(saved, isEdit)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="border-2 border-black bg-white p-4 sm:p-6"
      aria-labelledby="produit-form-titre"
    >
      <div className="flex items-start justify-between gap-4">
        <h2
          id="produit-form-titre"
          ref={titleRef}
          tabIndex={-1}
          className="text-xl font-extrabold uppercase tracking-tight"
        >
          {isEdit ? `Modifier « ${product.name} »` : "Nouveau produit"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fermer le formulaire"
          className="-m-2 flex h-11 w-11 items-center justify-center text-black/60 hover:text-black"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>
            Nom <Required />
          </span>
          <input className={inputClass} value={form.name} onChange={set("name")} required maxLength={80} />
        </label>

        <label className="block">
          <span className={labelClass}>
            Prix (FCFA) <Required />
          </span>
          <input
            className={`${inputClass} price`}
            type="number"
            inputMode="numeric"
            min={0}
            max={10000000}
            step={500}
            value={form.price}
            onChange={set("price")}
            required
          />
        </label>

        <label className="block">
          <span className={labelClass}>
            Catégorie <Required />
          </span>
          <input
            className={inputClass}
            list="categories-produit"
            value={form.category}
            onChange={set("category")}
            required
            maxLength={40}
          />
          <datalist id="categories-produit">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        {!isEdit && (
          <label className="block">
            <span className={labelClass}>Identifiant (URL)</span>
            <input
              className={inputClass}
              value={form.id}
              onChange={set("id")}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={60}
              placeholder="généré à partir du nom"
              aria-describedby="id-aide"
            />
            <span id="id-aide" className="mt-1 block text-xs text-black/60">
              Facultatif. Minuscules, chiffres et tirets. Ne peut plus changer ensuite.
            </span>
          </label>
        )}
      </div>

      <fieldset className="mt-6">
        <legend className={labelClass}>
          Tailles disponibles <Required />
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...new Set([...SIZE_PRESETS, ...form.sizes])].map((size) => {
            const checked = form.sizes.includes(size)
            return (
              <button
                key={size}
                type="button"
                aria-pressed={checked}
                onClick={() => toggleSize(size)}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center border px-3 text-sm font-semibold transition-colors ${
                  checked ? "border-black bg-black text-white" : "border-black/30 hover:border-black"
                }`}
              >
                {size}
              </button>
            )
          })}
          <span className="inline-flex items-stretch">
            <label className="sr-only" htmlFor="taille-perso">
              Autre taille
            </label>
            <input
              id="taille-perso"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomSize()
                }
              }}
              maxLength={20}
              placeholder="Autre (ex. 42)"
              className="min-h-11 w-32 border border-black/30 px-3 text-base sm:text-sm"
            />
            <button
              type="button"
              onClick={addCustomSize}
              aria-label="Ajouter cette taille"
              className="flex min-h-11 w-11 items-center justify-center border border-l-0 border-black/30 hover:border-black"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </span>
        </div>
        <p className="mt-2 text-xs text-black/60">
          Ordre d&apos;affichage : celui des clics. {form.sizes.length > 0 && `Actuellement : ${form.sizes.join(", ")}.`}
        </p>
      </fieldset>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <ImageField
          label="Photo principale"
          required
          value={form.image}
          onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          uploadEnabled={uploadEnabled}
        />
        <ImageField
          label="Photo de dos"
          value={form.backImage}
          onChange={(url) => setForm((f) => ({ ...f, backImage: url }))}
          uploadEnabled={uploadEnabled}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
        <Checkbox checked={form.isNew} onChange={set("isNew")} label="Badge « Nouveau »" />
        <Checkbox
          checked={form.active}
          onChange={set("active")}
          label="Visible dans la boutique"
          hint="Décoché : le produit est masqué mais reste dans l'historique des commandes."
        />
      </div>

      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-12 items-center border border-black/30 px-6 text-sm font-semibold uppercase tracking-wide hover:border-black"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving || form.sizes.length === 0 || !form.image}
          className="inline-flex min-h-12 items-center border border-black bg-black px-8 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le produit"}
        </button>
      </div>
    </form>
  )
}

const Required = () => (
  <span className="text-amber-700" aria-hidden="true">
    *
  </span>
)

const Checkbox = ({ checked, onChange, label, hint }) => (
  <label className="flex min-h-11 cursor-pointer items-start gap-3">
    <input type="checkbox" checked={checked} onChange={onChange} className="mt-1 h-5 w-5 accent-black" />
    <span className="text-sm">
      <span className="font-semibold">{label}</span>
      {hint && <span className="block text-xs text-black/60">{hint}</span>}
    </span>
  </label>
)

/** Photo : envoi d'un fichier (si Cloudinary est configuré) ou adresse collée. */
const ImageField = ({ label, value, onChange, required, uploadEnabled }) => {
  const { token } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const upload = async (file) => {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const { url } = await adminApi.uploadImage(token, file)
      onChange(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div>
      <span className={labelClass}>
        {label} {required && <Required />}
      </span>
      <div className="mt-2 flex gap-3">
        <div className="flex h-28 w-20 flex-shrink-0 items-center justify-center overflow-hidden border border-black/15 bg-cream">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-black/60">Aucune</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {uploadEnabled && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                id={`fichier-${label}`}
                onChange={(e) => upload(e.target.files?.[0])}
              />
              <label
                htmlFor={`fichier-${label}`}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 border border-black px-4 text-xs font-semibold uppercase tracking-wide hover:bg-black hover:text-white ${
                  uploading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <ImageUp size={16} aria-hidden="true" />
                {uploading ? "Envoi…" : "Choisir une photo"}
              </label>
            </>
          )}
          <label className="block">
            <span className="sr-only">Adresse de la {label.toLowerCase()}</span>
            <input
              className="min-h-11 w-full border border-black/30 bg-white px-3 text-base hover:border-black/60 focus:border-black sm:text-sm"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={uploadEnabled ? "ou colle une adresse d'image" : "/products/… ou https://…"}
              maxLength={500}
            />
          </label>
          {value && !required && (
            <button type="button" onClick={() => onChange("")} className="text-xs underline hover:text-amber-700">
              Retirer la photo
            </button>
          )}
          {error && (
            <p role="alert" className="text-xs text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
