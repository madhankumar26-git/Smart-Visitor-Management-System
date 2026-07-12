import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const navItems = [
  { label: 'Dashboard', path: '/admin', roles: ['admin'] },
  { label: 'Dashboard', path: '/security', roles: ['security'] },
  { label: 'Visitors', path: '/visitors', roles: ['admin', 'security'] },
  { label: 'Add Visitor', path: '/add-visitor', roles: ['admin'] },
  { label: 'Scan QR', path: '/scan-qr', roles: ['admin', 'security'] },
  { label: 'Reports', path: '/reports', roles: ['admin'] },
  { label: 'Analytics', path: '/analytics', roles: ['admin'] },
  { label: 'Activity Logs', path: '/activity-logs', roles: ['admin'] },
  { label: 'Company Settings', path: '/company-settings', roles: ['admin'] },
  { label: 'Profile', path: '/profile', roles: ['admin', 'security'] },
  { label: 'Account Settings', path: '/account-settings', roles: ['admin'] },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background text-textPrimary dark:bg-slate-950 dark:text-slate-100">
      <Sidebar user={user} navItems={navItems} logout={logout} location={location} />
      <div className="ml-0 md:ml-72 transition-all duration-300">
        <Navbar user={user} />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
