import { useState } from 'react'
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
  visit_date: '',
  remarks: '',
}

export default function AddVisitor() {
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
    setLoading(true)
    try {
      await api.post('/visitor/add', form)
      setSuccess('Visitor added successfully.')
      setForm(initialData)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add visitor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-soft">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-textPrimary">Add Visitor</h2>
        <p className="text-sm text-textSecondary">Create a new visitor entry with complete details.</p>
      </div>
      {error && <div className="mb-4 rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input value={form.visitor_name} onChange={handleChange('visitor_name')} placeholder="Visitor Name" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.company_name} onChange={handleChange('company_name')} placeholder="Company Name" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.mobile_number} onChange={handleChange('mobile_number')} placeholder="Mobile Number" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.email} onChange={handleChange('email')} placeholder="Email" type="email" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.person_to_meet} onChange={handleChange('person_to_meet')} placeholder="Person to Meet" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.department} onChange={handleChange('department')} placeholder="Department" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.purpose} onChange={handleChange('purpose')} placeholder="Purpose" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <select value={form.visitor_type} onChange={handleChange('visitor_type')} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary">
          <option>Employee</option>
          <option>Vendor</option>
          <option>Interview</option>
          <option>Guest</option>
          <option>Delivery</option>
        </select>
        <input value={form.id_proof_type} onChange={handleChange('id_proof_type')} placeholder="ID Proof" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.id_proof_number} onChange={handleChange('id_proof_number')} placeholder="ID Proof Number" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.vehicle_number} onChange={handleChange('vehicle_number')} placeholder="Vehicle Number" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.photo} onChange={handleChange('photo')} placeholder="Photo URL" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <input value={form.visit_date} onChange={handleChange('visit_date')} placeholder="Visit Date (YYYY-MM-DD)" type="date" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <textarea value={form.remarks} onChange={handleChange('remarks')} placeholder="Remarks" className="col-span-full min-h-[120px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-textPrimary" />
        <button type="submit" disabled={loading} className="col-span-full rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-slate-300">
          {loading ? 'Saving...' : 'Submit Visitor'}
        </button>
      </form>
    </div>
  )
}

