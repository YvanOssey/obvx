// Lecture/écriture localStorage sans planter (navigation privée, stockage bloqué…)
export const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const writeStorage = (key, value) => {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // stockage indisponible : on garde l'état en mémoire seulement
  }
}
