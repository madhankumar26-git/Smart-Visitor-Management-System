import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import SecurityDashboard from './pages/SecurityDashboard'
import Visitors from './pages/Visitors'
import AddVisitor from './pages/AddVisitor'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import AccountSettings from './pages/AccountSettings'
import Analytics from './pages/Analytics'
import ScanQRCode from './pages/ScanQRCode'
import NotFound from './pages/NotFound'
import Error500 from './pages/Error500'
import CompanySettings from './pages/CompanySettings'
import ActivityLogs from './pages/ActivityLogs'
import Layout from './components/layout/Layout'

function ProtectedRoute({ element: Element, role, ...rest }) {
  const { user } = useAuth()
  if (!user?.token) {
    return <Navigate to="/login" replace />
  }
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Element {...rest} />
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user?.token) {
    return <Navigate to="/login" replace />
  }
  return <Navigate to={user.role === 'admin' ? '/admin' : '/security'} replace />
}

function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12 transition-colors">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 mb-6">
          <span className="text-2xl font-bold">403</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          Access Restricted
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Permission Denied
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          You do not have permission to view or administer this module. Please switch accounts or consult your security admin.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
          >
            Return to Allowed Area
          </a>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Switch Account
          </a>
        </div>
      </div>
    </div>
  )
}


export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="/admin" element={<Layout><ProtectedRoute element={AdminDashboard} role="admin" /></Layout>} />
          <Route path="/security" element={<Layout><ProtectedRoute element={SecurityDashboard} role="security" /></Layout>} />
          <Route path="/visitors" element={<Layout><ProtectedRoute element={Visitors} /></Layout>} />
          <Route path="/add-visitor" element={<Layout><ProtectedRoute element={AddVisitor} role="admin" /></Layout>} />
          <Route path="/reports" element={<Layout><ProtectedRoute element={Reports} role="admin" /></Layout>} />
          <Route path="/analytics" element={<Layout><ProtectedRoute element={Analytics} role="admin" /></Layout>} />
          <Route path="/scan-qr" element={<Layout><ProtectedRoute element={ScanQRCode} /></Layout>} />
          <Route path="/profile" element={<Layout><ProtectedRoute element={Profile} /></Layout>} />
          <Route path="/account-settings" element={<Layout><ProtectedRoute element={AccountSettings} role="admin" /></Layout>} />
          <Route path="/company-settings" element={<Layout><ProtectedRoute element={CompanySettings} role="admin" /></Layout>} />
          <Route path="/activity-logs" element={<Layout><ProtectedRoute element={ActivityLogs} role="admin" /></Layout>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/500" element={<Error500 />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  )
}
