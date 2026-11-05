export const formatPrice = (price) =>
  new Intl.NumberFormat("fr-FR").format(price) + " FCFA"

export const formatDate = (isoDate) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(isoDate),
  )

// « Taille : M », mais simplement « Taille unique » pour les accessoires
export const formatSize = (size) => (/^taille/i.test(size) ? size : `Taille : ${size}`)
