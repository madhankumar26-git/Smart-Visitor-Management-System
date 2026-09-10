import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiClock,
  FiUsers,
  FiUserCheck,
  FiCamera,
  FiArrowRight,
  FiCheckCircle,
  FiShield,
  FiInbox,
  FiCalendar,
  FiPhone,
  FiUser,
  FiLogIn,
  FiLogOut,
} from 'react-icons/fi'
import api from '../services/api'
import { formatIndiaDateTime } from '../utils/date'

export default function SecurityDashboard() {
  const [stats, setStats] = useState(null)
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const [currentTime] = useState(new Date())

  const fetchData = async () => {
    setError('')
    try {
      const [security, visitorRes] = await Promise.all([
        api.get('/dashboard/security'),
        api.get('/visitor/today'),
      ])
      setStats(security.data)
      setVisitors(visitorRes.data.visitors || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load security dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAction = async (visitorId, action) => {
    setActionId(visitorId)
    setActionMessage('')
    try {
      const response = await api.post(`/visitor/${action}/${visitorId}`)
      setActionMessage(response.data.message || `Visitor ${action} successful`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${action} visitor.`)
    } finally {
      setActionId(null)
      setTimeout(() => setActionMessage(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium">Loading security checkpoint...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
        {error}
      </div>
    )
  }

  const waitingCount = stats?.waiting_visitors ?? 0
  const insideCount = stats?.inside_visitors ?? 0
  const todayTotal = stats?.today_visitors?.length ?? (visitors?.length || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Welcome back, Security
            </h1>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              Checkpoint Active
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor gate operations, verify passes, and manage visitor entries and exits.
          </p>
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <FiCalendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {currentTime.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          {actionMessage}
        </div>
      )}

      {/* PROMINENT SCAN QR HERO ACTION CARD & 3 METRIC CARDS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Prominent Scan QR Card */}
        <div className="rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-hover lg:col-span-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm shadow-inner mb-4">
              <FiCamera className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Scan Visitor QR Pass</h2>
            <p className="mt-1.5 text-xs text-blue-100 leading-relaxed max-w-sm">
              Instant camera scanning to verify approved visitor passes and process immediate check-ins or check-outs.
            </p>
          </div>

          <div className="mt-6 relative z-10">
            <Link
              to="/scan-qr"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-600 shadow-md transition hover:bg-blue-50 active:scale-[0.99]"
            >
              <FiCamera className="h-4 w-4" />
              <span>Launch QR Scanner</span>
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 3 Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
          {/* Card 1: Visitors Waiting */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-slate-300 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Visitors Waiting
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition dark:bg-amber-950/50 dark:text-amber-400">
                <FiClock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {waitingCount}
              </p>
              <p className="mt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Awaiting Check-in / Gate
              </p>
            </div>
          </div>

          {/* Card 2: Visitors Inside */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-slate-300 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Visitors Inside
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition dark:bg-emerald-950/50 dark:text-emerald-400">
                <FiUserCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {insideCount}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active on premises</span>
              </div>
            </div>
          </div>

          {/* Card 3: Today's Visitors */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-slate-300 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Today's Visitors
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition dark:bg-blue-950/50 dark:text-blue-400">
                <FiUsers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {todayTotal}
              </p>
              <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Total scheduled for today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY WORKFLOW INDICATOR */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Security Verification Workflow
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white flex-shrink-0">
              1
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">View Waiting</p>
              <p className="text-[10px] text-slate-400">Check queue arrivals</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white flex-shrink-0">
              2
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Scan QR</p>
              <p className="text-[10px] text-slate-400">Use gate camera scanner</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white flex-shrink-0">
              3
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Verify Visitor</p>
              <p className="text-[10px] text-slate-400">Match ID and host person</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-xs font-bold text-white flex-shrink-0">
              4
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Check In / Out</p>
              <p className="text-[10px] text-slate-400">Log entry & exit timestamp</p>
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S VISITOR LIST */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Visitor Checkpoint
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct verification and entry management
            </p>
          </div>
          <Link
            to="/visitors"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            All Visitors <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs dark:divide-slate-800">
            <thead className="bg-slate-50/75 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Person to Meet</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Check-in</th>
                <th className="px-5 py-3 font-semibold">Check-out</th>
                <th className="px-5 py-3 font-semibold text-right">Checkpoint Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visitors.length > 0 ? (
                visitors.map((visitor) => {
                  const isApproved = visitor.status === 'Approved'
                  const isInside = visitor.status === 'Checked-In'
                  const isCheckedOut = visitor.status === 'Checked-Out'
                  const isPending = visitor.status === 'Pending'

                  return (
                    <tr
                      key={visitor.id}
                      className="transition hover:bg-slate-50/75 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-bold">
                            {visitor.visitor_name ? visitor.visitor_name.slice(0, 1) : 'V'}
                          </div>
                          <div>
                            <p className="leading-tight">{visitor.visitor_name}</p>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {visitor.visitor_id || visitor.visitor_type || 'Visitor'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {visitor.mobile_number || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {visitor.person_to_meet || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isInside
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : isApproved
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : isCheckedOut
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isInside
                                ? 'bg-emerald-500'
                                : isApproved
                                ? 'bg-indigo-500'
                                : isPending
                                ? 'bg-amber-500'
                                : isCheckedOut
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {visitor.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {visitor.check_in_time ? formatIndiaDateTime(visitor.check_in_time) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {visitor.check_out_time ? formatIndiaDateTime(visitor.check_out_time) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isApproved && (
                          <button
                            type="button"
                            disabled={actionId === visitor.id}
                            onClick={() => handleAction(visitor.id, 'checkin')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <FiLogIn className="h-3 w-3" />
                            {actionId === visitor.id ? 'Checking In...' : 'Check-In'}
                          </button>
                        )}
                        {isInside && (
                          <button
                            type="button"
                            disabled={actionId === visitor.id}
                            onClick={() => handleAction(visitor.id, 'checkout')}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            <FiLogOut className="h-3 w-3" />
                            {actionId === visitor.id ? 'Checking Out...' : 'Check-Out'}
                          </button>
                        )}
                        {!isApproved && !isInside && (
                          <span className="text-[11px] text-slate-400">
                            {isCheckedOut ? 'Completed' : 'Pending Approval'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <FiInbox className="h-6 w-6 stroke-1" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      No visitors found for today.
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Incoming guests will appear here for gate verification.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
