import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { formatIndiaDate, formatIndiaDateTime } from '../utils/date'
import { useAuth } from '../context/AuthContext'
import useSocket from '../hooks/useSocket'

const PAGE_SIZE = 10
const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  'Checked-In': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  'Checked-Out': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  Approved: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  Cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
}

const formatDateTime = formatIndiaDateTime

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-800'}`}>{status}</span>
}

function DetailsModal({ visitor, onClose, onPass }) {
  if (!visitor) return null
  const details = [
    ['Visitor ID', visitor.visitor_id], ['Visitor Name', visitor.visitor_name], ['Company', visitor.company_name || '—'],
    ['Mobile', visitor.mobile_number], ['Person to Meet', visitor.person_to_meet], ['Department', visitor.department],
    ['Purpose', visitor.purpose], ['Visit Date', formatIndiaDate(visitor.visit_date)], ['Check-In Time', formatDateTime(visitor.check_in_time)],
    ['Check-Out Time', formatDateTime(visitor.check_out_time)], ['Duration', visitor.duration || '—'],
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-textPrimary dark:text-white">Visitor Details</h2><p className="text-sm text-textSecondary">Complete visit record and pass information.</p></div><button onClick={onClose} className="rounded-2xl px-3 py-2 text-sm text-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800">Close</button></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs font-medium uppercase tracking-wide text-textSecondary">{label}</p><p className="mt-1 break-words text-sm font-semibold text-textPrimary dark:text-white">{value}</p></div>)}<div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs font-medium uppercase tracking-wide text-textSecondary">Status</p><div className="mt-2"><StatusBadge status={visitor.status} /></div></div><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs font-medium uppercase tracking-wide text-textSecondary">QR Code</p><p className="mt-1 break-all text-sm font-semibold text-textPrimary dark:text-white">{visitor.qr_code || '—'}</p></div></div>
        <div className="mt-6 flex flex-wrap justify-end gap-3"><button onClick={() => onPass(visitor)} className="rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600">Download Visitor Pass</button><button onClick={onClose} className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-textPrimary dark:border-slate-700 dark:text-white">Close</button></div>
      </div>
    </div>
  )
}

