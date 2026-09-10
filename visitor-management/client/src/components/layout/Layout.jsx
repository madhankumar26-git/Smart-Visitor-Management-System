import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col antialiased">
      {/* Sidebar (Desktop fixed 72 & Mobile Drawer) */}
      <Sidebar
        user={user}
        navItems={navItems}
        logout={logout}
        location={location}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col transition-all duration-300 md:ml-72 min-h-screen">
        <Navbar
          user={user}
          onToggleSidebar={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
