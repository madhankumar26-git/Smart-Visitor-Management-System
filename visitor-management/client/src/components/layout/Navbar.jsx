import { useEffect, useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'
import socket from '../../services/socket'
import { formatIndiaDateTime } from '../../utils/date'

export default function Navbar({ user }) {
  const { theme, toggleTheme } = useTheme()
  const [company, setCompany] = useState({ company_name: 'Smart Visitor', company_logo: '' })
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = notifications.filter((item) => !item.is_read).length

  const loadNotifications = () => api.get('/admin/notifications').then(({ data }) => setNotifications(data.notifications || [])).catch(() => {})
  useEffect(() => { api.get('/auth/company').then(({ data }) => setCompany(data.settings || company)).catch(() => {}) }, [])
  useEffect(() => {
    loadNotifications()
    if (!socket.connected && user?.token) { socket.auth = { token: user.token }; socket.connect() }
    const onNotification = (item) => setNotifications((current) => [{ ...item, is_read: false }, ...current].slice(0, 30))
    socket.on('notification', onNotification)
    return () => socket.off('notification', onNotification)
  }, [user?.token])

  const markRead = async (notification) => {
    if (notification.is_read) return
    try { await api.post(`/admin/notifications/${notification.id}/read`); setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, is_read: true } : item)) } catch {}
  }
  const markAllRead = async () => {
    try { await api.post('/admin/notifications/read-all'); setNotifications((items) => items.map((item) => ({ ...item, is_read: true }))) } catch {}
  }

  return <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
    <div className="flex flex-col items-start justify-between gap-4 px-6 py-4 md:flex-row md:items-center">
      <div className="flex items-center gap-3">{company.company_logo && <img src={company.company_logo} alt="Company logo" className="h-10 w-10 rounded-xl object-cover" />}<div><p className="text-xs font-semibold uppercase tracking-wide text-primary">{company.company_name}</p><h1 className="text-xl font-semibold text-textPrimary dark:text-slate-100">Welcome back, {user?.name ?? 'Guest'}</h1><p className="text-sm text-textSecondary dark:text-slate-300">{formatIndiaDateTime(new Date().toISOString())} IST</p>{user?.last_login && <p className="mt-1 text-xs text-slate-400">Last login: {formatIndiaDateTime(user.last_login)}</p>}</div></div>
      <div className="flex items-center gap-3"><div className="relative"><button type="button" onClick={() => setShowNotifications(!showNotifications)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">Notifications{unreadCount ? <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">{unreadCount}</span> : ''}</button>{showNotifications && <div className="absolute right-0 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between px-3 py-2"><span className="text-xs font-semibold uppercase text-textSecondary">Notifications</span><button type="button" onClick={markAllRead} disabled={!unreadCount} className="text-xs font-semibold text-primary disabled:opacity-40">Mark all as read</button></div>{notifications.length ? notifications.map((item) => <button type="button" key={item.id} onClick={() => markRead(item)} className={`w-full border-b border-slate-100 px-3 py-3 text-left last:border-0 dark:border-slate-800 ${item.is_read ? 'opacity-60' : 'bg-blue-50 dark:bg-blue-950/30'}`}><p className="text-sm font-semibold dark:text-white">{item.title}</p><p className="mt-1 text-xs text-textSecondary">{item.message}</p><p className="mt-1 text-xs text-slate-400">{formatIndiaDateTime(item.created_at)}</p></button>) : <p className="px-3 py-6 text-center text-sm text-textSecondary">No notifications yet.</p>}</div>}</div><button type="button" onClick={toggleTheme} className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button><div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">Role: {user?.role ?? 'none'}</div></div>
    </div>
  </div>
}
