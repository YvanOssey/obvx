import { useEffect } from "react"

const SITE = "OBVX"

// Chaque page a son propre titre d'onglet (utile pour le référencement et les lecteurs d'écran)
export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE}` : `${SITE} — Streetwear né dans la rue`
  }, [title])
}
