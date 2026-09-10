import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiShield,
  FiLock,
  FiMaximize,
  FiActivity,
  FiUsers,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiInfo,
  FiArrowRight,
  FiCopy,
  FiCheck,
} from 'react-icons/fi'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/layout/Footer'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [company, setCompany] = useState({ company_name: 'Smart Visitor', company_logo: '' })

  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    api
      .get('/auth/company')
      .then(({ data }) => setCompany(data.settings || company))
      .catch(() => {})
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Username and password are required.')
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
      setError(err.response?.data?.message || 'Unable to login. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (u, p) => {
    setEmail(u)
    setPassword(p)
  }

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-8 items-center">
          {/* LEFT SIDE: Large Branding / Marketing Panel */}
          <div className="lg:col-span-6 xl:col-span-7 bg-[#0B132B] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[580px] border border-slate-800">
            {/* Background subtle glow effect */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Logo & Brand Header */}
              <div className="flex items-center gap-3.5 mb-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
                  <FiShield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Smart Visitor</h2>
                  <p className="text-xs font-semibold tracking-wider uppercase text-blue-400">Management System</p>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-3 mb-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Secure Entry,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                    Smarter Management
                  </span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
                  Streamline your visitor check-in process with our smart and secure visitor management system.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid sm:grid-cols-2 gap-4 my-8">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="h-8 w-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-3">
                    <FiLock className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">1. Secure Access</h3>
                  <p className="text-xs text-slate-400 mt-1">JWT Authentication & Role Based Access</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
                    <FiMaximize className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">2. QR Based Entry</h3>
                  <p className="text-xs text-slate-400 mt-1">Fast & Contactless Check-in</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-3">
                    <FiActivity className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">3. Real-time Tracking</h3>
                  <p className="text-xs text-slate-400 mt-1">Monitor Visitors & Get Reports</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
                    <FiUsers className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">4. Multi-Role Support</h3>
                  <p className="text-xs text-slate-400 mt-1">Admin, Security & Visitor Portals</p>
                </div>
              </div>
            </div>

            {/* Tagline near bottom */}
            <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div>
                <p className="font-medium text-slate-200">Better Security</p>
                <p className="text-slate-400">for a Safer Tomorrow</p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                System Operational
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Login Card & Demo Credentials */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            {/* Clean Login Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-soft border border-slate-200/80 dark:border-slate-800">
              {/* Top Branding & Heading */}
              <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <FiShield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Smart Visitor</h3>
                    <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Management System</p>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sign in to access your account
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field 1: Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  />
                </div>

                {/* Field 2: Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault()
                        alert('For security assistance, please contact your system administrator.')
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Remember me for 30 days</span>
                  </label>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <FiArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security & Protection Card */}
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-100 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex-shrink-0">
                  <FiCheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Secure & Protected</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Your data is safe with us</p>
                </div>
              </div>
            </div>

            {/* DEDICATED DEMO CREDENTIALS CARD */}
            <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900/50 dark:bg-blue-950/20 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <FiInfo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                    Demo Credentials
                  </h4>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Click card or Quick Fill
                </span>
              </div>

              <div className="space-y-3">
                {/* ADMIN CREDENTIALS */}
                <div
                  onClick={() => handleQuickFill('admin@gmail.com', 'Admin@123')}
                  className="cursor-pointer group rounded-2xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition"
                  title="Click to fill Admin credentials"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 tracking-wider">
                      ADMIN
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickFill('admin@gmail.com', 'Admin@123')
                      }}
                      className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                    >
                      Quick Fill
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy('admin@gmail.com', 'admin_username')
                      }}
                      className="flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800 hover:border-blue-300 transition"
                      title="Click to copy username"
                    >
                      <span className="text-[10px] font-medium text-slate-400">Username</span>
                      <div className="flex items-center justify-between mt-1 gap-1">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] truncate">
                          admin@gmail.com
                        </span>
                        {copiedField === 'admin_username' ? (
                          <FiCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <FiCopy className="h-3 w-3 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy('Admin@123', 'admin_password')
                      }}
                      className="flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800 hover:border-blue-300 transition"
                      title="Click to copy password"
                    >
                      <span className="text-[10px] font-medium text-slate-400">Password</span>
                      <div className="flex items-center justify-between mt-1 gap-1">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                          Admin@123
                        </span>
                        {copiedField === 'admin_password' ? (
                          <FiCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <FiCopy className="h-3 w-3 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECURITY CREDENTIALS */}
                <div
                  onClick={() => handleQuickFill('security@gmail.com', 'Security@123')}
                  className="cursor-pointer group rounded-2xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition"
                  title="Click to fill Security credentials"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 tracking-wider">
                      SECURITY
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickFill('security@gmail.com', 'Security@123')
                      }}
                      className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-700 shadow-sm"
                    >
                      Quick Fill
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy('security@gmail.com', 'security_username')
                      }}
                      className="flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 transition"
                      title="Click to copy username"
                    >
                      <span className="text-[10px] font-medium text-slate-400">Username</span>
                      <div className="flex items-center justify-between mt-1 gap-1">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] truncate">
                          security@gmail.com
                        </span>
                        {copiedField === 'security_username' ? (
                          <FiCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <FiCopy className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy('Security@123', 'security_password')
                      }}
                      className="flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 transition"
                      title="Click to copy password"
                    >
                      <span className="text-[10px] font-medium text-slate-400">Password</span>
                      <div className="flex items-center justify-between mt-1 gap-1">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                          Security@123
                        </span>
                        {copiedField === 'security_password' ? (
                          <FiCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <FiCopy className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-3">
                This is a demo version. Use the above credentials to explore the system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}
