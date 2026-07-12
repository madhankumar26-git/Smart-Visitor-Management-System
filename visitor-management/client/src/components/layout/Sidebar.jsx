import { NavLink } from 'react-router-dom'
import { FiHome, FiUsers, FiFileText, FiLogOut, FiUser, FiBarChart2, FiCamera, FiSettings, FiClock } from 'react-icons/fi'

const ICONS = {
  Dashboard: FiHome,
  Visitors: FiUsers,
  'Add Visitor': FiFileText,
  'Scan QR': FiCamera,
  Reports: FiFileText,
  Analytics: FiBarChart2,
  'Activity Logs': FiClock,
  'Company Settings': FiSettings,
  Profile: FiUser,
}

export default function Sidebar({ user, navItems, logout, location }) {
  return (
    <aside className="fixed left-0 top-0 z-20 h-full w-full max-w-xs bg-sidebar text-white shadow-soft md:w-72">
      <div className="px-6 py-8">
        <div className="mb-10">
          <div className="mb-2 text-xl font-bold">Smart Visitor</div>
          <p className="text-sm text-slate-200">Corporate access portal</p>
        </div>
        <div className="space-y-2">
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => {
              const Icon = ICONS[item.label] || FiUser
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                      isActive ? 'bg-white/10' : 'hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
        </div>
      </div>
      <div className="absolute bottom-0 w-full px-6 pb-6">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm transition hover:bg-white/20"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  )
}
