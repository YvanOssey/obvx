import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { readStorage, writeStorage } from "../lib/storage"

const STORAGE_KEY = "obvx.cart"
export const MAX_QUANTITY = 20

const CartContext = createContext(null)

// Une ligne de panier = un produit dans une taille donnée.
const lineKey = (id, size) => `${id}|${size}`

// Les paniers enregistrés avant l'ajout des tailles ne peuvent pas être commandés : on les ignore.
const loadCart = () =>
  readStorage(STORAGE_KEY, []).filter((item) => item && item.key && item.size)

// Le panier garde une copie des infos d'affichage ; le prix final est
// toujours recalculé par le serveur au moment de la commande.
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart)
  const [notice, setNotice] = useState(null)
  const dismissNotice = useCallback(() => setNotice(null), [])

  useEffect(() => {
    writeStorage(STORAGE_KEY, items)
  }, [items])

  const addToCart = useCallback((product, size) => {
    const key = lineKey(product.id, size)
    setItems((current) => {
      if (current.some((item) => item.key === key)) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) } : item,
        )
      }
      const { id, name, category, price, image } = product
      return [...current, { key, id, size, name, category, price, image, quantity: 1 }]
    })
    // Déclenche la notification « ajouté au panier » (nouvel id = nouvelle annonce)
    setNotice({ id: Date.now(), name: product.name, image: product.image, size })
  }, [])

  const setQuantity = useCallback((key, quantity) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) =>
            item.key === key ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item,
          ),
    )
  }, [])

  const removeFromCart = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      notice,
      dismissNotice,
    }),
    [items, addToCart, setQuantity, removeFromCart, clearCart, notice, dismissNotice],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart doit être utilisé dans <CartProvider>")
  return context
}
