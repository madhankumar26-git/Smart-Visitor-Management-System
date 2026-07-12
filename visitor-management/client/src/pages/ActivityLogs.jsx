import { useEffect, useState } from 'react'
import api from '../services/api'
import { formatIndiaDateTime } from '../utils/date'

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]); const [error, setError] = useState('')
  useEffect(() => { api.get('/admin/activity-logs').then(({ data }) => setLogs(data.logs || [])).catch((err) => setError(err.response?.data?.message || 'Unable to load activity history.')) }, [])
  return <div className="rounded-[32px] bg-white p-6 shadow-soft dark:bg-slate-900"><h2 className="text-xl font-semibold dark:text-white">Activity History</h2><p className="mt-1 text-sm text-textSecondary">Auditable security and visitor operations.</p>{error ? <p className="mt-5 text-sm text-rose-600">{error}</p> : <div className="mt-5 overflow-x-auto"><table className="min-w-[750px] w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-800"><tr>{['Timestamp', 'User', 'Role', 'Action', 'Details', 'IP Address'].map((item) => <th key={item} className="px-4 py-3 text-textSecondary">{item}</th>)}</tr></thead><tbody>{logs.length ? logs.map((log) => <tr key={log.id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-3 dark:text-white">{formatIndiaDateTime(log.created_at)}</td><td className="px-4 py-3 dark:text-white">{log.user_name}</td><td className="px-4 py-3 dark:text-white">{log.role}</td><td className="px-4 py-3 font-medium dark:text-white">{log.action}</td><td className="px-4 py-3 dark:text-white">{log.details || '—'}</td><td className="px-4 py-3 dark:text-white">{log.ip_address || '—'}</td></tr>) : <tr><td colSpan="6" className="px-4 py-8 text-center text-textSecondary">No activity has been recorded yet.</td></tr>}</tbody></table></div>}</div>
}
