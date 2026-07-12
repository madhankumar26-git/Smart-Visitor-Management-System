import { useEffect, useState } from 'react'
import api from '../services/api'

export default function SecurityDashboard() {
  const [stats, setStats] = useState(null)
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
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
        setError(err.response?.data?.message || 'Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-textSecondary">Loading dashboard...</div>
  }

  if (error) {
    return <div className="p-8 rounded-[32px] bg-white text-center text-red-700">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Visitors Waiting</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{stats.waiting_visitors}</p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Visitors Inside</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{stats.inside_visitors}</p>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <span className="text-sm text-textSecondary">Today's Visitors</span>
          <p className="mt-4 text-3xl font-semibold text-textPrimary">{stats.today_visitors?.length ?? 0}</p>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-textPrimary">Visitor List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Person to Meet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td className="px-4 py-4">{visitor.visitor_name}</td>
                  <td className="px-4 py-4">{visitor.mobile_number}</td>
                  <td className="px-4 py-4">{visitor.status}</td>
                  <td className="px-4 py-4">{visitor.person_to_meet}</td>
                </tr>
              ))}
              {visitors.length === 0 && (
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
