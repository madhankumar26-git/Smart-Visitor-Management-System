import { useEffect, useState } from 'react'
import {
  FiBriefcase,
  FiDatabase,
  FiDownload,
  FiUpload,
  FiCheckCircle,
  FiAlertTriangle,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiImage,
} from 'react-icons/fi'
import api from '../services/api'

const blank = {
  company_name: '',
  company_logo: '',
  company_address: '',
  phone_number: '',
  email: '',
  website: '',
}

export default function CompanySettings() {
  const [form, setForm] = useState(blank)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api
      .get('/admin/company-settings')
      .then(({ data }) => setForm(data.settings || blank))
      .catch(() => setError('Unable to load company settings.'))
  }, [])

  const save = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { data } = await api.put('/admin/company-settings', form)
      setForm(data.settings)
      setMessage('Company profile settings saved successfully.')
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save company settings.')
    } finally {
      setBusy(false)
    }
  }

  const backup = async () => {
    try {
      const response = await api.get('/admin/backup', { responseType: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(response.data)
      link.download = `smart-visitor-backup-${new Date().toISOString().split('T')[0]}.db`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch {
      setError('Unable to download database backup.')
    }
  }

  const restore = async (event) => {
    const backupFile = event.target.files?.[0]
    if (
      !backupFile ||
      !window.confirm(
        'WARNING: Restoring this database will overwrite all existing visitor and system records. You will be signed out. Continue?'
      )
    )
      return

    const body = new FormData()
    body.append('backup', backupFile)
    setBusy(true)
    try {
      await api.post('/admin/restore', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      localStorage.removeItem('smart-visitor-user')
      window.location.href = '/login'
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to restore the database backup.')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Company Profile & System Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure corporate branding, contact information, and manage database snapshots.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
          <FiCheckCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Branding Section */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <FiBriefcase className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Corporate Branding & Identity
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Information displayed on visitor passes, emails, and header portal
            </p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                value={form.company_name || ''}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="Smart Visitor Inc."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Company Logo URL
              </label>
              <input
                value={form.company_logo || ''}
                onChange={(e) => setForm({ ...form, company_logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@company.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                value={form.phone_number || ''}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+91 22 1234 5678"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Website URL
              </label>
              <input
                type="url"
                value={form.website || ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://www.company.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Facility / Headquarters Address
              </label>
              <textarea
                rows="2"
                value={form.company_address || ''}
                onChange={(e) => setForm({ ...form, company_address: e.target.value })}
                placeholder="Building 4, Tech Park, Main Expressway..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </section>

      {/* Backup & Restore Section */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <FiDatabase className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Database Backup & Disaster Recovery
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Download SQLite database snapshots or restore from a previously exported archive
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 dark:bg-amber-950/30 dark:border-amber-900/50 mb-5 flex items-start gap-2.5">
          <FiAlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Caution:</strong> Restoring an archive replaces all active records, logs, and configurations with the snapshot contents.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={backup}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <FiDownload className="h-3.5 w-3.5" />
            Download Database Backup
          </button>

          <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700">
            <FiUpload className="h-3.5 w-3.5" />
            Restore Database Backup
            <input onChange={restore} accept=".db,.sqlite,.sqlite3" type="file" className="hidden" />
          </label>
        </div>
      </section>
    </div>
  )
}
