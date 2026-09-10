import { useEffect, useState } from 'react'
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function AccountSettings() {
  const { user, login } = useAuth()
  const [form, setForm] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        full_name: user.name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value })
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.full_name || !form.email) {
      setError('Full name and username/email are required.')
      return
    }

    setLoading(true)
    try {
      const response = await api.put('/auth/profile', {
        full_name: form.full_name,
        email: form.email,
      })
      const updatedUser = response.data.user
      login({
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        last_login: updatedUser.last_login,
      })
      setMessage('Profile settings saved successfully.')
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.current_password || !form.new_password || !form.confirm_password) {
      setError('Current password, new password, and confirmation are required.')
      return
    }

    if (form.new_password !== form.confirm_password) {
      setError('New password and confirmation do not match.')
      return
    }

    if (form.new_password.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await api.put('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      })
      setForm({ ...form, current_password: '', new_password: '', confirm_password: '' })
      setMessage('Password updated successfully.')
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Administration Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure security settings, profile credentials, and change account passwords.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
          <FiCheckCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
          <FiAlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <FiUser className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Update your administrator name and contact email address
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                value={form.full_name}
                onChange={handleChange('full_name')}
                placeholder="Full Name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Username / Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="Username / Email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <FiLock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Provide current credentials and choose a new robust password
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={form.current_password}
                onChange={handleChange('current_password')}
                placeholder="Current password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={form.new_password}
                onChange={handleChange('new_password')}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={handleChange('confirm_password')}
                placeholder="Repeat new password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
