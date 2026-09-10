import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiUserPlus,
  FiCamera,
  FiFileText,
  FiSettings,
  FiArrowUpRight,
  FiCalendar,
  FiInbox,
  FiChevronRight,
  FiEye,
} from 'react-icons/fi'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import api from '../services/api'
import { formatIndiaDate, formatIndiaDateTime } from '../utils/date'
import { useTheme } from '../context/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

export default function AdminDashboard() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Dynamic live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchDashboard = async () => {
      setError('')
      try {
        const [adminRes, visitorsRes, analyticsRes] = await Promise.allSettled([
          api.get('/dashboard/admin'),
          api.get('/visitor/today'),
          api.get('/dashboard/analytics'),
        ])

        if (adminRes.status === 'fulfilled') {
          setStats(adminRes.value.data)
        } else {
          throw new Error(adminRes.reason?.response?.data?.message || 'Unable to load dashboard data.')
        }

        if (visitorsRes.status === 'fulfilled') {
          setRecent(visitorsRes.value.data.visitors || [])
        }

        if (analyticsRes.status === 'fulfilled') {
          setAnalytics(analyticsRes.value.data.analytics)
        }
      } catch (err) {
        setError(err.message || 'Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning, Admin 👋'
    if (hour < 17) return 'Good Afternoon, Admin 👋'
    return 'Good Evening, Admin 👋'
  }, [currentTime])

  // Chart data configuration for Visitor Activity
  const activityChartData = useMemo(() => {
    if (!analytics?.daily_counts?.length) {
      return null
    }

    const isDark = theme === 'dark'
    const labels = analytics.daily_counts.map((item) => item.date)
    const dataPoints = analytics.daily_counts.map((item) => item.count)

    return {
      labels,
      datasets: [
        {
          label: 'Visitors',
          data: dataPoints,
          borderColor: '#2563EB',
          backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#2563EB',
          pointBorderColor: isDark ? '#0F172A' : '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }
  }, [analytics, theme])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1E293B' : '#0F172A',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: theme === 'dark' ? '#94A3B8' : '#64748B',
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(226, 232, 240, 0.8)',
        },
        ticks: {
          precision: 0,
          color: theme === 'dark' ? '#94A3B8' : '#64748B',
          font: { size: 11 },
        },
      },
    },
  }

  // Status breakdown calculations
  const statusOverview = useMemo(() => {
    const inside = stats?.visitors_inside ?? 0
    const checkedOut = stats?.checked_out_visitors ?? 0
    const checkedIn = stats?.checked_in_visitors ?? 0
    const total = stats?.today_visitors ?? 0
    const waiting = Math.max(0, total - (checkedIn + checkedOut))

    return [
      {
        label: 'Currently Inside',
        count: inside,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
      },
      {
        label: 'Checked Out',
        count: checkedOut,
        color: 'bg-blue-500',
        textColor: 'text-blue-700 dark:text-blue-400',
        bgLight: 'bg-blue-50 dark:bg-blue-950/30',
      },
      {
        label: 'Waiting / Pending',
        count: waiting,
        color: 'bg-amber-500',
        textColor: 'text-amber-700 dark:text-amber-400',
        bgLight: 'bg-amber-50 dark:bg-amber-950/30',
      },
      {
        label: 'Total Expected',
        count: total,
        color: 'bg-slate-400',
        textColor: 'text-slate-700 dark:text-slate-300',
        bgLight: 'bg-slate-100 dark:bg-slate-800',
      },
    ]
  }, [stats])

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium">Loading dashboard...</p>
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

  return (
    <div className="space-y-6">
      {/* Header with Greeting and Date/Time */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {greeting}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here's what's happening with your visitors today.
          </p>
        </div>

        {/* Dynamic Date and Live Time Display */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <FiCalendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <div className="text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentTime.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="mx-1.5 text-slate-300 dark:text-slate-600">|</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              {currentTime.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Modern Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Visitors */}
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-slate-300 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Visitors
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/50 dark:text-blue-400">
              <FiUsers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats?.today_visitors ?? 0}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400">
              <FiArrowUpRight className="h-3.5 w-3.5" />
              Active
            </span>
            <span>from yesterday</span>
          </div>
        </div>

        {/* Card 2: Checked In */}
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-slate-300 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Checked In
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/50 dark:text-emerald-400">
              <FiUserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats?.checked_in_visitors ?? 0}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center font-semibold text-emerald-600 dark:text-emerald-400">
              <FiArrowUpRight className="h-3.5 w-3.5" />
              Processed
            </span>
            <span>from yesterday</span>
          </div>
        </div>

        {/* Card 3: Checked Out */}
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-slate-300 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Checked Out
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-slate-800 group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
              <FiUserX className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats?.checked_out_visitors ?? 0}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center font-semibold text-slate-600 dark:text-slate-300">
              Departed
            </span>
            <span>from yesterday</span>
          </div>
        </div>

        {/* Card 4: Currently Inside */}
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all hover:border-slate-300 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Currently Inside
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-600 group-hover:text-white dark:bg-amber-950/50 dark:text-amber-400">
              <FiClock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats?.visitors_inside ?? 0}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">On Premises</span>
            <span>now</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Section 1 (Visitor Activity) & Section 2 (Visitor Status Overview) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SECTION 1: Visitor Activity Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Visitor Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visitor traffic trend over the past 7 days
              </p>
            </div>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Full Analytics <FiChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            {activityChartData ? (
              <Line data={activityChartData} options={chartOptions} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <FiInbox className="h-10 w-10 stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  No activity data recorded yet
                </p>
                <p className="text-[11px] text-slate-400">
                  Visitor statistics will be visualized once entries are logged
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Visitor Status Overview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Visitor Status Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live status breakdown for today
            </p>

            <div className="mt-5 space-y-3.5">
              {statusOverview.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`}></span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                  <span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${item.bgLight} ${item.textColor}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Link
              to="/visitors"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Manage All Visitors <FiChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 3: Quick Actions */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            to="/add-visitor"
            className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-card transition hover:border-blue-500 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/50 dark:text-blue-400">
              <FiUserPlus className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Add Visitor
            </span>
            <span className="text-[11px] text-slate-400">Pre-register entry</span>
          </Link>

          <Link
            to="/scan-qr"
            className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-card transition hover:border-blue-500 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/50 dark:text-emerald-400">
              <FiCamera className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Scan QR
            </span>
            <span className="text-[11px] text-slate-400">Quick pass check-in</span>
          </Link>

          <Link
            to="/reports"
            className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-card transition hover:border-blue-500 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/50 dark:text-indigo-400">
              <FiFileText className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Reports
            </span>
            <span className="text-[11px] text-slate-400">Export PDF / Excel</span>
          </Link>

          <Link
            to="/company-settings"
            className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-card transition hover:border-blue-500 hover:shadow-hover dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:scale-110 group-hover:bg-slate-800 group-hover:text-white dark:bg-slate-800 dark:text-slate-300">
              <FiSettings className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Settings
            </span>
            <span className="text-[11px] text-slate-400">Brand & system config</span>
          </Link>
        </div>
      </div>

      {/* SECTION 4: Recent Visitors Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Visitors
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest arrivals and check-ins recorded today
            </p>
          </div>
          <Link
            to="/visitors"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            View All Visitors <FiChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs dark:divide-slate-800">
            <thead className="bg-slate-50/75 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Company</th>
                <th className="px-5 py-3 font-semibold">Person to Meet</th>
                <th className="px-5 py-3 font-semibold">Check In</th>
                <th className="px-5 py-3 font-semibold">Check Out</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.length > 0 ? (
                recent.map((visitor, idx) => {
                  const isInside = visitor.status === 'Checked-In'
                  const isCheckedOut = visitor.status === 'Checked-Out'
                  const isWaiting = visitor.status === 'Pending' || visitor.status === 'Approved'

                  return (
                    <tr
                      key={visitor.id}
                      className="transition hover:bg-slate-50/75 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
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
                        {visitor.check_in_time ? formatIndiaDateTime(visitor.check_in_time) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {visitor.check_out_time ? formatIndiaDateTime(visitor.check_out_time) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isInside
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : isCheckedOut
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              : isWaiting
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isInside
                                ? 'bg-emerald-500'
                                : isCheckedOut
                                ? 'bg-blue-500'
                                : isWaiting
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {isInside ? 'Inside' : isCheckedOut ? 'Checked Out' : isWaiting ? 'Waiting' : visitor.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => navigate('/visitors')}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <FiEye className="h-3 w-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <FiInbox className="h-6 w-6 stroke-1" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      No visitors found for today.
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Visitor records will appear here when someone checks in.
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
