import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft, FiAlertOctagon } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12 transition-colors">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 mb-6">
          <FiAlertOctagon className="h-8 w-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          404 Error
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          The destination route or resource you are looking for does not exist or has been relocated.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
          >
            <FiHome className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Login Screen</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
