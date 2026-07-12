import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-10 shadow-soft text-center">
        <h1 className="text-5xl font-semibold text-textPrimary">404</h1>
        <p className="mt-4 text-lg text-textSecondary">The page you are looking for could not be found.</p>
        <Link to="/login" className="mt-8 inline-flex rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600">
          Back to Login
        </Link>
      </div>
    </div>
  )
}
