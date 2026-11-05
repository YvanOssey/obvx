import { useCallback, useEffect, useState } from "react"
import { api } from "../lib/api"

// Cache partagé : l'accueil et la boutique ne rechargent pas le catalogue à chaque visite.
let cachedProducts = null

export const useProducts = () => {
  const [products, setProducts] = useState(cachedProducts ?? [])
  const [loading, setLoading] = useState(cachedProducts === null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (cachedProducts !== null && attempt === 0) return
    const controller = new AbortController()
    api
      .products({ signal: controller.signal })
      .then((data) => {
        cachedProducts = data
        setProducts(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setError(err.message)
        setLoading(false)
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  return { products, loading, error, retry }
}
