import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiUser,
  FiBriefcase,
  FiPhone,
  FiMail,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiTruck,
  FiShield,
  FiImage,
  FiArrowLeft,
  FiSend,
} from 'react-icons/fi'
import api from '../services/api'

const initialData = {
  visitor_name: '',
  company_name: '',
  mobile_number: '',
  email: '',
  person_to_meet: '',
  department: '',
  purpose: '',
  visitor_type: 'Guest',
  id_proof_type: '',
  id_proof_number: '',
  vehicle_number: '',
  photo: '',
  visit_date: new Date().toISOString().split('T')[0],
  remarks: '',
}

export default function AddVisitor() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialData)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.visitor_name.trim()) {
      setError('Visitor name is required.')
      return
    }
    if (!form.mobile_number.trim()) {
      setError('Mobile number is required.')
      return
    }
    if (!form.person_to_meet.trim()) {
      setError('Person to meet is required.')
      return
    }

    setLoading(true)
    try {
      await api.post('/visitor/add', form)
      setSuccess('Visitor pre-registered successfully!')
      setForm(initialData)
      setTimeout(() => {
        navigate('/visitors')
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add visitor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <FiArrowLeft className="h-3.5 w-3.5" /> Back to Visitors
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Register New Visitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fill in visitor details to create a pre-approved digital pass.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
          <FiCheckCircle className="h-4 w-4" />
          <span>{success} Redirecting to visitors list...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GROUP 1: Visitor Information */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FiUser className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Visitor Information
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personal identity and primary contact particulars
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Visitor Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                value={form.visitor_name}
                onChange={handleChange('visitor_name')}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                required
                value={form.mobile_number}
                onChange={handleChange('mobile_number')}
                placeholder="e.g. +91 98765 43210"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="e.g. john@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Company / Organization
              </label>
              <input
                value={form.company_name}
                onChange={handleChange('company_name')}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Visitor Category
              </label>
              <select
                value={form.visitor_type}
                onChange={handleChange('visitor_type')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              >
                <option value="Guest">Guest</option>
                <option value="Vendor">Vendor</option>
                <option value="Interview">Interview Candidate</option>
                <option value="Employee">Employee</option>
                <option value="Delivery">Delivery Personnel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Photo URL (Optional)
              </label>
              <input
                value={form.photo}
                onChange={handleChange('photo')}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* GROUP 2: Visit Details */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <FiBriefcase className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Visit Details
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Host information, reason for appointment, and scheduled date
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Person to Meet <span className="text-rose-500">*</span>
              </label>
              <input
                required
                value={form.person_to_meet}
                onChange={handleChange('person_to_meet')}
                placeholder="e.g. Sarah Connor (HR Manager)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <input
                value={form.department}
                onChange={handleChange('department')}
                placeholder="e.g. Engineering / HR / Sales"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Purpose of Visit <span className="text-rose-500">*</span>
              </label>
              <input
                required
                value={form.purpose}
                onChange={handleChange('purpose')}
                placeholder="e.g. Quarterly Business Review"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Visit Date <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="date"
                value={form.visit_date}
                onChange={handleChange('visit_date')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* GROUP 3: Additional Information */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <FiShield className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                3. Additional Information & Security
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Identification verification, vehicle access, and special remarks
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ID Proof Type
              </label>
              <input
                value={form.id_proof_type}
                onChange={handleChange('id_proof_type')}
                placeholder="e.g. Aadhaar, Passport, PAN"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ID Proof Number
              </label>
              <input
                value={form.id_proof_number}
                onChange={handleChange('id_proof_number')}
                placeholder="e.g. XXXX-XXXX-1234"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Vehicle Number
              </label>
              <input
                value={form.vehicle_number}
                onChange={handleChange('vehicle_number')}
                placeholder="e.g. MH-02-AB-1234"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Remarks / Special Notes
              </label>
              <textarea
                rows="3"
                value={form.remarks}
                onChange={handleChange('remarks')}
                placeholder="Add any instructions, equipment authorization, or safety notes..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/visitors')}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FiSend className="h-3.5 w-3.5" />
            )}
            <span>{loading ? 'Registering...' : 'Register Visitor'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
