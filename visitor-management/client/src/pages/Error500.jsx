export default function Error500() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-10 shadow-soft text-center">
        <h1 className="text-5xl font-semibold text-textPrimary">500</h1>
        <p className="mt-4 text-lg text-textSecondary">An error occurred while loading the page.</p>
        <p className="mt-2 text-sm text-textSecondary">Please refresh or try again later.</p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="/" className="rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600">Return Home</a>
          <a href="/login" className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-textPrimary hover:bg-slate-50">Login</a>
        </div>
      </div>
    </div>
  )
}
