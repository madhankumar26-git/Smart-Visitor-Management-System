import { useEffect, useMemo, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend)

const formatChartData = (labels, values, color) => ({
  labels,
  datasets: [
    {
      label: 'Count',
      data: values,
      backgroundColor: labels.map(() => color),
      borderColor: color,
      borderWidth: 1,
      tension: 0.3,
      fill: true,
    },
  ],
})

export default function Analytics() {
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

  const statusData = useMemo(() => {
    if (!analytics) return null
    return {
      labels: Object.keys(analytics.status_counts),
      datasets: [
        {
          data: Object.values(analytics.status_counts),
          backgroundColor: ['#3B82F6', '#10B981', '#64748B', '#F43F5E'],
        },
      ],
    }
  }, [analytics])

  const typeData = useMemo(() => {
    if (!analytics) return null
    return {
      labels: Object.keys(analytics.type_counts),
      datasets: [
        {
          data: Object.values(analytics.type_counts),
          backgroundColor: ['#2563EB', '#9333EA', '#F59E0B', '#14B8A6', '#EF4444'],
        },
      ],
    }
  }, [analytics])

  const departmentData = useMemo(() => {
    if (!analytics) return null
    return formatChartData(analytics.department_counts.map((item) => item.department), analytics.department_counts.map((item) => item.count), '#4F46E5')
  }, [analytics])

  const peakHoursData = useMemo(() => {
    if (!analytics) return null
    return formatChartData(analytics.peak_hours.map((item) => item.hour), analytics.peak_hours.map((item) => item.count), '#0EA5E9')
  }, [analytics])
  const dailyData = useMemo(() => analytics && formatChartData(analytics.daily_counts.map((item) => item.date), analytics.daily_counts.map((item) => item.count), '#2563EB'), [analytics])
  const monthlyData = useMemo(() => analytics && formatChartData(analytics.monthly_counts.map((item) => item.month), analytics.monthly_counts.map((item) => item.count), '#7C3AED'), [analytics])

  if (loading) {
    return <div className="rounded-[32px] bg-white p-6 shadow-soft text-center text-textSecondary">Loading analytics...</div>
  }

  if (error) {
    return <div className="rounded-[32px] bg-red-50 p-6 text-center text-red-700">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Total Visitors</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{analytics.total_visitors}</p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Today</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{analytics.today_visitors}</p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Last 7 Days</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{analytics.week_visitors}</p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">This Month</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{analytics.month_visitors}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[32px] bg-white p-6 shadow-soft dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-textPrimary dark:text-white">Visitors Per Day</h2>
          <p className="mt-2 text-sm text-textSecondary">Daily visitor volume across the last seven days.</p>
          <div className="mt-6"><Line data={dailyData} options={{ responsive: true, plugins: { legend: { display: false } } }} /></div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-textPrimary dark:text-white">Visitors Per Month</h2>
          <p className="mt-2 text-sm text-textSecondary">Rolling twelve-month visitor trend.</p>
          <div className="mt-6"><Bar data={monthlyData} options={{ responsive: true, plugins: { legend: { display: false } } }} /></div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-textPrimary">Status Overview</h2>
          <p className="mt-2 text-sm text-textSecondary">Visitor status breakdown for all records.</p>
          <div className="mt-6">
            <Doughnut data={statusData} />
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-textPrimary">Visitor Type Distribution</h2>
          <p className="mt-2 text-sm text-textSecondary">Visitor types by category.</p>
          <div className="mt-6">
            <Doughnut data={typeData} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-textPrimary">Department Activity</h2>
          <p className="mt-2 text-sm text-textSecondary">Visitor count grouped by department.</p>
          <div className="mt-6">
            <Bar data={departmentData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-textPrimary">Peak Check-In Hours</h2>
          <p className="mt-2 text-sm text-textSecondary">Traffic by hour in the last week.</p>
          <div className="mt-6">
            <Line data={peakHoursData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-textPrimary">Average Visit Duration</h2>
        <p className="mt-2 text-sm text-textSecondary">Minutes spent on-site per visitor.</p>
        <p className="mt-4 text-4xl font-semibold text-textPrimary">{analytics.average_visit_duration} mins</p>
      </div>
    </div>
  )
}
