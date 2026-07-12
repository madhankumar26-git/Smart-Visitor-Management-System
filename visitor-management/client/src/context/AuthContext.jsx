import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart-visitor-user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('smart-visitor-user', JSON.stringify(user))
      if (user.token) {
        api.defaults.headers.common.Authorization = `Bearer ${user.token}`
      }
    } else {
      localStorage.removeItem('smart-visitor-user')
      delete api.defaults.headers.common.Authorization
    }
  }, [user])

  const login = (payload) => {
    setUser(payload)
  }

  const logout = () => {
    setUser(null)
    delete api.defaults.headers.common.Authorization
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
