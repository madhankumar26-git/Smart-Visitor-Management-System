import { useEffect, useState } from 'react'
import api from '../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      setError('')
      try {
        const [admin, visitors] = await Promise.all([
          api.get('/dashboard/admin'),
          api.get('/visitor/today'),
        ])
        setStats(admin.data)
        setRecent(visitors.data.visitors || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-textSecondary">Loading dashboard...</div>
  }

  if (error) {
    return <div className="p-8 rounded-[32px] bg-white text-center text-red-700">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Total Visitors Today</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{stats.today_visitors}</p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Checked-In Visitors</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{stats.checked_in_visitors}</p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Checked-Out Visitors</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{stats.checked_out_visitors}</p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Visitors Currently Inside</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{stats.visitors_inside}</p>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-textPrimary">Recent Visitors</h2>
            <p className="text-sm text-textSecondary">Latest arrivals for today.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Visit Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recent.map((visitor) => (
                <tr key={visitor.id}>
                  <td className="px-4 py-4">{visitor.visitor_name}</td>
                  <td className="px-4 py-4">{visitor.company_name || 'N/A'}</td>
                  <td className="px-4 py-4">{visitor.visit_date}</td>
                  <td className="px-4 py-4">{visitor.status}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-sm text-textSecondary">
                    No visitors found for today.
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
