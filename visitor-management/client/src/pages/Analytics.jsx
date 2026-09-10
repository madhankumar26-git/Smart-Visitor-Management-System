import { useEffect, useMemo, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiPieChart,
  FiBarChart2,
  FiLayers,
} from 'react-icons/fi'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

export default function Analytics() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      setError('')
      try {
        const response = await api.get('/dashboard/analytics')
        setAnalytics(response.data.analytics)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load analytics data.')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const commonOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? '#1E293B' : '#0F172A',
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: isDark ? '#94A3B8' : '#64748B', font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(226,232,240,0.8)' },
          ticks: { precision: 0, color: isDark ? '#94A3B8' : '#64748B', font: { size: 11 } },
        },
      },
    }),
    [isDark]
  )

  const dailyData = useMemo(() => {
    if (!analytics?.daily_counts?.length) return null
    return {
      labels: analytics.daily_counts.map((item) => item.date),
      datasets: [
        {
          label: 'Visitors',
          data: analytics.daily_counts.map((item) => item.count),
          borderColor: '#2563EB',
          backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#2563EB',
          pointRadius: 4,
        },
      ],
    }
  }, [analytics, isDark])

  const monthlyData = useMemo(() => {
    if (!analytics?.monthly_counts?.length) return null
    return {
      labels: analytics.monthly_counts.map((item) => item.month),
      datasets: [
        {
          label: 'Visitors',
          data: analytics.monthly_counts.map((item) => item.count),
          backgroundColor: '#4F46E5',
          borderRadius: 6,
        },
      ],
    }
  }, [analytics])

  const statusData = useMemo(() => {
    if (!analytics?.status_counts) return null
    return {
      labels: Object.keys(analytics.status_counts),
      datasets: [
        {
          data: Object.values(analytics.status_counts),
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E'],
          borderWidth: 0,
        },
      ],
    }
  }, [analytics])

  const typeData = useMemo(() => {
    if (!analytics?.type_counts) return null
    return {
      labels: Object.keys(analytics.type_counts),
      datasets: [
        {
          data: Object.values(analytics.type_counts),
          backgroundColor: ['#2563EB', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'],
          borderWidth: 0,
        },
      ],
    }
  }, [analytics])

  const departmentData = useMemo(() => {
    if (!analytics?.department_counts?.length) return null
    return {
      labels: analytics.department_counts.map((item) => item.department),
      datasets: [
        {
          label: 'Visitors',
          data: analytics.department_counts.map((item) => item.count),
          backgroundColor: '#0EA5E9',
          borderRadius: 6,
        },
      ],
    }
  }, [analytics])

  const peakHoursData = useMemo(() => {
    if (!analytics?.peak_hours?.length) return null
    return {
      labels: analytics.peak_hours.map((item) => item.hour),
      datasets: [
        {
          label: 'Visitors',
          data: analytics.peak_hours.map((item) => item.count),
          borderColor: '#10B981',
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointBackgroundColor: '#10B981',
        },
      ],
    }
  }, [analytics, isDark])

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium">Aggregating facility intelligence...</p>
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Analytics & Insights
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive metrics, duration insights, and trends across all departments.
        </p>
      </div>

      {/* 4 Metrics + Average Duration */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Visitors
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FiUsers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.total_visitors}
          </p>
          <span className="text-[11px] text-slate-400">All-time count</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Today
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <FiCalendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.today_visitors}
          </p>
          <span className="text-[11px] text-slate-400">Active today</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Last 7 Days
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <FiTrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.week_visitors}
          </p>
          <span className="text-[11px] text-slate-400">Trailing week</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              This Month
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <FiBarChart2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.month_visitors}
          </p>
          <span className="text-[11px] text-slate-400">Current calendar month</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg Duration
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <FiClock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.average_visit_duration || 0} <span className="text-xs font-normal text-slate-400">mins</span>
          </p>
          <span className="text-[11px] text-slate-400">On-site dwell time</span>
        </div>
      </div>

      {/* Chart Grid: Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Visitors Per Day (Last 7 Days)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daily visitor traffic patterns over the recent period
          </p>
          <div className="mt-4 h-64">
            {dailyData ? (
              <Line data={dailyData} options={commonOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No data</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Visitors Per Month (Rolling 12-Month)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Macro-level check-in volume trends
          </p>
          <div className="mt-4 h-64">
            {monthlyData ? (
              <Bar data={monthlyData} options={commonOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No data</div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Grid: Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Visitor Status Distribution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            All-time status distribution of visits
          </p>
          <div className="mt-4 h-64 flex items-center justify-center">
            {statusData ? (
              <Doughnut
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: isDark ? '#E2E8F0' : '#1E293B', font: { size: 11 } },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-xs text-slate-400">No status data</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Visitor Type Categorization
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Breakdown across guest, vendor, delivery and employees
          </p>
          <div className="mt-4 h-64 flex items-center justify-center">
            {typeData ? (
              <Doughnut
                data={typeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: isDark ? '#E2E8F0' : '#1E293B', font: { size: 11 } },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-xs text-slate-400">No type data</div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Grid: Row 3 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Department Activity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visitor volume grouped by recipient department
          </p>
          <div className="mt-4 h-64">
            {departmentData ? (
              <Bar data={departmentData} options={commonOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No department data</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Peak Arrival Hours
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gate check-in volume by time of day
          </p>
          <div className="mt-4 h-64">
            {peakHoursData ? (
              <Line data={peakHoursData} options={commonOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No peak hours data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
