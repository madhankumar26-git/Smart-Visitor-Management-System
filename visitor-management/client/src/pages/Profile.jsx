import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Profile() {
  const { user, login } = useAuth()
  const [form, setForm] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.full_name || !form.email) {
      setError('Full name and email are required.')
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
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.current_password || !form.new_password) {
      setError('Both current and new password are required.')
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
      setForm({ ...form, current_password: '', new_password: '' })
      setMessage('Password changed successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-textPrimary">Profile</h2>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-textSecondary">Full Name</span>
            <input
              value={form.full_name}
              onChange={handleChange('full_name')}
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <label className="block">
            <span className="text-sm text-textSecondary">Email</span>
            <input
              value={form.email}
              onChange={handleChange('email')}
              type="email"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <div className="md:col-span-2 flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-textPrimary">Security</h2>
        <form onSubmit={handlePasswordChange} className="mt-6 grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-textSecondary">Current Password</span>
            <input
              value={form.current_password}
              onChange={handleChange('current_password')}
              type="password"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <label className="block">
            <span className="text-sm text-textSecondary">New Password</span>
            <input
              value={form.new_password}
              onChange={handleChange('new_password')}
              type="password"
              className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
          <div className="md:col-span-2 flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>

      {(message || error) && (
        <div className={`rounded-3xl px-4 py-3 text-sm ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}
    </div>
  )
}