export default function Visitors() {
  const { user } = useAuth()
  const [visitors, setVisitors] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedVisitor, setSelectedVisitor] = useState(null)

  const replaceVisitor = (updated) => setVisitors((items) => items.map((item) => item.id === updated.id ? updated : item))
  useSocket((event) => { if (event?.action === 'deleted') setVisitors((items) => items.filter((item) => item.id !== event.visitorId)); else if (event?.visitor) setVisitors((items) => items.some((item) => item.id === event.visitor.id) ? items.map((item) => item.id === event.visitor.id ? event.visitor : item) : [event.visitor, ...items]) })

  useEffect(() => { const load = async () => { setLoading(true); try { const response = await api.get('/visitor/all', { params: { visitor_name: query, status } }); setVisitors(response.data.visitors || []) } catch (err) { setError(err.response?.data?.message || 'Unable to load visitors.') } finally { setLoading(false) } }; load() }, [query, status])
  const visibleVisitors = useMemo(() => visitors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [visitors, page])
  const pageCount = Math.max(1, Math.ceil(visitors.length / PAGE_SIZE))

  const performVisitAction = async (visitor, action) => {
    setActionId(visitor.id); setError(''); setSuccess('')
    try { const response = await api.post(`/visitor/${action}/${visitor.id}`); replaceVisitor(response.data.visitor); if (selectedVisitor?.id === visitor.id) setSelectedVisitor(response.data.visitor); setSuccess(response.data.message) } catch (err) { setError(err.response?.data?.message || `Unable to ${action} visitor.`) } finally { setActionId(null) }
  }
  const handleDelete = async (id) => { if (!window.confirm('Delete this visitor record?')) return; try { await api.delete(`/visitor/delete/${id}`); setVisitors((items) => items.filter((item) => item.id !== id)); setSuccess('Visitor deleted successfully.') } catch (err) { setError(err.response?.data?.message || 'Unable to delete visitor.') } }
  const handleGeneratePass = async (visitor) => { try { const response = await api.get(`/visitor/${visitor.id}/pass`, { responseType: 'blob' }); const pdf = new Blob([response.data], { type: 'application/pdf' }); if (!pdf.size) throw new Error('Invalid PDF response'); const url = URL.createObjectURL(pdf); const link = document.createElement('a'); link.href = url; link.download = `visitor-pass-${visitor.visitor_id || visitor.id}.pdf`; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000) } catch (err) { setError(err.response?.data?.message || 'Unable to download the visitor pass.') } }

  return <div className="space-y-6">
    <div className="rounded-[32px] bg-white p-6 shadow-soft dark:bg-slate-900"><div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-textPrimary dark:text-white">Visitor Management</h2><p className="text-sm text-textSecondary">Monitor every arrival, visit, and departure.</p></div>{user?.role === 'admin' && <Link to="/add-visitor" className="rounded-3xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-600">Add Visitor</Link>}</div><div className="grid gap-3 md:grid-cols-2"><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search by visitor name" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"/><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"><option value="">All statuses</option><option>Pending</option><option>Checked-In</option><option>Checked-Out</option><option>Cancelled</option></select></div></div>
    {error && <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}{success && <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">{success}</div>}
    <div className="overflow-x-auto rounded-[32px] bg-white shadow-soft dark:bg-slate-900"><table className="min-w-[1050px] w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700"><thead className="bg-slate-50 text-textSecondary dark:bg-slate-800"><tr>{['Visitor','Company','Visit Date','Check-In Time','Check-Out Time','Duration','Status','Actions'].map((heading) => <th key={heading} className="px-4 py-4 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <tr><td colSpan="8" className="px-4 py-8 text-center text-textSecondary">Loading visitors...</td></tr> : visibleVisitors.length ? visibleVisitors.map((visitor) => <tr key={visitor.id} className="text-textPrimary dark:text-slate-100"><td className="px-4 py-4 font-medium">{visitor.visitor_name}<span className="mt-1 block text-xs font-normal text-textSecondary">{visitor.visitor_id}</span></td><td className="px-4 py-4">{visitor.company_name || '—'}</td><td className="px-4 py-4">{visitor.visit_date || '—'}</td><td className="px-4 py-4">{formatDateTime(visitor.check_in_time)}</td><td className="px-4 py-4">{formatDateTime(visitor.check_out_time)}</td><td className="px-4 py-4">{visitor.duration || '—'}</td><td className="px-4 py-4"><StatusBadge status={visitor.status}/></td><td className="px-4 py-4"><div className="flex flex-wrap gap-2"><button onClick={() => setSelectedVisitor(visitor)} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">View</button>{user?.role === 'admin' && visitor.status === 'Pending' && <><button disabled={actionId === visitor.id} onClick={() => performVisitAction(visitor, 'approve')} className="rounded-2xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button disabled={actionId === visitor.id} onClick={() => performVisitAction(visitor, 'reject')} className="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Reject</button></>}{user?.role === 'security' && visitor.status === 'Approved' && <button disabled={actionId === visitor.id} onClick={() => performVisitAction(visitor, 'checkin')} className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{actionId === visitor.id ? 'Saving...' : 'Check-In'}</button>}{user?.role === 'security' && visitor.status === 'Checked-In' && <button disabled={actionId === visitor.id} onClick={() => performVisitAction(visitor, 'checkout')} className="rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{actionId === visitor.id ? 'Saving...' : 'Check-Out'}</button>}{user?.role === 'admin' && <button onClick={() => handleDelete(visitor.id)} className="rounded-2xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">Delete</button>}</div></td></tr>) : <tr><td colSpan="8" className="px-4 py-8 text-center text-textSecondary">No visitors matched your filters.</td></tr>}</tbody></table></div>
    {!loading && visitors.length > PAGE_SIZE && <div className="flex items-center justify-between text-sm text-textSecondary"><span>Showing {visibleVisitors.length} of {visitors.length} visitors</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-2xl border px-4 py-2 disabled:opacity-50">Previous</button><button disabled={page === pageCount} onClick={() => setPage(page + 1)} className="rounded-2xl border px-4 py-2 disabled:opacity-50">Next</button></div></div>}
    <DetailsModal visitor={selectedVisitor} onClose={() => setSelectedVisitor(null)} onPass={handleGeneratePass}/>
  </div>
}
