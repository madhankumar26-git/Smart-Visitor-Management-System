import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import {
  FiCamera,
  FiRotateCw,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiLogIn,
  FiLogOut,
  FiShield,
  FiHelpCircle,
} from 'react-icons/fi'
import api from '../services/api'
import { formatIndiaDate, formatIndiaDateTime } from '../utils/date'

export default function ScanQRCode() {
  const navigate = useNavigate()
  const [scanner, setScanner] = useState(null)
  const [visitor, setVisitor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isScanning, setIsScanning] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const readerRef = useRef(null)

  useEffect(() => {
    if (!readerRef.current) return

    const html5Qrcode = new Html5Qrcode('qr-reader')
    setScanner(html5Qrcode)

    html5Qrcode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (decodedText) {
            html5Qrcode.stop().catch(() => {})
            setIsScanning(false)
            handleScan(decodedText)
          }
        }
      )
      .catch(() => {
        setError('Unable to access camera. Please allow camera permissions in your browser.')
        setIsScanning(false)
      })

    return () => {
      html5Qrcode.stop().catch(() => {})
      html5Qrcode.clear().catch(() => {})
    }
  }, [])

  const handleScan = async (qrCode) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const response = await api.post('/visitor/scan', { qr_code: qrCode })
      setVisitor(response.data.visitor)
      setSuccess('Visitor pass verified successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or unverified visitor QR code.')
      setVisitor(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRestartScan = () => {
    setVisitor(null)
    setError('')
    setSuccess('')
    setIsScanning(true)
    if (scanner) {
      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (decodedText) {
              scanner.stop().catch(() => {})
              setIsScanning(false)
              handleScan(decodedText)
            }
          }
        )
        .catch(() => {
          setError('Camera error. Please ensure camera is not in use by another tab.')
          setIsScanning(false)
        })
    }
  }

  const handleVisitorAction = async (action) => {
    if (!visitor) return
    setActionLoading(true)
    setError('')
    try {
      const response = await api.post(`/visitor/${action}/${visitor.id}`)
      setVisitor(response.data.visitor)
      setSuccess(response.data.message || `Visitor ${action} completed!`)
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${action} visitor.`)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/visitors')}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <FiArrowLeft className="h-3.5 w-3.5" /> Back to Visitors
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            QR Pass Scanner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Scan physical or mobile QR passes for instant visitor validation and gate processing.
          </p>
        </div>
      </div>

      {/* Grid: Viewfinder Left, Details & Actions Right */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Viewfinder Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            {/* Viewfinder Container */}
            <div className="relative overflow-hidden rounded-xl bg-slate-950 min-h-[320px] flex items-center justify-center">
              <div id="qr-reader" ref={readerRef} className="w-full" />

              {/* Viewfinder Overlay Frame */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-56 w-56 rounded-2xl border-2 border-dashed border-blue-400/70 shadow-[0_0_0_9999px_rgba(15,23,42,0.4)]">
                    <span className="absolute -top-1 -left-1 h-5 w-5 border-t-4 border-l-4 border-blue-500 rounded-tl"></span>
                    <span className="absolute -top-1 -right-1 h-5 w-5 border-t-4 border-r-4 border-blue-500 rounded-tr"></span>
                    <span className="absolute -bottom-1 -left-1 h-5 w-5 border-b-4 border-l-4 border-blue-500 rounded-bl"></span>
                    <span className="absolute -bottom-1 -right-1 h-5 w-5 border-b-4 border-r-4 border-blue-500 rounded-br"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Status alerts */}
            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
                <FiAlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start gap-2">
                <FiCheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Scanner Controls */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleRestartScan}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <FiRotateCw className="h-3.5 w-3.5" />
                <span>Scan New Pass</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/visitors')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                View All Visitors
              </button>
            </div>
          </div>

          {/* Instructions card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              <FiHelpCircle className="h-4 w-4 text-blue-600" />
              Scanning Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>Position the visitor's printed or mobile QR pass inside the target frame.</li>
              <li>Hold steady until the scanner beeps or automatically stops.</li>
              <li>Review the loaded visitor details on the right.</li>
              <li>Click <strong>Check-In</strong> or <strong>Check-Out</strong> to log entry/exit.</li>
            </ol>
          </div>
        </div>

        {/* Results & Actions Column */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Visitor Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified credential data from scanned pass
                </p>
              </div>
              {visitor && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  {visitor.status}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-3" />
                <p className="text-xs font-medium">Validating QR code against database...</p>
              </div>
            ) : visitor ? (
              <div className="space-y-4">
                {/* Basic Details Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Visitor ID
                    </span>
                    <p className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {visitor.visitor_id || visitor.id}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Visitor Name
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {visitor.visitor_name}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Company
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {visitor.company_name || '—'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Person to Meet
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {visitor.person_to_meet || '—'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Department
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {visitor.department || '—'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Visit Date
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {formatIndiaDate(visitor.visit_date)}
                    </p>
                  </div>

                  <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Purpose of Visit
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {visitor.purpose || '—'}
                    </p>
                  </div>
                </div>

                {/* Gate Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Gate Processing Actions:
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {visitor.status !== 'Checked-In' && visitor.status !== 'Checked-Out' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleVisitorAction('checkin')}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        <FiLogIn className="h-4 w-4" />
                        <span>Process Check-In</span>
                      </button>
                    )}

                    {visitor.status === 'Checked-In' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleVisitorAction('checkout')}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        <FiLogOut className="h-4 w-4" />
                        <span>Process Check-Out</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3">
                  <FiCamera className="h-6 w-6 stroke-1" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Ready to scan pass
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                  Point the camera at any visitor pass QR code to inspect credentials and record entry or exit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
