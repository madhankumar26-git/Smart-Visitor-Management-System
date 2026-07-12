import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState({ company_name: 'Smart Visitor', company_logo: '' })
  const navigate = useNavigate()
  const { login } = useAuth()
  useEffect(() => { api.get('/auth/company').then(({ data }) => setCompany(data.settings || company)).catch(() => {}) }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      const data = response.data
      login({
        token: data.token,
        refresh_token: data.refresh_token,
        role: data.role,
        name: data.user.name,
        email: data.user.email,
      })
      const redirect = data.role === 'admin' ? '/admin' : '/security'
      navigate(redirect)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">{company.company_logo && <img src={company.company_logo} alt="Company logo" className="h-10 w-10 rounded-xl object-cover" />}<div><p className="text-lg font-semibold text-textPrimary">{company.company_name}</p><p className="text-xs text-textSecondary">Visitor management portal</p></div></div>
        <h1 className="mb-2 text-3xl font-semibold text-textPrimary">Sign in</h1>
        <p className="mb-6 text-sm text-textSecondary">Enter your credentials to access the visitor management portal.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm text-textSecondary">Username / Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <label className="block">
            <span className="text-sm text-textSecondary">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
          {error && <div className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
