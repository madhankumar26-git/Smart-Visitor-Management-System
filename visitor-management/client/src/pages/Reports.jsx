import { useEffect, useMemo, useState } from 'react'
import jsPDF from 'jspdf'
import {
  FiFileText,
  FiDownload,
  FiCalendar,
  FiFilter,
  FiInbox,
  FiCheckCircle,
} from 'react-icons/fi'
import api from '../services/api'
import { formatIndiaDate, formatIndiaDateTime } from '../utils/date'

const formatDateTime = formatIndiaDateTime
const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

export default function Reports() {
  const [visitors, setVisitors] = useState([])
  const [range, setRange] = useState('today')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const params = range === 'custom' ? { start_date: startDate, end_date: endDate } : { range }
        const response = await api.get('/visitor/all', { params })
        setVisitors(response.data.visitors || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load report data.')
      } finally {
        setLoading(false)
      }
    }

    if (range !== 'custom' || (startDate && endDate)) {
      load()
    } else {
      setVisitors([])
      setLoading(false)
    }
  }, [range, startDate, endDate])

  const rows = useMemo(
    () =>
      visitors.map((visitor) => ({
        'Visitor ID': visitor.visitor_id || visitor.id,
        Name: visitor.visitor_name,
        Company: visitor.company_name || '—',
        Mobile: visitor.mobile_number || '—',
        'Person to Meet': visitor.person_to_meet || '—',
        Department: visitor.department || '—',
        Purpose: visitor.purpose || '—',
        'Visit Date': formatIndiaDate(visitor.visit_date),
        'Check-In Time': formatDateTime(visitor.check_in_time) || '—',
        'Check-Out Time': formatDateTime(visitor.check_out_time) || '—',
        Duration: visitor.duration || '—',
        Status: visitor.status,
      })),
    [visitors]
  )

  const exportExcel = () => {
    if (!rows.length) return
    const csv = [
      Object.keys(rows[0]).map(csvEscape).join(','),
      ...rows.map((row) => Object.values(row).map(csvEscape).join(',')),
    ].join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    link.download = `visitor-report-${range}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportPdf = () => {
    if (!rows.length) return
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(16)
    doc.text('Smart Visitor Management System - Visitor Log Report', 14, 16)
    doc.setFontSize(9)
    doc.text(`Generated: ${new Date().toLocaleString()} | Filter: ${range}`, 14, 23)
    doc.setFontSize(8)
    let y = 32
    rows.forEach((row, index) => {
      if (y > 190) {
        doc.addPage()
        y = 20
      }
      doc.text(
        `${index + 1}. ${row.Name} | Co: ${row.Company} | Host: ${row['Person to Meet']} | Date: ${row['Visit Date']} | In: ${row['Check-In Time']} | Out: ${row['Check-Out Time']} | ${row.Status}`,
        14,
        y
      )
      y += 8
    })
    doc.save(`visitor-report-${range}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Visitor Reports & Exports
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generate historical visitor logs, audit records, and export compliant datasets.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              disabled={!rows.length}
              onClick={exportExcel}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40"
            >
              <FiDownload className="h-3.5 w-3.5" />
              Export Excel (CSV)
            </button>
            <button
              disabled={!rows.length}
              onClick={exportPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40"
            >
              <FiFileText className="h-3.5 w-3.5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <FiFilter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-8 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="today">Today's Visits</option>
              <option value="yesterday">Yesterday's Visits</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {range === 'custom' && (
            <>
              <div className="relative">
                <FiCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="relative">
                <FiCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Report Records Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {loading ? (
              'Querying visitor records...'
            ) : (
              <span>
                Found <strong className="text-blue-600 dark:text-blue-400">{visitors.length}</strong> records for selected filter
              </span>
            )}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs dark:divide-slate-800">
            <thead className="bg-slate-50/75 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Visitor Name</th>
                <th className="px-5 py-3.5 font-semibold">Company</th>
                <th className="px-5 py-3.5 font-semibold">Host / Meet</th>
                <th className="px-5 py-3.5 font-semibold">Visit Date</th>
                <th className="px-5 py-3.5 font-semibold">Check-In</th>
                <th className="px-5 py-3.5 font-semibold">Check-Out</th>
                <th className="px-5 py-3.5 font-semibold">Duration</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
                    <p className="text-xs">Generating report...</p>
                  </td>
                </tr>
              ) : visitors.length > 0 ? (
                visitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className="transition hover:bg-slate-50/75 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {visitor.visitor_name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {visitor.company_name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {visitor.person_to_meet || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatIndiaDate(visitor.visit_date)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDateTime(visitor.check_in_time) || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {formatDateTime(visitor.check_out_time) || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                      {visitor.duration || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {visitor.status}
                      </span>
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
                      No records found for the selected range.
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Select another range or expand the custom start/end dates.
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
