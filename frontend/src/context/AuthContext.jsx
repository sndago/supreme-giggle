import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('compound_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('compound_token') || null)

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    // Backend shape: { success, token, data: { _id, name, email, role, branch } }
    const userData = data.data
    localStorage.setItem('compound_token', data.token)
    localStorage.setItem('compound_user', JSON.stringify(userData))
    setToken(data.token)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('compound_token')
    localStorage.removeItem('compound_user')
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
