import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from '../services/api'
import { clearToken, getToken, setToken } from '../services/session'
import { decodeToken, isExpired } from '../services/jwt'

const AuthContext = createContext(null)

// Builds the signed-in user from the stored token. The server (api.js) still re-checks the
// signature on every call, so this is only used to decide what to show.
function readSession() {
  const token = getToken()
  const claims = token ? decodeToken(token) : null
  if (!claims || isExpired(claims)) {
    if (token) clearToken()
    return null
  }
  return { id: claims.sub, name: claims.name, email: claims.email, role: claims.role }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const login = useCallback(async (email, password) => {
    const { token } = await api.login(email, password)
    setToken(token)
    const session = readSession()
    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  // Call from a catch block. Logs the user out if their token is no longer valid
  // and returns the message to show.
  const handleAuthError = useCallback(
    (err) => {
      if (err?.code === 'UNAUTHENTICATED') logout()
      return err?.message || 'Something went wrong. Try again.'
    },
    [logout],
  )

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout, handleAuthError }),
    [user, login, logout, handleAuthError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
