// Client HTTP unique pour parler au back OBVX.
const BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function apiFetch(path, { method = "GET", body, token, signal } = {}) {
  const headers = {}
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json"
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === "AbortError") throw error
    throw new ApiError(0, "Impossible de joindre le serveur. Vérifie ta connexion et réessaie.")
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const fallback =
      response.status === 401
        ? "Ta session a expiré, reconnecte-toi."
        : "Une erreur est survenue, réessaie plus tard."
    throw new ApiError(response.status, data?.message ?? fallback)
  }

  return data
}

export const api = {
  products: (options) => apiFetch("/api/products", options),
  product: (id, options) => apiFetch(`/api/products/${encodeURIComponent(id)}`, options),
  login: (credentials) => apiFetch("/api/auth/login", { method: "POST", body: credentials }),
  register: (data) => apiFetch("/api/auth/register", { method: "POST", body: data }),
  me: (token) => apiFetch("/api/auth/me", { token }),
  createOrder: (items, contact, token) =>
    apiFetch("/api/orders", { method: "POST", body: { items, ...contact }, token }),
  myOrders: (token) => apiFetch("/api/orders/me", { token }),
}

// Espace admin (réservé aux comptes listés dans ADMIN_EMAILS côté serveur)
export const adminApi = {
  summary: (token) => apiFetch("/api/admin/summary", { token }),
  orders: (token, { status = "", q = "", page = 0, size = 20 } = {}, signal) =>
    apiFetch(`/api/admin/orders?${new URLSearchParams({ status, q, page, size })}`, { token, signal }),
  setOrderStatus: (token, id, status) =>
    apiFetch(`/api/admin/orders/${id}/status`, { method: "PATCH", body: { status }, token }),
  products: (token) => apiFetch("/api/admin/products", { token }),
  createProduct: (token, data) => apiFetch("/api/admin/products", { method: "POST", body: data, token }),
  updateProduct: (token, id, data) =>
    apiFetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: "PUT", body: data, token }),
  uploadStatus: (token) => apiFetch("/api/admin/uploads/status", { token }),
  uploadImage: (token, file) => {
    const form = new FormData()
    form.append("file", file)
    return apiFetch("/api/admin/uploads", { method: "POST", body: form, token })
  },
}
