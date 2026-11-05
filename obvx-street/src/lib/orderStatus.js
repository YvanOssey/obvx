// Statuts de commande : même liste et même ordre que l'énumération OrderStatus du back.
export const ORDER_STATUSES = [
  { key: "EN_ATTENTE", label: "En attente", className: "bg-amber-100 text-amber-900" },
  { key: "CONFIRMEE", label: "Confirmée", className: "bg-sky-100 text-sky-900" },
  { key: "EXPEDIEE", label: "En livraison", className: "bg-violet-100 text-violet-900" },
  { key: "LIVREE", label: "Livrée", className: "bg-emerald-100 text-emerald-900" },
  { key: "ANNULEE", label: "Annulée", className: "bg-black/10 text-black/75" },
]

const BY_KEY = Object.fromEntries(ORDER_STATUSES.map((s) => [s.key, s]))

export const statusInfo = (key) =>
  BY_KEY[key] ?? { key, label: key, className: "bg-black/10 text-black/75" }
