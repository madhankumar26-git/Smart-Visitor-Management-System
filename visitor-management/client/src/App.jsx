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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-10 shadow-soft text-center">
        <h1 className="text-5xl font-semibold text-textPrimary">403</h1>
        <p className="mt-4 text-lg text-textSecondary">You do not have permission to access this page.</p>
        <p className="mt-2 text-sm text-textSecondary">Please contact your administrator or sign in with a different account.</p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="/" className="rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600">Return Home</a>
          <a href="/login" className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-textPrimary hover:bg-slate-50">Login</a>
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
