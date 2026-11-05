import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { api } from "../lib/api"
import { readStorage, writeStorage } from "../lib/storage"

const STORAGE_KEY = "obvx.auth"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // { token, user: { id, firstName, lastName, email } } ou null
  const [session, setSession] = useState(() => readStorage(STORAGE_KEY, null))

  const saveSession = useCallback((next) => {
    setSession(next)
    writeStorage(STORAGE_KEY, next)
  }, [])

  const logout = useCallback(() => saveSession(null), [saveSession])

  // Au chargement, on vérifie que le token stocké est toujours valide.
  const token = session?.token
  useEffect(() => {
    if (!token) return
    let cancelled = false
    api
      .me(token)
      .then((user) => {
        if (!cancelled) saveSession({ token, user })
      })
      .catch((error) => {
        if (!cancelled && error.status === 401) saveSession(null)
      })
    return () => {
      cancelled = true
    }
  }, [token, saveSession])

  const fromAuthResponse = ({ token: newToken, ...user }) => ({ token: newToken, user })

  const login = useCallback(
    async (credentials) => {
      const response = await api.login(credentials)
      saveSession(fromAuthResponse(response))
    },
    [saveSession],
  )

  const adminLogin = useCallback(
    async (credentials) => {
      const response = await api.adminLogin(credentials)
      saveSession(fromAuthResponse(response))
    },
    [saveSession],
  )

  const register = useCallback(
    async (data) => {
      const response = await api.register(data)
      saveSession(fromAuthResponse(response))
    },
    [saveSession],
  )

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      login,
      adminLogin,
      register,
      logout,
    }),
    [session, login, adminLogin, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth doit être utilisé dans <AuthProvider>")
  return context
}
