import { NavLink } from 'react-router-dom'
import {
  FiHome,
  FiUsers,
  FiUserPlus,
  FiCamera,
  FiFileText,
  FiBarChart2,
  FiActivity,
  FiBriefcase,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
  FiShield,
} from 'react-icons/fi'

const ICONS = {
  Dashboard: FiHome,
  Visitors: FiUsers,
  'Add Visitor': FiUserPlus,
  'Scan QR': FiCamera,
  Reports: FiFileText,
  Analytics: FiBarChart2,
  'Activity Logs': FiActivity,
  'Company Settings': FiBriefcase,
  Profile: FiUser,
  'Account Settings': FiSettings,
}

export default function Sidebar({ user, navItems, logout, mobileOpen, setMobileOpen }) {
  const allowedItems = navItems.filter((item) => item.roles.includes(user?.role))

  // Separate common items and admin administration items for professional grouping
  const isSecurity = user?.role === 'security'

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col justify-between border-r border-slate-800 bg-[#0B132B] text-slate-200 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Header */}
        <div className="flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
                <FiShield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">Smart Visitor</h1>
                <p className="text-[11px] font-medium tracking-wide uppercase text-blue-400">Management System</p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Close sidebar"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Main Menu
            </div>
            {allowedItems.map((item) => {
              const Icon = ICONS[item.label] || FiUser
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer: User Profile & Logout */}
        <div className="border-t border-slate-800/80 bg-[#080E20] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-xs font-bold text-blue-400 border border-blue-500/30">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SV'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span className="truncate text-[11px] font-medium capitalize text-slate-400">
                  {user?.role || 'Guest'} Portal
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <FiLogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
