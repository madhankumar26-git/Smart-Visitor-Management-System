import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiCheck,
  FiShield,
  FiClock,
  FiUser,
} from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'
import socket from '../../services/socket'
import { formatIndiaDateTime } from '../../utils/date'

export default function Navbar({ user, onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [company, setCompany] = useState({ company_name: 'Smart Visitor', company_logo: '' })
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const notifRef = useRef(null)

  const unreadCount = notifications.filter((item) => !item.is_read).length

  const loadNotifications = () =>
    api
      .get('/admin/notifications')
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => {})

  useEffect(() => {
    api
      .get('/auth/company')
      .then(({ data }) => setCompany(data.settings || company))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadNotifications()
    if (!socket.connected && user?.token) {
      socket.auth = { token: user.token }
      socket.connect()
    }
    const onNotification = (item) =>
      setNotifications((current) => [{ ...item, is_read: false }, ...current].slice(0, 30))
    socket.on('notification', onNotification)
    return () => socket.off('notification', onNotification)
  }, [user?.token])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markRead = async (notification) => {
    if (notification.is_read) return
    try {
      await api.post(`/admin/notifications/${notification.id}/read`)
      setNotifications((items) =>
        items.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item))
      )
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.post('/admin/notifications/read-all')
      setNotifications((items) => items.map((item) => ({ ...item, is_read: true })))
    } catch {}
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/visitors?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center gap-3 md:gap-6">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle navigation menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          {/* Search field */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visitors, companies..."
              className="h-9 w-64 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 transition-all focus:w-80 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
            />
          </form>
        </div>

        {/* Right Side: Quick Info, Dark Mode, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <FiSun className="h-4 w-4 text-amber-400" />
            ) : (
              <FiMoon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Notifications"
            >
              <FiBell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                  {notifications.length ? (
                    notifications.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => markRead(item)}
                        className={`w-full p-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          item.is_read
                            ? 'opacity-60 bg-white dark:bg-slate-900'
                            : 'bg-blue-50/50 dark:bg-blue-950/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </p>
                          {!item.is_read && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {item.message}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                          <FiClock className="h-3 w-3" />
                          {formatIndiaDateTime(item.created_at)}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5"></div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SV'}
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-xs font-semibold leading-none text-slate-900 dark:text-slate-100">
                {user?.name || 'Authorized User'}
              </p>
              <p className="mt-1 text-[10px] font-medium capitalize text-slate-500 dark:text-slate-400">
                {user?.role || 'Guest'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
