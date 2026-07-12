import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const getStoredUser = () => {
  const storage = localStorage.getItem('smart-visitor-user')
  return storage ? JSON.parse(storage) : null
}

const setStoredUser = (user) => {
  localStorage.setItem('smart-visitor-user', JSON.stringify(user))
}

const clearStoredUser = () => {
  localStorage.removeItem('smart-visitor-user')
}

api.interceptors.request.use((config) => {
  const user = getStoredUser()
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const user = getStoredUser()

    if (originalRequest?.url?.includes('/auth/refresh')) {
      clearStoredUser()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && user?.refresh_token && !originalRequest?._retry) {
      originalRequest._retry = true
      try {
        const refreshResponse = await axios.post('/api/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${user.refresh_token}` },
        })
        const newToken = refreshResponse.data.token
        const updatedUser = { ...user, token: newToken }
        setStoredUser(updatedUser)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        clearStoredUser()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.status === 401) {
      clearStoredUser()
      window.location.href = '/login'
    }

    if (error.response?.status === 403) {
      window.location.href = '/unauthorized'
    }

    if (!error.response || error.response.status >= 500) {
      console.error('Server or network error:', error)
    }

    return Promise.reject(error)
  },
)

export default api
