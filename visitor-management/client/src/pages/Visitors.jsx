import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiSearch,
  FiFilter,
  FiUserPlus,
  FiEye,
  FiTrash2,
  FiDownload,
  FiCheck,
  FiX,
  FiLogIn,
  FiLogOut,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from 'react-icons/fi'
import api from '../services/api'
import { formatIndiaDate, formatIndiaDateTime } from '../utils/date'
import { useAuth } from '../context/AuthContext'
import useSocket from '../hooks/useSocket'

const PAGE_SIZE = 10

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
  Approved: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50',
  'Checked-In': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
  'Checked-Out': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50',
}

const formatDateTime = formatIndiaDateTime

function StatusBadge({ status }) {
  const dotColor =
    status === 'Checked-In'
      ? 'bg-emerald-500'
      : status === 'Approved'
      ? 'bg-indigo-500'
      : status === 'Pending'
      ? 'bg-amber-500'
      : status === 'Checked-Out'
      ? 'bg-blue-500'
      : 'bg-rose-500'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] || 'bg-slate-50 text-slate-700 border-slate-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  )
}

function DetailsModal({ visitor, onClose, onPass }) {
  if (!visitor) return null

  const details = [
    ['Visitor ID', visitor.visitor_id || visitor.id],
    ['Visitor Name', visitor.visitor_name],
    ['Company', visitor.company_name || '—'],
    ['Mobile', visitor.mobile_number || '—'],
    ['Email', visitor.email || '—'],
    ['Person to Meet', visitor.person_to_meet || '—'],
    ['Department', visitor.department || '—'],
    ['Purpose of Visit', visitor.purpose || '—'],
    ['Visit Date', formatIndiaDate(visitor.visit_date)],
    ['Check-In Time', formatDateTime(visitor.check_in_time)],
    ['Check-Out Time', formatDateTime(visitor.check_out_time)],
    ['Duration', visitor.duration || '—'],
    ['Visitor Type', visitor.visitor_type || 'Guest'],
    ['Vehicle Number', visitor.vehicle_number || '—'],
    ['ID Proof Type', visitor.id_proof_type || '—'],
    ['ID Proof Number', visitor.id_proof_number || '—'],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Visitor Record Details
              </h2>
              <StatusBadge status={visitor.status} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Verified visit credentials and pass information
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200 break-words">
                {value}
              </p>
            </div>
          ))}

          {visitor.remarks && (
            <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Remarks
              </p>
              <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
                {visitor.remarks}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            onClick={() => onPass(visitor)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FiDownload className="h-4 w-4" />
            Download Visitor Pass (PDF)
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Visitors() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [visitors, setVisitors] = useState([])
  const [query, setQuery] = useState(initialSearch)
  const [status, setStatus] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedVisitor, setSelectedVisitor] = useState(null)

  const replaceVisitor = (updated) =>
    setVisitors((items) => items.map((item) => (item.id === updated.id ? updated : item)))

  useSocket((event) => {
    if (event?.action === 'deleted') {
      setVisitors((items) => items.filter((item) => item.id !== event.visitorId))
    } else if (event?.visitor) {
      setVisitors((items) =>
        items.some((item) => item.id === event.visitor.id)
          ? items.map((item) => (item.id === event.visitor.id ? event.visitor : item))
          : [event.visitor, ...items]
      )
    }
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.get('/visitor/all', {
          params: { visitor_name: query, status },
        })
        setVisitors(response.data.visitors || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load visitors.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [query, status])

  // Filter by date client-side if date filter specified
  const filteredVisitors = useMemo(() => {
    if (!dateFilter) return visitors
    return visitors.filter((v) => {
      if (!v.visit_date) return false
      return v.visit_date.startsWith(dateFilter)
    })
  }, [visitors, dateFilter])

  const visibleVisitors = useMemo(
    () => filteredVisitors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredVisitors, page]
  )

  const pageCount = Math.max(1, Math.ceil(filteredVisitors.length / PAGE_SIZE))

  const performVisitAction = async (visitor, action) => {
    setActionId(visitor.id)
    setError('')
    setSuccess('')
    try {
      const response = await api.post(`/visitor/${action}/${visitor.id}`)
      replaceVisitor(response.data.visitor)
      if (selectedVisitor?.id === visitor.id) {
        setSelectedVisitor(response.data.visitor)
      }
      setSuccess(response.data.message)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${action} visitor.`)
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this visitor record?')) return
    try {
      await api.delete(`/visitor/delete/${id}`)
      setVisitors((items) => items.filter((item) => item.id !== id))
      setSuccess('Visitor record deleted successfully.')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete visitor.')
    }
  }

  const handleGeneratePass = async (visitor) => {
    try {
      const response = await api.get(`/visitor/${visitor.id}/pass`, { responseType: 'blob' })
      const pdf = new Blob([response.data], { type: 'application/pdf' })
      if (!pdf.size) throw new Error('Invalid PDF response')
      const url = URL.createObjectURL(pdf)
      const link = document.createElement('a')
      link.href = url
      link.download = `visitor-pass-${visitor.visitor_id || visitor.id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to download the visitor pass.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Visitor Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitor, approve, verify arrivals and track departure logs across the facility.
            </p>
          </div>
          {user?.role === 'admin' && (
            <Link
              to="/add-visitor"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiUserPlus className="h-4 w-4" />
              <span>Add Visitor</span>
            </Link>
          )}
        </div>

        {/* Filter Controls: Search, Status, Date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search by visitor name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <FiFilter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-8 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Checked-Out">Checked-Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value)
                setPage(1)
              }}
              placeholder="Filter by date"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          {success}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs dark:divide-slate-800">
            <thead className="bg-slate-50/75 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Visitor</th>
                <th className="px-5 py-3.5 font-semibold">Company</th>
                <th className="px-5 py-3.5 font-semibold">Visit Date</th>
                <th className="px-5 py-3.5 font-semibold">Check-In</th>
                <th className="px-5 py-3.5 font-semibold">Check-Out</th>
                <th className="px-5 py-3.5 font-semibold">Duration</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
                    <p className="text-xs">Loading visitors...</p>
                  </td>
                </tr>
              ) : visibleVisitors.length > 0 ? (
                visibleVisitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className="transition hover:bg-slate-50/75 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {visitor.visitor_name}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {visitor.visitor_id || 'ID#' + visitor.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {visitor.company_name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatIndiaDate(visitor.visit_date)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDateTime(visitor.check_in_time)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDateTime(visitor.check_out_time)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                      {visitor.duration || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={visitor.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* View Details Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedVisitor(visitor)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <FiEye className="h-3 w-3" />
                          View
                        </button>

                        {/* Admin: Approve / Reject */}
                        {user?.role === 'admin' && visitor.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              disabled={actionId === visitor.id}
                              onClick={() => performVisitAction(visitor, 'approve')}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              <FiCheck className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={actionId === visitor.id}
                              onClick={() => performVisitAction(visitor, 'reject')}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              <FiX className="h-3 w-3" />
                              Reject
                            </button>
                          </>
                        )}

                        {/* Security / Admin Check-In */}
                        {user?.role === 'security' && visitor.status === 'Approved' && (
                          <button
                            type="button"
                            disabled={actionId === visitor.id}
                            onClick={() => performVisitAction(visitor, 'checkin')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <FiLogIn className="h-3 w-3" />
                            {actionId === visitor.id ? 'Saving...' : 'Check-In'}
                          </button>
                        )}

                        {/* Security / Admin Check-Out */}
                        {user?.role === 'security' && visitor.status === 'Checked-In' && (
                          <button
                            type="button"
                            disabled={actionId === visitor.id}
                            onClick={() => performVisitAction(visitor, 'checkout')}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            <FiLogOut className="h-3 w-3" />
                            {actionId === visitor.id ? 'Saving...' : 'Check-Out'}
                          </button>
                        )}

                        {/* Admin Delete */}
                        {user?.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(visitor.id)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                            title="Delete visitor"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <FiInbox className="h-6 w-6 stroke-1" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      No visitors matched your criteria.
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Try clearing filters or search terms to see visitor records.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && filteredVisitors.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>
              Showing{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {(page - 1) * PAGE_SIZE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {Math.min(page * PAGE_SIZE, filteredVisitors.length)}
              </strong>{' '}
              of{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {filteredVisitors.length}
              </strong>{' '}
              records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <FiChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              <span className="px-2 font-medium">
                {page} / {pageCount}
              </span>
              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage(page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Next <FiChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details & Pass Modal */}
      <DetailsModal
        visitor={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
        onPass={handleGeneratePass}
      />
    </div>
  )
}
